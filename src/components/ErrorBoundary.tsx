import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

/**
 * Catches runtime errors (e.g. localStorage corruption, mapbox failures)
 * and shows a recoverable error screen instead of a blank white page.
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0A0F1A',
            color: '#F0F2F5',
            fontFamily: '"IBM Plex Mono", monospace',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <h1 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#F0555E' }}>
            Application Error
          </h1>
          <p style={{ fontSize: '0.75rem', color: '#A0AAB8', maxWidth: '400px', marginBottom: '1.5rem' }}>
            {this.state.errorMessage || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, errorMessage: '' });
              window.location.reload();
            }}
            style={{
              padding: '0.5rem 1.5rem',
              fontSize: '0.75rem',
              background: '#2FD8CF',
              color: '#0A0F1A',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: '"IBM Plex Mono", monospace',
              fontWeight: 600,
            }}
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
