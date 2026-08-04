import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import SettingsBody from './SettingsBody.jsx'

export default function SettingsPanel({ open, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center md:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
            aria-label="Close settings"
          />
          <motion.div
            role="dialog"
            aria-label="Settings"
            className="relative flex h-full w-full flex-col bg-surface md:h-auto md:max-h-[85vh] md:max-w-2xl md:rounded-2xl md:border md:border-line md:shadow-card"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
          >
            <header className="flex items-center gap-3 border-b border-line px-5 py-4">
              <h2 className="font-display text-xl font-semibold text-ink">Settings</h2>
              <button onClick={onClose} className="btn btn-quiet ml-auto p-2" aria-label="Close">
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <SettingsBody />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}