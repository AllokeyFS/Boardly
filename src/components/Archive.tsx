import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useKanban } from '../context/KanbanContext'

const PRIORITY_STYLES = {
  high:   'bg-red-50   text-red-800   border-red-200',
  medium: 'bg-amber-50 text-amber-800 border-amber-200',
  low:    'bg-slate-50  text-slate-600 border-slate-200',
}

const PRIORITY_LABEL = {
  high: '↑ High', medium: '→ Medium', low: '↓ Low',
}

type Props = {
  onClose: () => void
}

export function Archive({ onClose }: Props) {
  const { state, dispatch } = useKanban()
  const archive = state.archive ?? []

  const doneColumnId = state.columns.find(
    c => c.title.toLowerCase() === 'done'
  )?.id ?? state.columns[state.columns.length - 1]?.id

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
      className="bg-black/40 dark:bg-black/60 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        onClick={e => e.stopPropagation()}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]"
      >
        {/* Шапка */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex-shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Archive
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {archive.length} completed {archive.length === 1 ? 'task' : 'tasks'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {archive.length > 0 && (
              <button
                onClick={() => dispatch({ type: 'ARCHIVE_CLEAR' })}
                className="text-xs text-red-400 hover:text-red-600 dark:hover:text-red-300 font-medium transition-colors"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl leading-none transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Список */}
        <div className="overflow-y-auto flex-1 p-4">
          {archive.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-3xl mb-3">○</div>
              <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
                No archived tasks yet
              </p>
              <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">
                Mark tasks as done from the Done column
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <AnimatePresence>
                {[...archive].reverse().map(card => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{    opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg p-3 flex items-start gap-3 group"
                  >
                    <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-snug line-through decoration-slate-300 dark:decoration-slate-500">
                        {card.title}
                      </p>
                      {card.description && (
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                          {card.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${PRIORITY_STYLES[card.priority]}`}>
                          {PRIORITY_LABEL[card.priority]}
                        </span>
                        {card.archivedAt && (
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            {new Date(card.archivedAt).toLocaleDateString('en-GB', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </span>
                        )}
                      </div>
                    </div>

                    {doneColumnId && (
                      <button
                        onClick={() => dispatch({
                          type: 'CARD_UNARCHIVE',
                          cardId: card.id,
                          columnId: doneColumnId,
                        })}
                        title="Restore to Done"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-slate-400 hover:text-violet-500 dark:hover:text-violet-400 flex-shrink-0 font-medium"
                      >
                        Restore
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>,
    document.body
  )
}