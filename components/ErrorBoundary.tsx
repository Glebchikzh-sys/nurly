
import React, { Component, ErrorInfo, ReactNode } from 'react';

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

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in React Tree:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAFAF9] p-8 text-center font-sans">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-red-500 text-3xl">error_outline</span>
          </div>
          <h1 className="text-xl font-bold text-[#111] mb-2">Something went wrong</h1>
          <p className="text-[#777] mb-6 max-w-sm">
            The application encountered an unexpected error. We've logged this issue.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#6B8E88] text-white font-bold rounded-full shadow-lg active:scale-95 transition-transform"
          >
            Reload Application
          </button>
          {this.state.error && (
            <pre className="mt-8 p-4 bg-gray-100 rounded-lg text-xs text-left overflow-auto max-w-full text-gray-500">
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
