import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useKanban } from '../context/KanbanContext'

type Preset = {
  id: string
  name: string
  description: string
  icon: string
  columns: string[]
}

const PRESETS: Preset[] = [
  {
    id: 'default',
    name: 'Default',
    description: 'Simple 3-column board',
    icon: '▦',
    columns: ['To do', 'In progress', 'Done'],
  },
  {
    id: 'agile',
    name: 'Agile',
    description: 'Full agile workflow',
    icon: '◈',
    columns: ['To do', 'Blocked', 'In progress', 'Review', 'Done'],
  },
  {
    id: 'personal',
    name: 'Personal',
    description: 'For personal tasks',
    icon: '◇',
    columns: ['Ideas', 'This week', 'Today', 'Done'],
  },
]

type Props = {
  onSelect: () => void
}

export function BoardPresets({ onSelect }: Props) {
  const { switchPreset, activePreset } = useKanban()

  function handleSelect(presetId: string) {
    if (presetId === activePreset) {
      onSelect()
      return
    }
    switchPreset(presetId)
    onSelect()
  }

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={onSelect}
        style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
        className="bg-black/40 dark:bg-black/60 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          onClick={e => e.stopPropagation()}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-md overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Choose a template
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Each board saves separately — switch anytime
            </p>
          </div>

          <div className="p-4 flex flex-col gap-3">
            {PRESETS.map((preset, i) => {
              const isActive = preset.id === activePreset
              return (
                <motion.button
                  key={preset.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => handleSelect(preset.id)}
                  className={`flex items-start gap-4 p-4 rounded-xl border transition-all text-left group
                    ${isActive
                      ? 'border-violet-400 bg-violet-50 dark:bg-violet-900/20 dark:border-violet-500'
                      : 'border-slate-200 dark:border-slate-600 hover:border-violet-400 dark:hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20'
                    }`}
                >
                  <span className="text-2xl mt-0.5">{preset.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold transition-colors
                        ${isActive
                          ? 'text-violet-700 dark:text-violet-300'
                          : 'text-slate-700 dark:text-slate-200 group-hover:text-violet-700 dark:group-hover:text-violet-300'
                        }`}
                      >
                        {preset.name}
                      </span>
                      {isActive && (
                        <span className="text-xs bg-violet-100 dark:bg-violet-800 text-violet-600 dark:text-violet-300 px-2 py-0.5 rounded-full font-medium">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 mb-2">
                      {preset.description}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {preset.columns.map(col => (
                        <span
                          key={col}
                          className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-md"
                        >
                          {col}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}