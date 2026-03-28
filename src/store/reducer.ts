import type { BoardState } from '../types/kanban'
import type { KanbanAction } from './actions'

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 }

function sortedIds(cards: BoardState['cards'], ids: string[]): string[] {
  return [...ids].sort((a, b) => {
    const pa = PRIORITY_ORDER[cards[a]?.priority ?? 'low']
    const pb = PRIORITY_ORDER[cards[b]?.priority ?? 'low']
    return pa - pb
  })
}

export function kanbanReducer(
  state: BoardState,
  action: KanbanAction
): BoardState {
  switch (action.type) {

    case 'CARD_ADD': {
      const { columnId, card } = action
      const updatedCards = { ...state.cards, [card.id]: card }
      return {
        ...state,
        cards: updatedCards,
        columns: state.columns.map(col => {
          if (col.id !== columnId) return col
          return { ...col, cardIds: sortedIds(updatedCards, [...col.cardIds, card.id]) }
        }),
      }
    }

    case 'CARD_UPDATE': {
      return {
        ...state,
        cards: {
          ...state.cards,
          [action.cardId]: { ...state.cards[action.cardId], ...action.patch },
        },
      }
    }

    case 'CARD_DELETE': {
      const { [action.cardId]: _, ...remainingCards } = state.cards
      return {
        ...state,
        cards: remainingCards,
        columns: state.columns.map(col =>
          col.id === action.columnId
            ? { ...col, cardIds: col.cardIds.filter(id => id !== action.cardId) }
            : col
        ),
      }
    }

    case 'CARD_MOVE': {
      const { cardId, fromColumnId, toColumnId } = action
      const fromCol = state.columns.find(c => c.id === fromColumnId)!
      const toCol   = state.columns.find(c => c.id === toColumnId)!
      const newFromIds = fromCol.cardIds.filter(id => id !== cardId)
      const newToIds   = sortedIds(state.cards, [...toCol.cardIds.filter(id => id !== cardId), cardId])
      return {
        ...state,
        columns: state.columns.map(col => {
          if (col.id === fromColumnId) return { ...col, cardIds: newFromIds }
          if (col.id === toColumnId)   return { ...col, cardIds: newToIds }
          return col
        }),
      }
    }

    case 'CARD_ARCHIVE': {
      const { cardId, columnId } = action
      const card = state.cards[cardId]
      if (!card) return state
      const { [cardId]: _, ...remainingCards } = state.cards
      return {
        ...state,
        cards: remainingCards,
        columns: state.columns.map(col =>
          col.id === columnId
            ? { ...col, cardIds: col.cardIds.filter(id => id !== cardId) }
            : col
        ),
        archive: [...(state.archive ?? []), { ...card, archivedAt: Date.now() }],
      }
    }

    case 'CARD_UNARCHIVE': {
      const { cardId, columnId } = action
      const card = state.archive?.find(c => c.id === cardId)
      if (!card) return state
      const { archivedAt: _, ...restoredCard } = card
      const updatedCards = { ...state.cards, [cardId]: restoredCard }
      return {
        ...state,
        cards: updatedCards,
        columns: state.columns.map(col => {
          if (col.id !== columnId) return col
          return { ...col, cardIds: sortedIds(updatedCards, [...col.cardIds, cardId]) }
        }),
        archive: (state.archive ?? []).filter(c => c.id !== cardId),
      }
    }

    case 'ARCHIVE_CLEAR': {
      return { ...state, archive: [] }
    }

    case 'CARD_SORT_COLUMN': {
      return {
        ...state,
        columns: state.columns.map(col => {
          if (col.id !== action.columnId) return col
          return { ...col, cardIds: sortedIds(state.cards, col.cardIds) }
        }),
      }
    }

    case 'COLUMN_ADD': {
      const newCol = { id: `col-${Date.now()}`, title: action.title, cardIds: [] }
      return { ...state, columns: [...state.columns, newCol] }
    }

    case 'COLUMN_UPDATE': {
      return {
        ...state,
        columns: state.columns.map(col =>
          col.id === action.columnId ? { ...col, title: action.title } : col
        ),
      }
    }

    case 'COLUMN_DELETE': {
      const col = state.columns.find(c => c.id === action.columnId)
      if (!col) return state
      const remaining = Object.fromEntries(
        Object.entries(state.cards).filter(([id]) => !col.cardIds.includes(id))
      )
      return {
        ...state,
        cards: remaining,
        columns: state.columns.filter(c => c.id !== action.columnId),
      }
    }

    case 'BOARD_REPLACE': {
      return { archive: [], ...action.payload }
    }

    default:
      return state
  }
}