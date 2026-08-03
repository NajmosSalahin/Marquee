import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, X } from 'lucide-react';
import AddSearch from './AddSearch.jsx';
import AddForm from './AddForm.jsx';

export default function AddPanel({ open, onClose }) {
  const [mode, setMode] = useState('search');
  const [type, setType] = useState('movie');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (open) {
      setMode('search');
      setSelected(null);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      document.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const pickResult = (result, pickedType) => {
    setType(pickedType);
    setSelected(result);
    setMode('form');
  };

  const manual = () => {
    setSelected(null);
    setMode('form');
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button className="absolute inset-0 bg-black/60" onClick={onClose} aria-label="Close add panel" />
          <motion.aside
            role="dialog"
            aria-label="Add a title"
            className="relative flex h-full w-full max-w-xl flex-col bg-surface"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
          >
            <header className="flex items-center gap-3 border-b border-line px-5 py-4">
              {mode === 'form' && (
                <button
                  onClick={() => setMode('search')}
                  className="btn btn-quiet p-2"
                  aria-label="Back to search"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
              <h2 className="font-display text-xl font-semibold text-ink">
                {mode === 'search' ? 'Add a title' : 'Add to Watchlist'}
              </h2>
              <button onClick={onClose} className="btn btn-quiet ml-auto p-2" aria-label="Close">
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              {mode === 'search' ? (
                <AddSearch onPick={pickResult} onManual={manual} />
              ) : (
                <AddForm
                  key={selected ? `${selected.source}-${selected.externalId}` : 'manual'}
                  type={type}
                  result={selected}
                  onDone={onClose}
                />
              )}
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
