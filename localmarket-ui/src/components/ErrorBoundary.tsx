import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

type ErrorBoundaryProps = {
  children: ReactNode;
  title?: string;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(error, errorInfo);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <section className="page-error-state">
        <AlertTriangle className="size-10" />
        <h1>{this.props.title ?? "This page could not be loaded."}</h1>
        <p>
          Something went wrong while rendering this buyer page. The app is still
          running; refresh the page or go back to the buyer marketplace.
        </p>
        <div>
          <Button type="button" onClick={() => window.location.reload()}>
            Refresh
          </Button>
          <Button type="button" variant="outline" asChild>
            <a href="/buyer">Buyer marketplace</a>
          </Button>
        </div>
      </section>
    );
  }
}
