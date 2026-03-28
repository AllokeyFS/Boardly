import { useState } from 'react'
import {
  DndContext, DragOverlay, PointerSensor,
  useSensor, useSensors,
  type DragStartEvent, type DragOverEvent, type DragEndEvent,
} from '@dnd-kit/core'
import { AnimatePresence } from 'framer-motion'
import { useKanban } from '../context/KanbanContext'
import { Column } from './Column'
import { Card } from './Card'
import { BoardPresets } from './BoardPresets'
import { useTheme } from '../hooks/useTheme'
import { useFilter } from '../hooks/useFilter'
import type { Card as CardType, Priority } from '../types/kanban'
import { Archive } from './Archive'

export function Board() {
  const { state, dispatch } = useKanban()
  const { dark, toggle } = useTheme()
  const { filter, setFilter, filteredCardIds } = useFilter(state)

  const [addingColumn, setAddingColumn] = useState(false)
  const [newColTitle, setNewColTitle] = useState('')
  const [activeCard, setActiveCard] = useState<CardType | null>(null)
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null)
  const [presetsOpen, setPresetsOpen] = useState(false)

  const [archiveOpen, setArchiveOpen] = useState(false)
  const archiveCount = state.archive?.length ?? 0

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  function handleDragStart(event: DragStartEvent) {
    const card = state.cards[event.active.id as string]
    if (card) setActiveCard(card)
    setDragOverColumnId(null)
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string
    if (activeId === overId) return

    const activeCol = active.data.current?.columnId as string

    // Определяем колонку назначения
    const overColById = state.columns.find(c => c.id === overId)
    const overColByCard = state.columns.find(c => c.cardIds.includes(overId))
    const overColData = overColById ?? overColByCard
    if (!activeCol || !overColData) return

    const overCol = overColData.id
    setDragOverColumnId(overCol)

    // Если та же колонка — ничего не делаем
    if (activeCol === overCol) return

    // Перенос в другую колонку — reducer сам отсортирует
    dispatch({
      type: 'CARD_MOVE',
      cardId: activeId,
      fromColumnId: activeCol,
      toColumnId: overCol,
    })

    active.data.current!.columnId = overCol
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveCard(null)
    setDragOverColumnId(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string
    if (activeId === overId) return

    const columnId = active.data.current?.columnId as string
    const col = state.columns.find(c => c.id === columnId)
    if (!col) return

    // Drag внутри одной колонки — просто триггерим сортировку
    const overInSameCol = col.cardIds.includes(overId)
    if (!overInSameCol) return

    dispatch({ type: 'CARD_SORT_COLUMN', columnId })
  }

  function handleAddColumn(e: React.FormEvent) {
    e.preventDefault()
    if (!newColTitle.trim()) return
    dispatch({ type: 'COLUMN_ADD', title: newColTitle.trim() })
    setNewColTitle('')
    setAddingColumn(false)
  }

  const totalVisible = state.columns.reduce((acc, col) =>
    acc + col.cardIds.filter(id => filteredCardIds.has(id)).length, 0
  )
  const isFiltering = filter.search !== '' || filter.priority !== 'all'

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-violet-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors">

        {/* Шапка */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-3 sticky top-0 z-10 flex-shrink-0">
          <div className="max-w-screen-xl mx-auto flex items-center gap-3 flex-wrap">

            <div className="mr-1">
              <h1 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                Boardly
              </h1>
              <p className="text-xs text-slate-400">
                {isFiltering
                  ? `${totalVisible} of ${Object.keys(state.cards).length}`
                  : Object.keys(state.cards).length
                } tasks · {state.columns.length} columns
              </p>
            </div>

            <input
              type="text"
              value={filter.search}
              onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
              placeholder="Search cards..."
              className="flex-1 min-w-[140px] max-w-xs h-8 text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-3 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400"
            />

            <select
              value={filter.priority}
              onChange={e => setFilter(f => ({ ...f, priority: e.target.value as Priority | 'all' }))}
              className="h-8 text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-400"
            >
              <option value="all">All priorities</option>
              <option value="high">↑ High</option>
              <option value="medium">→ Medium</option>
              <option value="low">↓ Low</option>
            </select>

            {isFiltering && (
              <button
                onClick={() => setFilter({ search: '', priority: 'all' })}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                Clear
              </button>
            )}

            <button
              onClick={() => setPresetsOpen(true)}
              className="h-8 px-3 flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-xs font-medium ml-auto"
            >
              ▦ Templates
            </button>
            <button
              onClick={() => setArchiveOpen(true)}
              className="h-8 px-3 flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-xs font-medium"
            >
              ✓ Archive
              {archiveCount > 0 && (
                <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-xs font-medium px-1.5 py-0.5 rounded-full">
                  {archiveCount}
                </span>
              )}
            </button>
            <button
              onClick={toggle}
              className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-base"
            >
              {dark ? '☀' : '☾'}
            </button>
          </div>
        </header>

        {/* Доска */}
        <main className="flex-1 flex flex-col px-6 pt-6">
          <div className="flex-1 overflow-x-auto">
            <div className="flex gap-4 items-start h-full pb-6 min-w-max">
              {state.columns.map(column => (
                <Column
                  key={column.id}
                  column={column}
                  filteredCardIds={filteredCardIds}
                  isDraggingOver={dragOverColumnId === column.id}
                />
              ))}

              {addingColumn ? (
                <form
                  onSubmit={handleAddColumn}
                  className="bg-slate-100 dark:bg-slate-700 rounded-xl p-3 w-72 flex-shrink-0"
                >
                  <input
                    autoFocus
                    value={newColTitle}
                    onChange={e => setNewColTitle(e.target.value)}
                    onKeyDown={e => e.key === 'Escape' && setAddingColumn(false)}
                    placeholder="Column title..."
                    className="w-full text-sm border border-slate-300 dark:border-slate-500 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-400"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      type="submit"
                      className="text-xs bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-md font-medium transition-colors"
                    >
                      Add column
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddingColumn(false)}
                      className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1.5"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setAddingColumn(true)}
                  className="flex-shrink-0 w-72 bg-white/60 dark:bg-slate-700/60 hover:bg-white dark:hover:bg-slate-700 border border-dashed border-slate-300 dark:border-slate-600 hover:border-slate-400 rounded-xl py-3 px-4 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
                >
                  + Add column
                </button>
              )}
            </div>
          </div>
        </main>
      </div>

      <DragOverlay>
        {activeCard && (
          <div className="rotate-2 opacity-95">
            <Card card={activeCard} columnId="" />
          </div>
        )}
      </DragOverlay>

      <AnimatePresence>
        {archiveOpen && (
          <Archive onClose={() => setArchiveOpen(false)} />
        )}
      </AnimatePresence>
    </DndContext>
  )
}