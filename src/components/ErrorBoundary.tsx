import React, { ErrorInfo, ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
          <h1 className="text-6xl md:text-8xl font-display font-light text-red-500/80 mb-4 tracking-tighter">Oops</h1>
          <h2 className="text-2xl md:text-3xl font-display font-light text-gold mb-6">Something went wrong</h2>
          <p className="text-text-muted max-w-md mx-auto mb-10 text-lg">
            A disruption occurred in the cosmic alignment. We're working to restore the balance.
          </p>
          <pre className="text-left text-xs bg-black/50 p-4 overflow-auto max-w-full text-red-400">
            {this.state.error?.toString()}
            <br />
            {this.state.error?.stack}
          </pre>
          <a
            href="/"
            className="px-8 py-3 bg-gold/10 border border-gold/40 text-gold rounded-full hover:bg-gold/20 transition-all font-medium tracking-wide shadow-[0_0_15px_rgba(212,175,55,0.1)] hover:shadow-[0_0_25px_rgba(212,175,55,0.2)]"
          >
            Return to Homepage
          </a>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
