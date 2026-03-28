import type { Card } from '../types/kanban'

export type KanbanAction =
  | { type: 'CARD_ADD';         columnId: string; card: Card }
  | { type: 'CARD_UPDATE';      cardId: string;   patch: Partial<Card> }
  | { type: 'CARD_DELETE';      cardId: string;   columnId: string }
  | { type: 'CARD_MOVE';        cardId: string;   fromColumnId: string; toColumnId: string }
  | { type: 'CARD_ARCHIVE';     cardId: string;   columnId: string }
  | { type: 'CARD_UNARCHIVE';   cardId: string;   columnId: string }
  | { type: 'ARCHIVE_CLEAR' }
  | { type: 'CARD_SORT_COLUMN'; columnId: string }
  | { type: 'COLUMN_ADD';       title: string }
  | { type: 'COLUMN_UPDATE';    columnId: string; title: string }
  | { type: 'COLUMN_DELETE';    columnId: string }
  | { type: 'BOARD_REPLACE';    payload: import('../types/kanban').BoardState }