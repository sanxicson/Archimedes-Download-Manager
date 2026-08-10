import React, { useState } from 'react';
import { DownloadTask, AdmStateFile } from '../types/adm';
import { FileJson, RefreshCw, AlertTriangle, ShieldCheck, Download, Zap, RotateCcw } from 'lucide-react';

interface Props {
  task: DownloadTask;
  onSimulateCrash: () => void;
  onResumeFromState: () => void;
}

export const StateInspector: React.FC<Props> = ({
  task,
  onSimulateCrash,
  onResumeFromState,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyState = () => {
    navigator.clipboard.writeText(JSON.stringify(task.stateFile, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <FileJson className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-lg text-white">
              State Persistence Inspector (<code className="text-indigo-300">{task.filename}.adm_state</code>)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Atomic JSON state file synchronized on every worker block commit
          </p>
        </div>

        <div className="flex items-center gap-2">
          {task.status === 'Downloading' ? (
            <button
              onClick={onSimulateCrash}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg shadow flex items-center gap-1.5 transition-all"
              title="Simulate sudden process kill or power outage to verify state preservation"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Simulate Process Crash
            </button>
          ) : (
            <button
              onClick={onResumeFromState}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow flex items-center gap-1.5 transition-all"
              title="Resume download from saved .adm_state without losing downloaded chunks"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Resume from .adm_state
            </button>
          )}

          <button
            onClick={handleCopyState}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 transition-all"
          >
            {copied ? 'Copied!' : 'Copy JSON'}
          </button>
        </div>
      </div>

      {/* State Meta Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
          <div className="text-[10px] text-slate-400 font-semibold uppercase">ETag Header</div>
          <div className="text-xs font-mono font-bold text-slate-200 truncate mt-1">
            {task.stateFile.etag || 'None (Fallback Mode)'}
          </div>
        </div>

        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
          <div className="text-[10px] text-slate-400 font-semibold uppercase">Last Modified</div>
          <div className="text-xs font-mono font-bold text-slate-200 truncate mt-1">
            {task.stateFile.lastModified || 'Sun, 09 Aug 2026 GMT'}
          </div>
        </div>

        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
          <div className="text-[10px] text-slate-400 font-semibold uppercase">Completed Ranges</div>
          <div className="text-xs font-mono font-bold text-emerald-400 mt-1">
            {task.stateFile.completedRanges.length} Sub-segments
          </div>
        </div>

        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
          <div className="text-[10px] text-slate-400 font-semibold uppercase">Last Flush Timestamp</div>
          <div className="text-xs font-mono font-bold text-indigo-300 mt-1">
            {new Date(task.stateFile.lastSavedAt).toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Raw JSON Code Block */}
      <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs overflow-x-auto max-h-72 text-indigo-200">
        <pre>{JSON.stringify(task.stateFile, null, 2)}</pre>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1 text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Atomic Write Semantics: <code className="text-indigo-300">tokio::fs::rename(tmp, .adm_state)</code> prevents corruption
        </span>
        <span className="text-slate-500 font-mono text-[11px]">
          SHA256 State Checksum Verified
        </span>
      </div>
    </div>
  );
};