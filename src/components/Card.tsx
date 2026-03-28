import { useState } from 'react'
import { motion } from 'framer-motion'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useKanban } from '../context/KanbanContext'
import { CardModal } from './CardModal'
import type { Card as CardType } from '../types/kanban'

const PRIORITY_STYLES = {
  high:   'bg-red-50   text-red-800   border-red-200',
  medium: 'bg-amber-50 text-amber-800 border-amber-200',
  low:    'bg-slate-50  text-slate-600 border-slate-200',
}

const PRIORITY_LABEL = {
  high: '↑ High', medium: '→ Medium', low: '↓ Low',
}

type Props = {
  card: CardType
  columnId: string
  isDoneColumn?: boolean
}

export function Card({ card, columnId, isDoneColumn }: Props) {
  const { dispatch } = useKanban()
  const [modalOpen, setModalOpen] = useState(false)

  const {
    attributes, listeners,
    setNodeRef, transform,
    transition, isDragging,
  } = useSortable({ id: card.id, data: { columnId } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date()

  return (
    <>
      <motion.div
        ref={setNodeRef}
        style={style}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0  }}
        exit={{    opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.18 }}
        className={`bg-white dark:bg-slate-700 border rounded-lg p-3 group transition-colors
          ${isDragging
            ? 'opacity-50 border-violet-400 shadow-lg rotate-1'
            : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
          }`}
      >
        <div className="flex items-start gap-2">

          {/* Ручка */}
          <div
            {...attributes}
            {...listeners}
            className="mt-0.5 flex-shrink-0 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-400 dark:text-slate-500 dark:hover:text-slate-400"
          >
            <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor">
              <circle cx="3" cy="3"  r="1.5"/>
              <circle cx="9" cy="3"  r="1.5"/>
              <circle cx="3" cy="8"  r="1.5"/>
              <circle cx="9" cy="8"  r="1.5"/>
              <circle cx="3" cy="13" r="1.5"/>
              <circle cx="9" cy="13" r="1.5"/>
            </svg>
          </div>

          {/* Контент */}
          <div className="flex-1 cursor-pointer" onClick={() => setModalOpen(true)}>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100 leading-snug">
              {card.title}
            </p>

            {card.description && (
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 leading-relaxed line-clamp-2">
                {card.description}
              </p>
            )}

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`inline-block text-xs px-2 py-0.5 rounded-full border font-medium ${PRIORITY_STYLES[card.priority]}`}>
                {PRIORITY_LABEL[card.priority]}
              </span>

              {card.dueDate && (
                <span className={`text-xs font-medium ${isOverdue ? 'text-red-500' : 'text-slate-400 dark:text-slate-500'}`}>
                  {isOverdue ? '⚠ ' : ''}
                  {new Date(card.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </span>
              )}
            </div>
          </div>

          {/* Кнопки справа */}
          <div className="flex flex-col gap-1 flex-shrink-0">
            {/* Архивировать — только в Done колонке */}
            {isDoneColumn && (
              <button
                onClick={() => dispatch({ type: 'CARD_ARCHIVE', cardId: card.id, columnId })}
                title="Mark as done and archive"
                className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 flex items-center justify-center rounded text-slate-300 hover:text-green-500 dark:text-slate-500 dark:hover:text-green-400 text-sm"
              >
                ✓
              </button>
            )}

            {/* Удалить */}
            <button
              onClick={() => dispatch({ type: 'CARD_DELETE', cardId: card.id, columnId })}
              className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 flex items-center justify-center rounded text-slate-300 hover:text-red-400 dark:text-slate-500 dark:hover:text-red-400 text-lg leading-none"
            >
              ×
            </button>
          </div>
        </div>
      </motion.div>

      {modalOpen && (
        <CardModal card={card} columnId={columnId} onClose={() => setModalOpen(false)} />
      )}
    </>
  )
}