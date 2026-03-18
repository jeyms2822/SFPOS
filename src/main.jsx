import { Component, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class RootErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Root render crash:', error, info)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#fff8f8', color: '#2b1d1d', fontFamily: 'Segoe UI, sans-serif' }}>
        <div style={{ maxWidth: 760, width: '100%', border: '1px solid #efcaca', borderRadius: 12, background: '#fff', padding: 20 }}>
          <h1 style={{ margin: '0 0 10px', fontSize: 20 }}>App crashed while loading</h1>
          <p style={{ margin: '0 0 10px' }}>Please send this message so it can be fixed:</p>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', background: '#faf4f4', border: '1px solid #f0d6d6', borderRadius: 8, padding: 12, fontSize: 13 }}>
            {String(this.state.error?.message || this.state.error)}
          </pre>
        </div>
      </div>
    )
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </StrictMode>,
)
