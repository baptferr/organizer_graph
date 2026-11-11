const STORAGE_KEY = 'tache3d.tasks.v1'

export const CRITERIA = [
  { key: 'envie', label: 'Envie', hint: 'Mon envie de réaliser cette tâche' },
  { key: 'complexite', label: 'Complexité', hint: 'Difficulté estimée de la tâche' },
  { key: 'besoin', label: 'Besoin', hint: 'Contraintes extérieures, urgence imposée' },
]

export const ZONES = {
  'quick-win': {
    label: 'Satisfaction rapide',
    color: '#22c55e',
    description: 'De l’envie et une tâche facile : plaisir immédiat.',
  },
  'plaisir-facile': {
    label: 'Plaisir sans enjeu',
    color: '#2dd4bf',
    description: 'De l’envie, facile, aucune contrainte : pur plaisir.',
  },
  'investissement': {
    label: 'Investissement utile',
    color: '#3b82f6',
    description: 'Difficile mais exigé : satisfaction forte à long terme.',
  },
  'projet-plaisir': {
    label: 'Projet plaisir',
    color: '#a855f7',
    description: 'Difficile mais porté par l’envie : gratification profonde à long terme.',
  },
  'corvee-rapide': {
    label: 'Corvée express',
    color: '#f59e0b',
    description: 'Pas d’envie mais vite fait : soulagement immédiat.',
  },
  'contrainte-lourde': {
    label: 'Contrainte lourde',
    color: '#ef4444',
    description: 'Pas d’envie, long, mais nécessaire : à découper en étapes.',
  },
  'gris-facile': {
    label: 'Faible enjeu (facile)',
    color: '#94a3b8',
    description: 'Ni envie, ni besoin, et en plus facile : à faire quand il reste du temps.',
  },
  'gris-lourd': {
    label: 'Faible enjeu (lourd)',
    color: '#64748b',
    description: 'Ni envie, ni besoin, et coûteux : à oublier ou déléguer.',
  },
}

export function zoneOf({ envie, complexite, besoin }) {
  const e = envie >= 0
  const c = complexite >= 0
  const b = besoin >= 0
  if (e && !c && b) return 'quick-win'
  if (e && !c && !b) return 'plaisir-facile'
  if (e && c && b) return 'investissement'
  if (e && c && !b) return 'projet-plaisir'
  if (!e && !c && b) return 'corvee-rapide'
  if (!e && c && b) return 'contrainte-lourde'
  return c ? 'gris-lourd' : 'gris-facile'
}

export function zoneColorForSigns(sx, sy, sz) {
  return ZONES[zoneOf({ envie: sx, complexite: sy, besoin: sz })].color
}

export function daysUntil(dateStr) {
  if (!dateStr) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(`${dateStr}T00:00:00`)
  return Math.round((due - today) / 86400000)
}

export function formatDue(dateStr) {
  const d = daysUntil(dateStr)
  if (d === null) return null
  if (d < 0) return { text: `En retard de ${-d} j`, tone: 'late' }
  if (d === 0) return { text: 'À faire aujourd’hui', tone: 'soon' }
  if (d === 1) return { text: 'Pour demain', tone: 'soon' }
  return { text: `Dans ${d} j`, tone: d <= 7 ? 'soon' : 'ok' }
}

export function satisfactionScore(task) {
  const base = task.envie + 1.2 * task.besoin - 0.8 * task.complexite
  const d = daysUntil(task.dueDate)
  const urgence = d === null ? 0 : d < 0 ? 6 : Math.max(0, 6 - d * 0.6)
  return Math.round((base + urgence) * 10) / 10
}

export function createTask({ name, description, envie, complexite, besoin, dueDate }) {
  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    description: (description || '').trim(),
    envie,
    complexite,
    besoin,
    dueDate: dueDate || null,
    status: 'active',
    createdAt: Date.now(),
  }
}

export function seedTasks() {
  const inDays = (n) => {
    const d = new Date()
    d.setDate(d.getDate() + n)
    return d.toISOString().slice(0, 10)
  }
  return [
    createTask({ name: 'Ranger le bureau', description: 'Trier papiers et câbles.', envie: -3, complexite: -6, besoin: 4, dueDate: null }),
    createTask({ name: 'Préparer la présentation client', description: 'Support + répétition.', envie: -2, complexite: 5, besoin: 8, dueDate: inDays(3) }),
    createTask({ name: 'Soirée lecture / jeu', description: 'Un moment pour soi.', envie: 7, complexite: -8, besoin: -5, dueDate: null }),
    createTask({ name: 'Apprendre la 3D dans le navigateur', description: 'Tutoriel Three.js / R3F.', envie: 6, complexite: 6, besoin: -2, dueDate: null }),
    createTask({ name: 'Déclarer les impôts', description: 'Rassembler les justificatifs.', envie: -6, complexite: -2, besoin: 9, dueDate: inDays(12) }),
    createTask({ name: 'Séance de sport', description: '45 min de course.', envie: 3, complexite: -4, besoin: 5, dueDate: inDays(1) }),
  ]
}

function isValidTask(t) {
  return (
    t &&
    typeof t.id === 'string' &&
    typeof t.name === 'string' &&
    ['envie', 'complexite', 'besoin'].every((k) => typeof t[k] === 'number' && t[k] >= -10 && t[k] <= 10) &&
    ['active', 'done', 'archived'].includes(t.status)
  )
}

export function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.every(isValidTask)) return parsed
    }
  } catch {
    // stockage indisponible ou corrompu : on repart des exemples
  }
  return seedTasks()
}

export function saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  } catch {
    // quota dépassé ou mode privé : on ignore silencieusement
  }
}
