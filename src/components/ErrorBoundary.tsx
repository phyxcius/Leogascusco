import React from 'react';

interface State {
  error: Error | null;
}

/** Si la interfaz falla, muestra el error en vez de dejar la pantalla en blanco. */
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('[App] Error de interfaz:', error);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 520, margin: '40px auto' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Ocurrió un error en la página</h2>
        <p style={{ marginBottom: 12, color: '#475569' }}>
          Toca el botón para recargar. Si se repite, envía una captura de este mensaje.
        </p>
        <pre
          style={{
            background: '#fef2f2',
            color: '#991b1b',
            padding: 12,
            borderRadius: 8,
            fontSize: 12,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
        >
          {String(this.state.error && (this.state.error.stack || this.state.error.message || this.state.error))}
        </pre>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: 16,
            background: '#6b21a8',
            color: '#fff',
            padding: '10px 18px',
            borderRadius: 10,
            fontWeight: 700,
            border: 'none'
          }}
        >
          Recargar página
        </button>
      </div>
    );
  }
}
