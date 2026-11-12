import { useMemo, useRef, useState } from 'react'
import Scene3D from './components/Scene3D.jsx'
import TaskDetails from './components/TaskDetails.jsx'
import AddTaskModal from './components/AddTaskModal.jsx'
import PriorityPanel from './components/PriorityPanel.jsx'
import { loadTasks, normalizeImportedTasks, satisfactionScore, saveTasks, ZONES } from './lib/model.js'

const FILTERS = [
  { key: 'active', label: 'À faire' },
  { key: 'done', label: 'Terminées' },
  { key: 'archived', label: 'Archivées' },
  { key: 'all', label: 'Toutes' },
]

function ZoneLegend() {
  return (
    <div className="panel legend">
      <h2>Zones de satisfaction</h2>
      <ul>
        {Object.entries(ZONES).map(([key, z]) => (
          <li key={key}>
            <span className="zone-dot" style={{ background: z.color }} />
            <span>{z.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function App() {
  const [tasks, setTasks] = useState(() => loadTasks())
  const [selectedId, setSelectedId] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [showPriorities, setShowPriorities] = useState(true)
  const [showLegend, setShowLegend] = useState(false)
  const [priorityMode, setPriorityMode] = useState(false)
  const [filter, setFilter] = useState('active')
  const fileRef = useRef(null)

  const decorated = useMemo(
    () => tasks.map((t) => ({ ...t, _score: satisfactionScore(t) })),
    [tasks],
  )
  const visibleTasks = useMemo(
    () => decorated.filter((t) => (filter === 'all' ? true : t.status === filter)),
    [decorated, filter],
  )
  const activeTasks = useMemo(() => decorated.filter((t) => t.status === 'active'), [decorated])
  const selectedTask = decorated.find((t) => t.id === selectedId) || null

  const update = (id, changes) =>
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, ...changes } : t)))

  const addTask = (task) => {
    setTasks((ts) => [...ts, task])
    setShowAdd(false)
    setFilter('active')
    setSelectedId(task.id)
  }

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `taches-3d-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importJson = async (file) => {
    try {
      const imported = normalizeImportedTasks(JSON.parse(await file.text()))
      if (imported.length === 0) {
        window.alert('Aucune tâche valide trouvée dans ce fichier.')
        return
      }
      const replace = window.confirm(
        `${imported.length} tâche(s) trouvée(s).\n\nOK : remplacer toutes les tâches actuelles.\nAnnuler : les ajouter aux tâches existantes.`,
      )
      setTasks((ts) => {
        if (replace) return imported
        const existing = new Set(ts.map((t) => t.id))
        const used = new Set()
        return [
          ...ts,
          ...imported.map((t) => {
            while (existing.has(t.id) || used.has(t.id)) t = { ...t, id: crypto.randomUUID() }
            used.add(t.id)
            return t
          }),
        ]
      })
    } catch (e) {
      window.alert(`Import impossible : ${e.message}`)
    }
  }

  const deleteTask = (id) => {
    setTasks((ts) => ts.filter((t) => t.id !== id))
    setSelectedId((s) => (s === id ? null : s))
  }

  const selectFromPanel = (id) => {
    setFilter('active')
    setSelectedId(id)
  }

  saveTasks(tasks)

  return (
    <div className="app">
      <Scene3D
        tasks={visibleTasks}
        selectedId={selectedId}
        onSelect={setSelectedId}
        priorityMode={priorityMode}
      />

      <header className="topbar">
        <div className="brand">
          <h1>Tâches 3D</h1>
          <p>Envie · Complexité · Besoin</p>
        </div>
        <div className="segmented">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={filter === f.key ? 'active' : ''}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="topbar-actions">
          <button className="btn ghost" onClick={() => setShowLegend((v) => !v)}>
            {showLegend ? 'Masquer les zones' : 'Zones'}
          </button>
          <button className="btn ghost" onClick={() => setShowPriorities((v) => !v)}>
            {showPriorities ? 'Masquer priorités' : 'Priorités'}
          </button>
          <button className="btn ghost" title="Exporter toutes les tâches en JSON" onClick={exportJson}>
            ⬇ Export
          </button>
          <button className="btn ghost" title="Importer des tâches depuis un fichier JSON" onClick={() => fileRef.current?.click()}>
            ⬆ Import
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const f = e.target.files[0]
              if (f) importJson(f)
              e.target.value = ''
            }}
          />
          <button className="btn primary" onClick={() => setShowAdd(true)}>＋ Nouvelle tâche</button>
        </div>
      </header>

      {showPriorities && (
        <PriorityPanel
          tasks={activeTasks}
          selectedId={selectedId}
          onSelect={selectFromPanel}
          priorityMode={priorityMode}
          onTogglePriorityMode={setPriorityMode}
          onCollapse={() => setShowPriorities(false)}
        />
      )}

      {showLegend && <ZoneLegend />}

      {selectedTask && (
        <TaskDetails
          key={selectedTask.id}
          task={selectedTask}
          onClose={() => setSelectedId(null)}
          onComplete={() => update(selectedTask.id, { status: 'done' })}
          onReopen={() => update(selectedTask.id, { status: 'active' })}
          onArchive={() => update(selectedTask.id, { status: 'archived' })}
          onDelete={() => deleteTask(selectedTask.id)}
        />
      )}

      {showAdd && <AddTaskModal onAdd={addTask} onClose={() => setShowAdd(false)} />}
    </div>
  )
}
