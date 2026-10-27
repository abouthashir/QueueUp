import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '../ui/Button';
import ProblemScreen from '../ui/ProblemScreen';

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
        <ProblemScreen
          title="Something went wrong"
          message="This page hit a problem. Your token and your place in the queue are safe."
        >
          <Button onClick={() => window.location.reload()}>Reload the page</Button>
        </ProblemScreen>
      );
    }

    return this.props.children;
  }
}
