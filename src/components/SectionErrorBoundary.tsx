import { Component, type ReactNode } from "react";
import { isNativeMobileApp } from "@/lib/platform";

interface Props {
  children: ReactNode;
  name: string;
  fallbackHeight?: string;
}

interface State {
  failed: boolean;
}

/**
 * Keeps a non-critical dashboard widget from taking down the member experience.
 * Errors are still emitted with a section name so they are actionable in Xcode.
 */
export class SectionErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    console.error(`[CEO Mind OS] Dashboard section failed: ${this.props.name} :: ${error.name}: ${error.message}\n${error.stack ?? ""}`);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <div
        className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-100"
        style={{ minHeight: this.props.fallbackHeight ?? "64px" }}
      >
        {isNativeMobileApp()
          ? `${this.props.name} is temporarily unavailable. The rest of CEO Mind OS is ready to use.`
          : `${this.props.name} is temporarily unavailable.`}
      </div>
    );
  }
}
