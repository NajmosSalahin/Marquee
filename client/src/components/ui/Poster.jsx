import { Film } from 'lucide-react'
import Skeleton from './Skeleton.jsx'

export default function Poster({ src, alt, className = '', onClick, loading }) {
  if (loading) return <Skeleton className={`aspect-[2/3] ${className}`} />
  if (!src) {
    return (
      <div
        className={`flex aspect-[2/3] items-center justify-center bg-surface2 text-muted/50 ${className}`}
        aria-label={alt}
      >
        <Film className="h-8 w-8" />
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onClick={onClick}
      className={`aspect-[2/3] w-full bg-surface2 object-cover ${onClick ? 'cursor-pointer' : ''} ${className}`}
    />
  )
}
