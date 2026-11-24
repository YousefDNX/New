import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackDesc?: string;
  retryLabel?: string;
  homeLabel?: string;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  override state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[AppErrorBoundary] Module render error:", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  override render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div
        role="alert"
        data-testid="workspace-error-boundary"
        className="surface-card mx-auto my-8 max-w-lg space-y-4 p-6 text-center sm:p-8"
      >
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/15 text-destructive">
          <AlertTriangle className="size-6" />
        </div>
        <div className="space-y-1.5">
          <h2 className="font-display text-lg font-bold text-foreground">
            {this.props.fallbackTitle ?? "Something went wrong in this workspace"}
          </h2>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {this.props.fallbackDesc ??
              "Your session and saved progress are safe. Try reloading this view or return to your Growth Map."}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2 pt-1">
          <Button
            type="button"
            variant="glow"
            size="sm"
            onClick={this.handleReset}
            className="gap-1.5"
          >
            <RotateCcw className="size-3.5" />
            <span>{this.props.retryLabel ?? "Try again"}</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              this.handleReset();
              if (typeof window !== "undefined") {
                window.location.assign("/app");
              }
            }}
          >
            {this.props.homeLabel ?? "Return to Dashboard"}
          </Button>
        </div>
      </div>
    );
  }
}
