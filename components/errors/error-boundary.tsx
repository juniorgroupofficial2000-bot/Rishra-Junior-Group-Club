"use client";

import { Button } from "@/components/ui/button";
import { reportClientError } from "@/lib/observability/client-report";
import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Optional label for structured client logs. */
  name?: string;
  fallbackTitle?: string;
  fallbackDescription?: string;
};

type State = {
  error: Error | null;
};

/**
 * Component-level error boundary for interactive islands that should not
 * take down an entire route segment (e.g. admin widgets, payment widgets).
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    reportClientError(error, {
      event: "component_error_boundary",
      portal: "root",
      path: info.componentStack?.slice(0, 200),
    });
  }

  render() {
    if (this.state.error) {
      return (
        <div
          role="alert"
          className="rounded-md border border-border-default bg-surface-raised p-4"
        >
          <h2 className="font-display text-lg font-semibold text-ink-900">
            {this.props.fallbackTitle ?? "This section could not be loaded"}
          </h2>
          <p className="mt-2 text-sm text-ink-500">
            {this.props.fallbackDescription ??
              "Please try again. Other parts of the page should still work."}
          </p>
          <Button
            type="button"
            className="mt-4"
            onClick={() => this.setState({ error: null })}
          >
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
