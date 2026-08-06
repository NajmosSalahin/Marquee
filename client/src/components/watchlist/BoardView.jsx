import { useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  pointerWithin,
  rectIntersection,
  useDroppable,
  DragOverlay,
} from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import ItemCard from './ItemCard.jsx'
import { STATUSES, STATUS_LABELS } from '../../lib/constants.js'
import { reorderItems } from '../../api/items.js'

const collisionDetectionPriority = (args) => {
  const pointer = pointerWithin(args)
  if (pointer.length) return pointer
  const rect = rectIntersection(args)
  if (rect.length) return rect
  return closestCorners(args)
}

function SortableCard({ item, onItemClick, justDragged }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item._id,
    data: { item },
  })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={`select-none touch-none ${isDragging ? 'relative z-10 opacity-60' : ''}`}
    >
      <ItemCard
        item={item}
        onClick={() => {
          if (!justDragged.current) onItemClick(item)
        }}
      />
    </div>
  )
}

function Column({ status, label, items, onItemClick, empty, justDragged }) {
  const { setNodeRef, isOver } = useDroppable({ id: status.id })
  return (
    <section
      ref={setNodeRef}
      className={`flex w-56 shrink-0 flex-col rounded-xl border ${isOver ? 'border-accent/60 bg-accent/5' : 'border-line bg-surface/50'} transition-colors duration-150`}
    >
      <header className="flex items-center justify-between px-3 py-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted">{label}</h3>
        <span className="font-mono text-xs text-muted/70">{items.length}</span>
      </header>
      <div
        className="flex flex-1 flex-col gap-3 overflow-y-auto px-3 pb-3"
        style={{ maxHeight: 'calc(100vh - 17rem)' }}
      >
        {items.length === 0 && (
          <p className="rounded-lg border border-dashed border-line px-3 py-4 text-center text-xs text-muted/60">
            {empty}
          </p>
        )}
        <SortableContext items={items.map((i) => i._id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <SortableCard
              key={item._id}
              item={item}
              onItemClick={onItemClick}
              justDragged={justDragged}
            />
          ))}
        </SortableContext>
      </div>
    </section>
  )
}

export default function BoardView({ itemsByStatus, onItemClick, statusLabels = STATUS_LABELS }) {
  const queryClient = useQueryClient()
  const [activeItem, setActiveItem] = useState(null)
  const justDragged = useRef(false)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const mutation = useMutation({
    mutationFn: reorderItems,
    onError: (err) => {
      toast.error(err.friendlyMessage)
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })

  const handleDragStart = (e) => setActiveItem(e.active.data.current?.item || null)

  const markDragged = () => {
    justDragged.current = true
    window.setTimeout(() => {
      justDragged.current = false
    }, 300)
  }

  const handleDragCancel = () => {
    setActiveItem(null)
    markDragged()
  }

  const handleDragEnd = (e) => {
    setActiveItem(null)
    markDragged()
    const { active, over, collisions } = e

    const items = queryClient.getQueryData(['items']) || []
    const dragged = items.find((i) => i._id === active.id)
    if (!dragged) {
      toast.error('Could not move that title — refresh and try again')
      return
    }

    const target = over?.id ?? collisions?.[0]?.id ?? null
    if (!target) {
      toast('Release the card on a column to move it')
      return
    }
    if (target === dragged._id) return

    const byStatus = (status) => items.filter((i) => i.status === status)

    const overIsColumn = STATUSES.some((s) => s.id === target)
    let toStatus
    let toIndex
    if (overIsColumn) {
      toStatus = target
      toIndex = byStatus(target).length
    } else {
      const overItem = items.find((i) => i._id === target)
      if (!overItem) return
      toStatus = overItem.status
      toIndex = byStatus(overItem.status).findIndex((i) => i._id === target)
    }

    const oldStatus = dragged.status
    const list = items.map((i) => ({ ...i }))
    const draggedIdx = list.findIndex((i) => i._id === active.id)
    const [moved] = list.splice(draggedIdx, 1)
    moved.status = toStatus

    const destIndices = list.reduce(
      (acc, i, idx) => (i.status === toStatus ? [...acc, idx] : acc),
      []
    )
    const insertAt =
      destIndices.length === 0
        ? list.length
        : toIndex >= destIndices.length
          ? destIndices[destIndices.length - 1] + 1
          : destIndices[toIndex]
    list.splice(insertAt, 0, moved)

    const affectedStatuses = new Set([oldStatus, toStatus])
    const perColumn = {}
    const updated = list.map((i) => {
      if (!affectedStatuses.has(i.status)) return i
      perColumn[i.status] = (perColumn[i.status] ?? 0) + 1
      return { ...i, order: perColumn[i.status] * 10 }
    })

    queryClient.setQueryData(['items'], updated)

    mutation.mutate(
      updated
        .filter((i) => affectedStatuses.has(i.status))
        .map((i) => ({ id: i._id, status: i.status, order: i.order }))
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetectionPriority}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-4 overflow-x-auto pb-4" aria-label="Board">
        {STATUSES.map((status) => (
          <Column
            key={status.id}
            status={status}
            label={statusLabels[status.id] || status.label}
            items={itemsByStatus[status.id] || []}
            onItemClick={onItemClick}
            empty="Drag titles here"
            justDragged={justDragged}
          />
        ))}
      </div>
      <DragOverlay>
        {activeItem ? (
          <div className="w-52 opacity-95">
            <ItemCard item={activeItem} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
