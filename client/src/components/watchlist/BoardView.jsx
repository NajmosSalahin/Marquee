import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ItemCard from './ItemCard.jsx';
import { STATUSES } from '../../lib/constants.js';
import { reorderItems } from '../../api/items.js';

function SortableCard({ item, onItemClick }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item._id,
    data: { item },
  });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={isDragging ? 'relative z-10 opacity-60' : ''}
    >
      <ItemCard item={item} onClick={() => onItemClick(item)} />
    </div>
  );
}

function Column({ status, items, onItemClick, empty }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <section
      ref={setNodeRef}
      className={`flex w-56 shrink-0 flex-col rounded-xl border ${isOver ? 'border-accent/60 bg-accent/5' : 'border-line bg-surface/50'} transition-colors duration-150`}
    >
      <header className="flex items-center justify-between px-3 py-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted">{status.label}</h3>
        <span className="font-mono text-xs text-muted/70">{items.length}</span>
      </header>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-3 pb-3" style={{ maxHeight: 'calc(100vh - 17rem)' }}>
        {items.length === 0 && (
          <p className="rounded-lg border border-dashed border-line px-3 py-4 text-center text-xs text-muted/60">
            {empty}
          </p>
        )}
        <SortableContext items={items.map((i) => i._id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <SortableCard key={item._id} item={item} onItemClick={onItemClick} />
          ))}
        </SortableContext>
      </div>
    </section>
  );
}

export default function BoardView({ itemsByStatus, onItemClick }) {
  const queryClient = useQueryClient();
  const [activeItem, setActiveItem] = useState(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const mutation = useMutation({
    mutationFn: reorderItems,
    onError: (err) => {
      toast.error(err.friendlyMessage);
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });

  const handleDragStart = (e) => setActiveItem(e.active.data.current?.item || null);

  const handleDragEnd = (e) => {
    setActiveItem(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const items = queryClient.getQueryData(['items']) || [];
    const dragged = items.find((i) => i._id === active.id);
    if (!dragged) return;

    const byStatus = (status) => items.filter((i) => i.status === status);

    const overIsColumn = STATUSES.some((s) => s.id === over.id);
    let toStatus;
    let toIndex;
    if (overIsColumn) {
      toStatus = over.id;
      toIndex = byStatus(over.id).length;
    } else {
      const overItem = items.find((i) => i._id === over.id);
      if (!overItem) return;
      toStatus = overItem.status;
      toIndex = byStatus(overItem.status).findIndex((i) => i._id === over.id);
    }

    const oldStatus = dragged.status;
    const list = items.map((i) => ({ ...i }));
    const draggedIdx = list.findIndex((i) => i._id === active.id);
    const [moved] = list.splice(draggedIdx, 1);
    moved.status = toStatus;

    const destIndices = list.reduce((acc, i, idx) => (i.status === toStatus ? [...acc, idx] : acc), []);
    const insertAt = destIndices.length ? destIndices[Math.min(toIndex, destIndices.length)] : list.length;
    list.splice(insertAt, 0, moved);

    const affectedStatuses = new Set([oldStatus, toStatus]);
    const perColumn = {};
    const updated = list.map((i) => {
      if (!affectedStatuses.has(i.status)) return i;
      perColumn[i.status] = (perColumn[i.status] ?? 0) + 1;
      return { ...i, order: perColumn[i.status] * 10 };
    });

    queryClient.setQueryData(['items'], updated);

    mutation.mutate(
      updated
        .filter((i) => affectedStatuses.has(i.status))
        .map((i) => ({ id: i._id, status: i.status, order: i.order }))
    );
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4" aria-label="Watchlist board">
        {STATUSES.map((status) => (
          <Column
            key={status.id}
            status={status}
            items={itemsByStatus[status.id] || []}
            onItemClick={onItemClick}
            empty="Drag titles here"
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
  );
}
