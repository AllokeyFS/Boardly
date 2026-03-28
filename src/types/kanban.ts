export type Priority = 'low' | 'medium' | 'high'

export type Label = {
  id: string
  text: string
  color: string
}

export type Card = {
  id: string
  title: string
  description?: string
  priority: Priority
  labels: Label[]
  createdAt: number
  dueDate?: string
  archivedAt?: number
}

export type Column = {
  id: string
  title: string
  cardIds: string[]
}

export type BoardState = {
  columns: Column[]
  cards: Record<string, Card>
  archive: Card[]
}