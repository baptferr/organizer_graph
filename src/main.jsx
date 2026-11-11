import { Component, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="app-error">
          <h1>Une erreur est survenue</h1>
          <pre>{String(this.state.error?.message || this.state.error)}</pre>
          <p>Rechargez la page (Ctrl+Shift+R). Si le problème persiste, copiez le message ci-dessus.</p>
        </div>
      )
    }
    return this.props.children
  }
}

function webglSupported() {
  try {
    const canvas = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')))
  } catch {
    return false
  }
}

const root = createRoot(document.getElementById('root'))

if (webglSupported()) {
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  )
} else {
  root.render(
    <div className="app-error">
      <h1>WebGL indisponible</h1>
      <p>Cette application affiche un graphique 3D et nécessite WebGL, qui semble désactivé ou indisponible dans votre navigateur.</p>
      <p>
        Dans Firefox : tapez <code>about:config</code> et vérifiez que <code>webgl.disabled</code> vaut{' '}
        <code>false</code> ; puis dans Réglages → Général → Performance, laissez « Utiliser l’accélération graphique
        si disponible » activée, et redémarrez Firefox.
      </p>
    </div>,
  )
}
