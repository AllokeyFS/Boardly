import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useKanban } from '../context/KanbanContext'
import { Card } from './Card'
import { AddCardForm } from './AddCardForm'
import type { Column as ColumnType } from '../types/kanban'

const COLUMN_ACCENT: Record<string, string> = {
  'col-1': 'bg-blue-500',
  'col-2': 'bg-amber-500',
  'col-3': 'bg-green-500',
}

function getAccent(id: string) {
  if (COLUMN_ACCENT[id]) return COLUMN_ACCENT[id]
  const colors = ['bg-violet-500', 'bg-pink-500', 'bg-teal-500', 'bg-orange-500']
  const index = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return colors[index % colors.length]
}

type Props = {
  column: ColumnType
  filteredCardIds: Set<string>
  isDraggingOver: boolean
}

export function Column({ column, filteredCardIds, isDraggingOver }: Props) {
  const { state, dispatch } = useKanban()
  const [addingCard,      setAddingCard]      = useState(false)
  const [editingTitle,    setEditingTitle]    = useState(false)
  const [titleValue,      setTitleValue]      = useState(column.title)
  const [hovered,         setHovered]         = useState(false)
  const [showPlaceholder, setShowPlaceholder] = useState(false)

  const isDoneColumn = column.title.toLowerCase() === 'done'

  const cards        = column.cardIds.map(id => state.cards[id]).filter(Boolean)
  const visibleCards = cards.filter(card => filteredCardIds.has(card.id))
  const isEmpty      = visibleCards.length === 0

  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  useEffect(() => {
    if (!isEmpty) { setShowPlaceholder(false); return }
    const timer = setTimeout(() => setShowPlaceholder(true), 150)
    return () => clearTimeout(timer)
  }, [isEmpty])

  function handleTitleSave() {
    if (titleValue.trim()) {
      dispatch({ type: 'COLUMN_UPDATE', columnId: column.id, title: titleValue.trim() })
    } else {
      setTitleValue(column.title)
    }
    setEditingTitle(false)
  }

  function handleDelete() {
    if (cards.length > 0) {
      if (!window.confirm(`Delete "${column.title}" and its ${cards.length} card(s)?`)) return
    }
    dispatch({ type: 'COLUMN_DELETE', columnId: column.id })
  }

  return (
    <div
      className="w-72 flex-shrink-0 flex flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={`rounded-xl p-3 flex flex-col flex-1 transition-colors border
          ${isOver
            ? 'bg-violet-50 dark:bg-violet-900/30 border-violet-300 dark:border-violet-700 ring-2 ring-violet-200 dark:ring-violet-800'
            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
          }`}
      >
        {/* Заголовок */}
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getAccent(column.id)}`} />

          {editingTitle ? (
            <input
              autoFocus
              value={titleValue}
              onChange={e => setTitleValue(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={e => {
                if (e.key === 'Enter')  handleTitleSave()
                if (e.key === 'Escape') { setTitleValue(column.title); setEditingTitle(false) }
              }}
              className="text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-500 rounded px-2 py-0.5 w-full focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          ) : (
            <h2
              onDoubleClick={() => setEditingTitle(true)}
              className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex-1 cursor-default select-none"
              title="Double click to rename"
            >
              {column.title}
            </h2>
          )}

          <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-700 dark:text-slate-400 rounded-full px-2 py-0.5 flex-shrink-0">
            {visibleCards.length}
          </span>

          <AnimatePresence>
            {hovered && !editingTitle && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{    opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.12 }}
                onClick={handleDelete}
                className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded text-slate-300 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 dark:text-slate-600 dark:hover:text-red-400 transition-colors text-base leading-none"
                title="Delete column"
              >
                ×
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Карточки */}
        <SortableContext items={column.cardIds} strategy={verticalListSortingStrategy}>
          <div ref={setNodeRef} className="flex flex-col gap-2 flex-1 min-h-[40px]">
            <AnimatePresence>
              {visibleCards.map(card => (
                <Card
                  key={card.id}
                  card={card}
                  columnId={column.id}
                  isDoneColumn={isDoneColumn}
                />
              ))}
            </AnimatePresence>

            {isEmpty && showPlaceholder && !isDraggingOver && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col items-center justify-center py-4 px-3 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg"
              >
                <div className="text-base mb-1 text-slate-300 dark:text-slate-600">○</div>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                  No cards here
                </p>
              </motion.div>
            )}

            {isEmpty && isDraggingOver && (
              <div className="flex-1 min-h-[48px] rounded-lg border-2 border-dashed border-violet-300 dark:border-violet-600 bg-violet-50 dark:bg-violet-900/20 transition-colors" />
            )}
          </div>
        </SortableContext>

        {addingCard ? (
          <AddCardForm columnId={column.id} onClose={() => setAddingCard(false)} />
        ) : (
          <button
            onClick={() => setAddingCard(true)}
            className="mt-3 w-full text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg py-2 transition-colors text-left px-2"
          >
            + Add card
          </button>
        )}
      </div>
    </div>
  )
}