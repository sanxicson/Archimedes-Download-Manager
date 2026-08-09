import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { BandwidthPoint } from '../types/idm';
import { Gauge, Sliders, Zap, ShieldAlert, Cpu } from 'lucide-react';

interface Props {
  bandwidthHistory: BandwidthPoint[];
  currentSpeedKbps: number;
  speedLimitKbps: number;
  onSetSpeedLimit: (limitKbps: number) => void;
}

export const SpeedGraph: React.FC<Props> = ({
  bandwidthHistory,
  currentSpeedKbps,
  speedLimitKbps,
  onSetSpeedLimit,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-lg text-white">
              Token Bucket Rate Limiter & Bandwidth
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time connection pool throughput and atomic token refill monitor
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-lg border border-slate-800">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Current Bandwidth
            </div>
            <div className="text-lg font-mono font-bold text-emerald-400">
              {(currentSpeedKbps / 1024).toFixed(2)} MB/s
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Limiter Status
            </div>
            <div className="text-xs font-mono font-bold text-amber-400">
              {speedLimitKbps === 0 ? 'Unlimited' : `${(speedLimitKbps / 1024).toFixed(2)} MB/s`}
            </div>
          </div>
        </div>
      </div>

      {/* Speed Slider Control */}
      <div className="mt-4 bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-lg">
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="flex items-center gap-1.5 font-semibold text-slate-200">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Global Token Bucket Throttle:</span>
          </div>
          <span className="font-mono text-amber-300 font-bold">
            {speedLimitKbps === 0 ? 'Unlimited (Max Network Pipe)' : `${speedLimitKbps} KB/s (${(speedLimitKbps / 1024).toFixed(2)} MB/s)`}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={20480} // 20 MB/s
            step={512}
            value={speedLimitKbps}
            onChange={(e) => onSetSpeedLimit(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
          <button
            onClick={() => onSetSpeedLimit(0)}
            className={`px-2.5 py-1 text-[11px] font-bold rounded border transition-all ${
              speedLimitKbps === 0
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            OFF
          </button>
          <button
            onClick={() => onSetSpeedLimit(2048)}
            className={`px-2.5 py-1 text-[11px] font-bold rounded border transition-all ${
              speedLimitKbps === 2048
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            2 MB/s
          </button>
          <button
            onClick={() => onSetSpeedLimit(8192)}
            className={`px-2.5 py-1 text-[11px] font-bold rounded border transition-all ${
              speedLimitKbps === 8192
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            8 MB/s
          </button>
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div className="mt-4 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={bandwidthHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="speedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="limitGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
            <YAxis stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={(val) => `${(val / 1024).toFixed(2)}M`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
              formatter={(value: any, name: any) => [
                `${(Number(value) / 1024).toFixed(2)} MB/s`,
                name === 'speedKbps' ? 'Actual Speed' : 'Speed Limit'
              ]}
            />
            <Area
              type="monotone"
              dataKey="speedKbps"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#speedGrad)"
            />
            {speedLimitKbps > 0 && (
              <Area
                type="stepAfter"
                dataKey="limitKbps"
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#limitGrad)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 text-[11px] text-slate-400 font-mono flex items-center justify-between">
        <span className="flex items-center gap-1 text-slate-400">
          <Cpu className="w-3.5 h-3.5 text-amber-400" />
          Atomic Token Bucket algorithm: <code className="text-amber-300">tokens.fetch_sub(bytes_read)</code>
        </span>
        <span className="text-slate-500">Refill Interval: 50ms</span>
      </div>
    </div>
  );
};
