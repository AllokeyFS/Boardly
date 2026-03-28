import { useState } from 'react'
import { useKanban } from '../context/KanbanContext'
import type { Priority } from '../types/kanban'

type Props = {
  columnId: string
  onClose: () => void
}

export function AddCardForm({ columnId, onClose }: Props) {
  const { dispatch } = useKanban()
  const [title,    setTitle]    = useState('')
  const [priority, setPriority] = useState<Priority>('medium')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    dispatch({
      type: 'CARD_ADD',
      columnId,
      card: {
        id:        `card-${Date.now()}`,
        title:     title.trim(),
        priority,
        labels:    [],
        createdAt: Date.now(),
      },
    })
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2">
      <textarea
        autoFocus
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Escape') onClose()
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e as unknown as React.FormEvent)
          }
        }}
        placeholder="Card title..."
        rows={2}
        className="w-full text-sm border border-slate-300 dark:border-slate-500 rounded-lg px-3 py-2 resize-none bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
      />

      <div className="flex items-center gap-2 mt-2">
        <select
          value={priority}
          onChange={e => setPriority(e.target.value as Priority)}
          className="text-xs border border-slate-200 dark:border-slate-600 rounded-md px-2 py-1 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-400"
        >
          <option value="low">↓ Low</option>
          <option value="medium">→ Medium</option>
          <option value="high">↑ High</option>
        </select>

        <button
          type="submit"
          className="ml-auto text-xs bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-md font-medium transition-colors"
        >
          Add card
        </button>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 px-2 py-1.5 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}