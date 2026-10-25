import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  failed: boolean;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('QueueUp page crashed', error, info.componentStack);
  }

  render() {
    if (this.state.failed) {
      return (
        <main className="page">
          <h1>Something went wrong</h1>
          <p>This page hit a problem. Your token and your place in the queue are safe.</p>
          <button type="button" onClick={() => window.location.reload()}>
            Reload the page
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}
