import React, { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#0a0a0a',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: "'Inter', sans-serif",
          textAlign: 'center',
        }}>
          <div style={{
            background: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '400px',
            width: '100%',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', color: '#ff4444' }}>
              Error de aplicacion
            </h2>
            <p style={{ fontSize: '14px', color: '#aaa', marginBottom: '16px' }}>
              {this.state.error?.message || 'Ocurrio un error inesperado'}
            </p>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              style={{
                background: '#1ed760',
                color: '#000',
                border: 'none',
                borderRadius: '999px',
                padding: '12px 24px',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              Limpiar datos y recargar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
