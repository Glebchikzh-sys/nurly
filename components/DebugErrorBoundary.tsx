
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class DebugErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Catch errors in any components below and re-render with error message
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    // You can also log error messages to an error reporting service here
    console.error("Uncaught error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    // Attempt to clear local storage if it's a data corruption issue
    try {
        localStorage.clear();
        window.location.reload();
    } catch (e) {
        window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAF9] p-6 text-ink font-sans">
          <div className="max-w-md w-full bg-white rounded-[32px] shadow-xl border border-black/5 p-8 text-center animate-slide-up">
            
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-red-500 text-5xl filled">
                warning
              </span>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight mb-3 text-ink">
              Something went wrong
            </h1>
            
            <p className="text-ink-muted mb-8 text-sm leading-relaxed">
              We encountered an unexpected error. You can try reloading the app, or resetting if the issue persists.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReload}
                className="w-full py-4 bg-sage text-white font-bold rounded-2xl hover:bg-sage-dark transition-colors shadow-lg shadow-sage/20 active:scale-95 duration-200"
              >
                Reload Application
              </button>
              
              <button
                onClick={this.handleReset}
                className="w-full py-4 bg-transparent text-ink-muted font-bold text-xs uppercase tracking-widest hover:text-red-500 transition-colors"
              >
                Factory Reset & Reload
              </button>
            </div>

            {/* Debug Details */}
            <div className="mt-8 text-left">
              <details className="group cursor-pointer">
                <summary className="text-xs font-bold text-ink-muted uppercase tracking-widest list-none flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm transition-transform group-open:rotate-90">
                    chevron_right
                  </span>
                  View Error Details
                </summary>
                <div className="mt-4 p-4 bg-gray-50 rounded-xl overflow-x-auto border border-black/5">
                  <p className="text-red-600 font-mono text-xs font-bold mb-2">
                    {this.state.error && this.state.error.toString()}
                  </p>
                  <pre className="text-[10px] text-gray-500 font-mono whitespace-pre-wrap leading-tight">
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </pre>
                </div>
              </details>
            </div>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
