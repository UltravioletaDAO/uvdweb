import React from 'react';
import i18n from '../i18n/config';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    if (process.env.REACT_APP_DEBUG_ENABLED === 'true') {
      console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack);
    }
  }

  componentDidUpdate(prevProps) {
    // Reset the boundary when the route changes. Without this, a crash on a
    // single page keeps the "Algo salió mal" screen stuck for the ENTIRE app
    // until a full reload, making every nav link look broken.
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full border-2 border-ultraviolet/60 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-ultraviolet"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                {i18n.t('errorBoundary.title')}
              </h2>
              <p className="text-text-secondary text-sm">
                {i18n.t('errorBoundary.message')}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-ultraviolet hover:bg-ultraviolet-light
                text-white font-semibold rounded-lg transition-colors duration-200 focus:outline-none
                focus:ring-2 focus:ring-ultraviolet focus:ring-offset-2 focus:ring-offset-background"
            >
              {i18n.t('errorBoundary.reload')}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
