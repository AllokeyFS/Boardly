import { useState, useMemo } from 'react'
import type { BoardState, Priority } from '../types/kanban'

export type FilterState = {
  search: string
  priority: Priority | 'all'
}

export function useFilter(state: BoardState) {
  const [filter, setFilter] = useState<FilterState>({
    search: '',
    priority: 'all',
  })

  const filteredCardIds = useMemo(() => {
    const q = filter.search.toLowerCase().trim()
    return new Set(
      Object.values(state.cards)
        .filter(card => {
          const matchSearch = !q || card.title.toLowerCase().includes(q)
          const matchPriority = filter.priority === 'all' || card.priority === filter.priority
          return matchSearch && matchPriority
        })
        .map(card => card.id)
    )
  }, [state.cards, filter])

  return { filter, setFilter, filteredCardIds }
}