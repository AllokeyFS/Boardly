import { createPortal } from 'react-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Card, Priority } from '../types/kanban'
import { useKanban } from '../context/KanbanContext'

type Props = {
  card: Card
  columnId: string
  onClose: () => void
}

const PRIORITY_OPTIONS: { value: Priority; label: string; style: string }[] = [
  { value: 'low',    label: '↓ Low',    style: 'bg-slate-50  text-slate-600  border-slate-200' },
  { value: 'medium', label: '→ Medium', style: 'bg-amber-50  text-amber-800  border-amber-200' },
  { value: 'high',   label: '↑ High',   style: 'bg-red-50    text-red-800    border-red-200'   },
]

export function CardModal({ card, columnId, onClose }: Props) {
  const { dispatch } = useKanban()

  const [title,       setTitle]       = useState(card.title)
  const [description, setDescription] = useState(card.description ?? '')
  const [priority,    setPriority]    = useState<Priority>(card.priority)
  const [dueDate,     setDueDate]     = useState(card.dueDate ?? '')

  const priorityChanged = priority !== card.priority

  function handleSave() {
    if (!title.trim()) return
    dispatch({
      type: 'CARD_UPDATE',
      cardId: card.id,
      patch: {
        title:       title.trim(),
        description: description.trim() || undefined,
        priority,
        dueDate:     dueDate || undefined,
      },
    })
    if (priorityChanged) {
      dispatch({ type: 'CARD_SORT_COLUMN', columnId })
    }
    onClose()
  }

  function handleDelete() {
    dispatch({ type: 'CARD_DELETE', cardId: card.id, columnId })
    onClose()
  }

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
        className="bg-black/40 dark:bg-black/60"
      />

      <motion.div
        key="modal"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{    opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none' }}
        className="flex items-center justify-center p-4"
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{ pointerEvents: 'auto' }}
          className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
        >
          {/* Шапка */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Edit card
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl leading-none transition-colors"
            >
              ×
            </button>
          </div>

          {/* Контент */}
          <div className="px-5 py-4 flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                Title
              </label>
              <input
                autoFocus
                value={title}
                onChange={e => setTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                className="w-full text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                Description
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                placeholder="Add a description..."
                className="w-full text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                Priority
              </label>
              <div className="flex gap-2">
                {PRIORITY_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setPriority(opt.value)}
                    className={`flex-1 text-xs px-3 py-1.5 rounded-lg border font-medium transition-all
                      ${priority === opt.value
                        ? opt.style + ' ring-2 ring-violet-400 ring-offset-1'
                        : 'bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600 hover:border-slate-300'
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {priorityChanged && (
                <p className="text-xs text-violet-500 mt-1.5">
                  ↕ Column will be re-sorted on save
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                Due date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
              />
            </div>
          </div>

          {/* Футер */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 dark:border-slate-700">
            <button
              onClick={handleDelete}
              className="text-xs text-red-400 hover:text-red-600 dark:hover:text-red-300 font-medium transition-colors"
            >
              Delete card
            </button>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-3 py-1.5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!title.trim()}
                className="text-xs bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-lg font-medium transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}