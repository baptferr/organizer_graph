import { useState } from 'react'
import { CRITERIA, createTask } from '../lib/model.js'

const EMPTY = { envie: 0, complexite: 0, besoin: 0 }

export default function AddTaskModal({ onAdd, onClose }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [values, setValues] = useState(EMPTY)
  const [dueDate, setDueDate] = useState('')
  const [error, setError] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Le nom de la tâche est obligatoire.')
      return
    }
    onAdd(createTask({ name, description, ...values, dueDate }))
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <header className="modal-header">
          <h2>Nouvelle tâche</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Fermer">✕</button>
        </header>

        <label className="field">
          <span>Nom *</span>
          <input
            autoFocus
            value={name}
            onChange={(e) => { setName(e.target.value); setError('') }}
            placeholder="Ex. : préparer la réunion"
          />
        </label>

        <label className="field">
          <span>Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Détails, étapes, notes…"
          />
        </label>

        {CRITERIA.map((c) => (
          <div className="field slider-field" key={c.key}>
            <div className="slider-head">
              <span>{c.label}</span>
              <strong className={values[c.key] >= 0 ? 'pos' : 'neg'}>
                {values[c.key] > 0 ? `+${values[c.key]}` : values[c.key]}
              </strong>
            </div>
            <input
              type="range"
              min="-10"
              max="10"
              step="1"
              value={values[c.key]}
              onChange={(e) => setValues((v) => ({ ...v, [c.key]: Number(e.target.value) }))}
            />
            <small>{c.hint}</small>
          </div>
        ))}

        <label className="field">
          <span>Échéance (optionnelle)</span>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </label>

        {error && <p className="form-error">{error}</p>}

        <footer className="modal-footer">
          <button type="button" className="btn ghost" onClick={onClose}>Annuler</button>
          <button type="submit" className="btn primary">Ajouter la tâche</button>
        </footer>
      </form>
    </div>
  )
}
