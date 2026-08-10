import React, { useState } from 'react';
import { RUST_CODEBASE, RustFile } from '../data/rustCode';
import { Code, Copy, Check, FileCode, Terminal, BookOpen, Cpu } from 'lucide-react';

export const RustCodeExplorer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<RustFile>(RUST_CODEBASE[1]); // multiplexer.rs default
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-lg text-white">
              Rust Tokio Engine Implementation (Production Code)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise-grade Rust Tokio networking core with non-blocking I/O and dynamic segment multiplexing
          </p>
        </div>

        <button
          onClick={handleCopy}
          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied File' : 'Copy Code'}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* File Directory Sidebar */}
        <div className="space-y-1.5 bg-slate-950 p-2 rounded-lg border border-slate-800 h-fit">
          <div className="text-[10px] uppercase font-bold text-slate-500 px-2 py-1 tracking-wider">
            Engine Modules
          </div>
          {RUST_CODEBASE.map((file) => {
            const isSelected = selectedFile.path === file.path;
            return (
              <button
                key={file.path}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left px-2.5 py-2 rounded-md font-mono text-xs flex items-center gap-2 transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <FileCode className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-indigo-400'}`} />
                <span className="truncate">{file.filename}</span>
              </button>
            );
          })}
        </div>

        {/* Code Content Viewer */}
        <div className="lg:col-span-3 space-y-3">
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-slate-500">Path: </span>
              <span className="text-indigo-300 font-bold">{selectedFile.path}</span>
            </div>
            <span className="text-slate-400 text-[11px]">{selectedFile.description}</span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs text-indigo-100 overflow-x-auto max-h-[500px] leading-relaxed">
            <pre>{selectedFile.code}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};