import type { BoardState } from '../types/kanban'

export const PRESET_TEMPLATES: Record<string, BoardState> = {
  default: {
    columns: [
      { id: 'default-col-1', title: 'To do',       cardIds: [] },
      { id: 'default-col-2', title: 'In progress', cardIds: [] },
      { id: 'default-col-3', title: 'Done',        cardIds: [] },
    ],
    cards: {},
    archive: [],
  },
  agile: {
    columns: [
      { id: 'agile-col-1', title: 'To do',       cardIds: [] },
      { id: 'agile-col-2', title: 'Blocked',     cardIds: [] },
      { id: 'agile-col-3', title: 'In progress', cardIds: [] },
      { id: 'agile-col-4', title: 'Review',      cardIds: [] },
      { id: 'agile-col-5', title: 'Done',        cardIds: [] },
    ],
    cards: {},
    archive: [],
  },
  personal: {
    columns: [
      { id: 'personal-col-1', title: 'Ideas',     cardIds: [] },
      { id: 'personal-col-2', title: 'This week', cardIds: [] },
      { id: 'personal-col-3', title: 'Today',     cardIds: [] },
      { id: 'personal-col-4', title: 'Done',      cardIds: [] },
    ],
    cards: {},
    archive: [],
  },
}

export const ACTIVE_PRESET_KEY = 'boardly-active-preset'

function presetKey(presetId: string) {
  return `boardly-preset-${presetId}`
}

export function savePresetState(presetId: string, state: BoardState) {
  localStorage.setItem(presetKey(presetId), JSON.stringify(state))
}

export function loadPresetState(presetId: string): BoardState {
  try {
    const raw = localStorage.getItem(presetKey(presetId))
    if (raw) {
      const state = JSON.parse(raw) as BoardState
      return {
        archive: state.archive ?? [],
        cards: state.cards,
        columns: state.columns.map(col => ({
          ...col,
          cardIds: col.cardIds.filter(id => id in state.cards),
        })),
      }
    }
  } catch {
    // fallback
  }
  return PRESET_TEMPLATES[presetId] ?? PRESET_TEMPLATES.default
}

export function loadStateSafe(): BoardState {
  const activePreset = localStorage.getItem(ACTIVE_PRESET_KEY) ?? 'default'
  return loadPresetState(activePreset)
}

export function getActivePreset(): string {
  return localStorage.getItem(ACTIVE_PRESET_KEY) ?? 'default'
}