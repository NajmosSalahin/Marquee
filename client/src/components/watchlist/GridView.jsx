import { motion } from 'framer-motion'
import ItemCard from './ItemCard.jsx'

export default function GridView({ items, onItemClick, density, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="skeleton aspect-[2/3] rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div
      className={`grid ${density === 'compact' ? 'grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7' : 'grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'}`}
    >
      {items.map((item) => (
        <motion.div
          key={item._id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          <ItemCard item={item} onClick={() => onItemClick(item)} />
        </motion.div>
      ))}
    </div>
  )
}
