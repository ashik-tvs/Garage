import React from 'react';

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 * and displays a fallback UI instead of crashing the entire app
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by ErrorBoundary:', error);
      console.error('Error info:', errorInfo);
    }

    // Store error details in state
    this.setState({
      error,
      errorInfo
    });

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          backgroundColor: '#f5f5f5',
          fontFamily: 'Inter, sans-serif'
        }}>
          <div style={{
            maxWidth: '600px',
            width: '100%',
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '40px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '20px'
            }}>
              ⚠️
            </div>
            
            <h1 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#333',
              marginBottom: '10px'
            }}>
              Oops! Something went wrong
            </h1>
            
            <p style={{
              fontSize: '16px',
              color: '#666',
              marginBottom: '30px',
              lineHeight: '1.5'
            }}>
              We're sorry for the inconvenience. The application encountered an unexpected error.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{
                marginBottom: '20px',
                textAlign: 'left',
                backgroundColor: '#f9f9f9',
                padding: '15px',
                borderRadius: '4px',
                border: '1px solid #e0e0e0'
              }}>
                <summary style={{
                  cursor: 'pointer',
                  fontWeight: '600',
                  color: '#f36f21',
                  marginBottom: '10px'
                }}>
                  Error Details (Development Only)
                </summary>
                <pre style={{
                  fontSize: '12px',
                  color: '#c3111e',
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <div style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={this.handleReset}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#f36f21',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#d45a0f'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#f36f21'}
              >
                Try Again
              </button>
              
              <button
                onClick={() => window.location.href = '/home'}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#fff',
                  color: '#f36f21',
                  border: '2px solid #f36f21',
                  borderRadius: '5px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#f36f21';
                  e.target.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#fff';
                  e.target.style.color = '#f36f21';
                }}
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
