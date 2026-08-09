import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { MERMAID_DIAGRAM_COMPONENT, MERMAID_DIAGRAM_SEQUENCE, MODULE_BREAKDOWN_DOC } from '../data/architectureDoc';
import { Layers, Workflow, BookOpen, ShieldCheck, Cpu } from 'lucide-react';

export const ArchitectureViewer: React.FC = () => {
  const componentRef = useRef<HTMLDivElement>(null);
  const sequenceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'dark',
      securityLevel: 'loose',
      fontFamily: 'monospace',
    });

    if (componentRef.current) {
      componentRef.current.removeAttribute('data-processed');
      mermaid.contentLoaded();
    }
  }, []);

  return (
    <div className="space-y-6 text-slate-100">
      {/* Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Layers className="w-5 h-5 text-indigo-400" />
          <h3 className="font-semibold text-lg text-white">System Architecture & Subsystem Diagram</h3>
        </div>

        <div className="mt-4 bg-slate-950 border border-slate-800 rounded-lg p-4 overflow-x-auto">
          <div ref={componentRef} className="mermaid flex justify-center">
            {MERMAID_DIAGRAM_COMPONENT}
          </div>
        </div>
      </div>

      {/* Sequence Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Workflow className="w-5 h-5 text-emerald-400" />
          <h3 className="font-semibold text-lg text-white">Execution Sequence & Dynamic Work Stealing Flow</h3>
        </div>

        <div className="mt-4 bg-slate-950 border border-slate-800 rounded-lg p-4 overflow-x-auto">
          <div ref={sequenceRef} className="mermaid flex justify-center">
            {MERMAID_DIAGRAM_SEQUENCE}
          </div>
        </div>
      </div>

      {/* Documentation Markdown Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <BookOpen className="w-5 h-5 text-amber-400" />
          <h3 className="font-semibold text-lg text-white">Technical Specifications & Module Breakdown</h3>
        </div>

        <div className="prose prose-invert max-w-none text-xs text-slate-300 leading-relaxed space-y-4">
          <p>
            The Internet Download Manager (IDM) 1:1 architecture is engineered around a tri-tiered execution pipeline. The frontend desktop GUI (Qt / Tauri React) presents high-level download controls and bandwidth graphs, while delegating heavy network tasks to the <strong>Rust Tokio Core Daemon</strong>.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg">
              <h4 className="font-bold text-indigo-300 text-sm mb-2 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-indigo-400" />
                1. Dynamic Segment Multiplexer
              </h4>
              <p className="text-slate-400">
                Issues HTTP HEAD probes to verify range support, content length, and ETags. Allocates 8-32 worker ranges in parallel, executing non-blocking async TCP reads into lock-free disk write buffers.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg">
              <h4 className="font-bold text-amber-300 text-sm mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                2. Dynamic Work Stealer
              </h4>
              <p className="text-slate-400">
                Monitors worker completion states. When a worker completes its assigned byte chunk early, it scans remaining active workers, locates the largest pending segment $[Start, End]$, splits it in half $[Start, Mid]$ & $[Mid+1, End]$, and spawns a new worker thread.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
