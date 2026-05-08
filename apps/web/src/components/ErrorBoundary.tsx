import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return this.props.fallback ?? (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-zinc-900 border border-red-500/40 rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">💥</div>
            <h1 className="text-xl font-black text-red-400 mb-2">Something went wrong</h1>
            <p className="text-sm text-zinc-400 mb-6">{this.state.error.message}</p>
            <button
              onClick={() => this.setState({ error: null })}
              className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-bold transition"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
