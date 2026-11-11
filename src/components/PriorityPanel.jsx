import { formatDue, zoneOf, ZONES } from '../lib/model.js'

export default function PriorityPanel({ tasks, selectedId, onSelect, priorityMode, onTogglePriorityMode, onCollapse }) {
  const sorted = [...tasks].sort((a, b) => b._score - a._score)

  return (
    <aside className="panel priorities">
      <header className="panel-header">
        <h2>Ordre conseillé</h2>
        <button className="icon-btn" onClick={onCollapse} aria-label="Réduire">«</button>
      </header>

      <label className="toggle">
        <input type="checkbox" checked={priorityMode} onChange={(e) => onTogglePriorityMode(e.target.checked)} />
        <span>Grossir les points selon la priorité</span>
      </label>

      {sorted.length === 0 && <p className="empty">Aucune tâche à faire. Ajoutez-en une !</p>}

      <ol className="priority-list">
        {sorted.map((t, i) => {
          const zone = ZONES[zoneOf(t)]
          const due = formatDue(t.dueDate)
          return (
            <li key={t.id}>
              <button
                className={`priority-item${t.id === selectedId ? ' selected' : ''}`}
                onClick={() => onSelect(t.id)}
              >
                <span className="rank">{i + 1}</span>
                <span className="zone-dot" style={{ background: zone.color }} />
                <span className="priority-name">
                  {t.name}
                  {due && <em className={`due ${due.tone}`}>{due.text}</em>}
                </span>
                <span className="score">{t._score}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </aside>
  )
}
