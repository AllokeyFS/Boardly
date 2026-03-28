import {
  createContext, useContext,
  useReducer, useEffect,
  useState,
  type Dispatch,
} from 'react'
import type { BoardState } from '../types/kanban'
import type { KanbanAction } from '../store/actions'
import { kanbanReducer } from '../store/reducer'
import {
  loadStateSafe,
  savePresetState,
  loadPresetState,
  getActivePreset,
  ACTIVE_PRESET_KEY,
} from '../store/initialState'

type KanbanContextValue = {
  state: BoardState
  dispatch: Dispatch<KanbanAction>
  activePreset: string
  switchPreset: (presetId: string) => void
}

const KanbanContext = createContext<KanbanContextValue | null>(null)

export function KanbanProvider({ children }: { children: React.ReactNode }) {
  const [activePreset, setActivePreset] = useState(getActivePreset)
  const [state, dispatch] = useReducer(kanbanReducer, undefined, loadStateSafe)

  // Сохраняем состояние текущего пресета при каждом изменении
  useEffect(() => {
    savePresetState(activePreset, state)
  }, [state, activePreset])

  // Переключение пресета
  function switchPreset(presetId: string) {
    // Сохраняем текущий пресет перед переключением
    savePresetState(activePreset, state)

    // Загружаем новый пресет
    const newState = loadPresetState(presetId)

    // Обновляем активный пресет в localStorage
    localStorage.setItem(ACTIVE_PRESET_KEY, presetId)
    setActivePreset(presetId)

    // Заменяем доску
    dispatch({ type: 'BOARD_REPLACE', payload: newState })
  }

  return (
    <KanbanContext.Provider value={{ state, dispatch, activePreset, switchPreset }}>
      {children}
    </KanbanContext.Provider>
  )
}

export function useKanban() {
  const ctx = useContext(KanbanContext)
  if (!ctx) throw new Error('useKanban must be used inside KanbanProvider')
  return ctx
}