import { useRef, useState } from 'react'
import { CRITERIA, formatDue, zoneOf, ZONES } from '../lib/model.js'

function CriterionBar({ label, hint, value }) {
  const pct = Math.abs(value) * 5
  const positive = value >= 0
  return (
    <div className="criterion">
      <div className="criterion-head">
        <span>{label}</span>
        <strong className={positive ? 'pos' : 'neg'}>
          {value > 0 ? `+${value}` : value}
        </strong>
      </div>
      <div className="criterion-track">
        <div className="criterion-center" />
        <div
          className={`criterion-fill ${positive ? 'pos' : 'neg'}`}
          style={positive ? { left: '50%', width: `${pct}%` } : { right: '50%', width: `${pct}%` }}
        />
      </div>
      <small>{hint}</small>
    </div>
  )
}

export default function TaskDetails({ task, onClose, onComplete, onReopen, onArchive, onDelete }) {
  const winRef = useRef(null)
  const drag = useRef(null)
  const [pos, setPos] = useState(null)

  const onPointerDown = (e) => {
    e.preventDefault()
    const rect = winRef.current.getBoundingClientRect()
    drag.current = { dx: e.clientX - rect.left, dy: e.clientY - rect.top }
    setPos({ x: rect.left, y: rect.top })
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  const onPointerMove = (e) => {
    const d = drag.current
    if (!d) return
    setPos({
      x: Math.min(Math.max(8, e.clientX - d.dx), window.innerWidth - 140),
      y: Math.min(Math.max(8, e.clientY - d.dy), window.innerHeight - 60),
    })
  }

  const onPointerUp = () => {
    drag.current = null
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
  }

  const zone = ZONES[zoneOf(task)]
  const due = formatDue(task.dueDate)

  return (
    <aside
      ref={winRef}
      className="floating"
      style={pos ? { left: pos.x, top: pos.y } : undefined}
    >
      <header className="floating-header" onPointerDown={onPointerDown}>
        <span className="zone-dot" style={{ background: zone.color }} />
        <h3>{task.name}</h3>
        <button className="icon-btn" onClick={onClose} aria-label="Fermer">✕</button>
      </header>

      <div className="floating-body">
        <div className="zone-badge" style={{ borderColor: `${zone.color}55`, color: zone.color }}>
          {zone.label}
          <small>{zone.description}</small>
        </div>

        {task.description && <p className="description">{task.description}</p>}

        {CRITERIA.map((c) => (
          <CriterionBar key={c.key} label={c.label} hint={c.hint} value={task[c.key]} />
        ))}

        <div className="meta">
          <span>Score de satisfaction : <strong>{task._score}</strong></span>
          {due && <span className={`due ${due.tone}`}>⏰ {due.text}</span>}
        </div>

        {task.status === 'active' && (
          <div className="actions">
            <button className="btn primary" onClick={onComplete}>✓ Marquer comme terminée</button>
            <button className="btn danger" onClick={onDelete}>Supprimer</button>
          </div>
        )}

        {task.status === 'done' && (
          <div className="actions">
            <p className="done-note">Tâche terminée ✓ Que souhaitez-vous faire ?</p>
            <div className="actions-row">
              <button className="btn" onClick={onArchive}>Archiver</button>
              <button className="btn danger" onClick={onDelete}>Supprimer</button>
              <button className="btn ghost" onClick={onReopen}>Reprendre</button>
            </div>
          </div>
        )}

        {task.status === 'archived' && (
          <div className="actions">
            <p className="done-note">Tâche archivée.</p>
            <div className="actions-row">
              <button className="btn danger" onClick={onDelete}>Supprimer</button>
              <button className="btn ghost" onClick={onReopen}>Reprendre</button>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
