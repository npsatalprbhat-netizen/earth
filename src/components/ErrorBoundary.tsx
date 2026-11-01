import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('EarthPulse Uncaught Component Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // Ignore storage errors
    }
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col items-center justify-center p-6 font-sans">
          <div className="max-w-xl w-full bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-8 shadow-2xl glass-panel-glow text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-950/80 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-950/50">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div>
              <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-rose-950 border border-rose-500/40 text-rose-300">
                SYSTEM RECOVERY PROTOCOL ACTIVE
              </span>
              <h1 className="font-chakra text-2xl sm:text-3xl font-bold text-white mt-3">
                EarthPulse Telemetry Interruption
              </h1>
              <p className="text-slate-300 text-sm mt-2 leading-relaxed">
                A client rendering exception was caught. The platform has automatically isolated the subsystem to protect your session.
              </p>
            </div>

            {this.state.error && (
              <div className="text-left bg-slate-950/90 rounded-xl p-4 border border-slate-800 text-xs font-mono text-rose-300 overflow-x-auto max-h-36">
                <strong>Error:</strong> {this.state.error.message || 'Unknown error occurred'}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold font-chakra text-xs flex items-center justify-center gap-2 hover:brightness-110 shadow-lg shadow-cyan-500/30 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>RELOAD APPLICATION</span>
              </button>

              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-chakra text-xs flex items-center justify-center gap-2 border border-slate-600 transition-all cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>RESET TO HOME</span>
              </button>
            </div>

            <div className="text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-800">
              NASA-ISRO NISAR Planetary Observation Subsystem • NASA Space Apps Challenge
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
