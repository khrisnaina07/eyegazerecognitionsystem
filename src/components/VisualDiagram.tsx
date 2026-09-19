import React from 'react';
import { ProcessStep } from '../types';

interface VisualDiagramProps {
  type: ProcessStep['visualType'];
  title: string;
  partCode: string;
}

export const VisualDiagram: React.FC<VisualDiagramProps> = ({ type, title, partCode }) => {
  return (
    <div className="relative w-full h-48 bg-slate-950/80 border border-slate-700/60 rounded-xl overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Engineering blueprint grid backdrop */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #3b82f6 1px, transparent 1px),
            linear-gradient(to bottom, #3b82f6 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Blueprint header badge */}
      <div className="absolute top-2 left-3 flex items-center gap-2">
        <span className="text-[10px] font-mono tracking-wider text-blue-400 bg-blue-950/80 border border-blue-800/60 px-2 py-0.5 rounded">
          JIG & PART SCHEMATIC: {partCode}
        </span>
      </div>

      {/* Visual illustration based on step type */}
      <div className="relative z-10 w-full flex items-center justify-center my-auto">
        {type === 'wiper' && (
          <svg className="w-36 h-28 text-cyan-400" viewBox="0 0 160 120" fill="none" stroke="currentColor">
            {/* Wiper cap station & rubber blade */}
            <rect x="25" y="65" width="110" height="35" rx="4" strokeWidth="2.5" className="fill-slate-900" />
            <path d="M40 65 L40 30 C40 25, 55 20, 75 20 C95 20, 110 25, 110 30 L110 65" strokeWidth="2" strokeDasharray="3 3" />
            {/* Rubber Wiper Blade */}
            <path d="M70 65 L70 35 L85 35 L85 65 Z" fill="#06b6d4" stroke="#22d3ee" strokeWidth="2" />
            {/* Tension spring */}
            <path d="M120 75 Q125 70, 125 65 Q125 60, 130 65 Q135 70, 135 65" stroke="#f59e0b" strokeWidth="2" />
            {/* Alignment arrows */}
            <path d="M77 15 L77 28 M73 24 L77 28 L81 24" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
            <text x="80" y="112" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">WIPER BLADE & CAP DOCK</text>
          </svg>
        )}

        {type === 'board' && (
          <svg className="w-40 h-28 text-emerald-400" viewBox="0 0 180 120" fill="none" stroke="currentColor">
            {/* Main Board PCB */}
            <rect x="20" y="20" width="140" height="80" rx="3" strokeWidth="2.5" className="fill-emerald-950/40" />
            {/* 4 Standoff screw holes */}
            <circle cx="30" cy="30" r="4" stroke="#38bdf8" strokeWidth="2" className="fill-slate-950" />
            <circle cx="150" cy="30" r="4" stroke="#38bdf8" strokeWidth="2" className="fill-slate-950" />
            <circle cx="30" cy="90" r="4" stroke="#38bdf8" strokeWidth="2" className="fill-slate-950" />
            <circle cx="150" cy="90" r="4" stroke="#38bdf8" strokeWidth="2" className="fill-slate-950" />
            {/* IC chip */}
            <rect x="65" y="45" width="40" height="30" rx="2" stroke="#10b981" strokeWidth="1.5" className="fill-slate-900" />
            {/* Connectors */}
            <rect x="45" y="20" width="30" height="8" rx="1" stroke="#f59e0b" strokeWidth="1.5" className="fill-amber-950" />
            <rect x="105" y="20" width="30" height="8" rx="1" stroke="#f59e0b" strokeWidth="1.5" className="fill-amber-950" />
            <text x="90" y="112" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">MAIN CONTROLLER PCB</text>
          </svg>
        )}

        {type === 'screw' && (
          <svg className="w-36 h-28 text-amber-400" viewBox="0 0 160 120" fill="none" stroke="currentColor">
            {/* Screw driver bit and screw */}
            <path d="M80 10 L80 40 M74 40 L86 40 L83 60 L77 60 Z" stroke="#38bdf8" strokeWidth="2" className="fill-sky-950" />
            {/* Screw thread */}
            <path d="M75 60 L85 60 L83 90 L77 90 Z" stroke="#f59e0b" strokeWidth="2" className="fill-amber-950" />
            <line x1="75" y1="67" x2="85" y2="69" stroke="#f59e0b" strokeWidth="1.5" />
            <line x1="75" y1="74" x2="85" y2="76" stroke="#f59e0b" strokeWidth="1.5" />
            <line x1="76" y1="81" x2="84" y2="83" stroke="#f59e0b" strokeWidth="1.5" />
            {/* Torque arrow rotation */}
            <path d="M96 35 C108 38, 112 50, 106 58" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M102 58 L106 58 L108 53" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
            <text x="80" y="112" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">TORQUE SCREWDRIVER (0.40 Nm)</text>
          </svg>
        )}

        {type === 'connector' && (
          <svg className="w-36 h-28 text-sky-400" viewBox="0 0 160 120" fill="none" stroke="currentColor">
            {/* Male & Female Header Connectors */}
            <rect x="25" y="45" width="45" height="30" rx="3" stroke="#38bdf8" strokeWidth="2" className="fill-sky-950/40" />
            <rect x="90" y="45" width="45" height="30" rx="3" stroke="#38bdf8" strokeWidth="2" className="fill-sky-950/40" />
            {/* Pins */}
            <line x1="70" y1="53" x2="90" y2="53" stroke="#f59e0b" strokeWidth="2" />
            <line x1="70" y1="60" x2="90" y2="60" stroke="#f59e0b" strokeWidth="2" />
            <line x1="70" y1="67" x2="90" y2="67" stroke="#f59e0b" strokeWidth="2" />
            {/* Insert arrow */}
            <path d="M72 32 L88 32 M83 27 L88 32 L83 37" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
            <text x="80" y="112" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">LATCH & LOCK CONNECTOR</text>
          </svg>
        )}

        {type === 'harness' && (
          <svg className="w-36 h-28 text-purple-400" viewBox="0 0 160 120" fill="none" stroke="currentColor">
            {/* Harness wire bundle route */}
            <path d="M20 70 C40 30, 80 90, 110 40 C125 20, 140 30, 150 50" stroke="#a855f7" strokeWidth="4" strokeLinecap="round" />
            <path d="M20 75 C40 35, 80 95, 110 45 C125 25, 140 35, 150 55" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
            {/* Cable clamps */}
            <rect x="55" y="45" width="12" height="18" rx="2" stroke="#f59e0b" strokeWidth="2" className="fill-amber-950" />
            <rect x="115" y="30" width="12" height="18" rx="2" stroke="#f59e0b" strokeWidth="2" className="fill-amber-950" />
            <text x="80" y="112" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">HARNESS ROUTING & CLAMPS</text>
          </svg>
        )}

        {type === 'gear' && (
          <svg className="w-36 h-28 text-yellow-400" viewBox="0 0 160 120" fill="none" stroke="currentColor">
            {/* Interlocking Spur Gears */}
            <circle cx="60" cy="55" r="28" stroke="#eab308" strokeWidth="2" strokeDasharray="6 4" className="fill-slate-900" />
            <circle cx="60" cy="55" r="8" stroke="#eab308" strokeWidth="2" className="fill-yellow-950" />
            <circle cx="108" cy="55" r="20" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5 3" className="fill-slate-900" />
            <circle cx="108" cy="55" r="6" stroke="#f59e0b" strokeWidth="2" className="fill-amber-950" />
            {/* E-Ring marker */}
            <path d="M54 50 Q66 50, 66 60 Q66 65, 56 65" stroke="#38bdf8" strokeWidth="2" />
            <text x="80" y="112" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">PF TRANSMISSION GEAR 28T</text>
          </svg>
        )}

        {type === 'spring' && (
          <svg className="w-36 h-28 text-indigo-400" viewBox="0 0 160 120" fill="none" stroke="currentColor">
            {/* Extension tension spring */}
            <path d="M30 55 L45 55 Q50 40, 55 55 Q60 70, 65 55 Q70 40, 75 55 Q80 70, 85 55 Q90 40, 95 55 Q100 70, 105 55 L125 55" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="28" cy="55" r="4" stroke="#818cf8" strokeWidth="2" />
            <circle cx="127" cy="55" r="4" stroke="#818cf8" strokeWidth="2" />
            {/* Tension force indicator */}
            <path d="M135 55 L150 55 M145 50 L150 55 L145 60" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
            <text x="80" y="112" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">TENSION SPRING (1.8 - 2.2 N)</text>
          </svg>
        )}

        {type === 'inspection' && (
          <svg className="w-36 h-28 text-teal-400" viewBox="0 0 160 120" fill="none" stroke="currentColor">
            {/* Inspection magnifying loupe over alignment line */}
            <circle cx="70" cy="50" r="26" stroke="#2dd4bf" strokeWidth="3" className="fill-teal-950/30" />
            <line x1="88" y1="68" x2="115" y2="95" stroke="#2dd4bf" strokeWidth="4" strokeLinecap="round" />
            <circle cx="70" cy="50" r="2" fill="#2dd4bf" />
            <line x1="45" y1="50" x2="95" y2="50" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="70" y1="25" x2="70" y2="75" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" />
            <path d="M62 50 L68 56 L78 44" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <text x="80" y="112" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">QA OPTICAL ALIGNMENT CHECK</text>
          </svg>
        )}

        {type === 'roller' && (
          <svg className="w-36 h-28 text-blue-400" viewBox="0 0 160 120" fill="none" stroke="currentColor">
            {/* Paper feed roller shaft */}
            <rect x="25" y="45" width="110" height="25" rx="3" stroke="#38bdf8" strokeWidth="2.5" className="fill-slate-900" />
            {/* Rubber rings */}
            <rect x="40" y="42" width="18" height="31" rx="2" stroke="#60a5fa" strokeWidth="1.5" className="fill-blue-950" />
            <rect x="75" y="42" width="18" height="31" rx="2" stroke="#60a5fa" strokeWidth="1.5" className="fill-blue-950" />
            <rect x="105" y="42" width="18" height="31" rx="2" stroke="#60a5fa" strokeWidth="1.5" className="fill-blue-950" />
            <text x="80" y="112" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">PF SHAFT & RUBBER ROLLERS</text>
          </svg>
        )}
      </div>

      <div className="absolute bottom-2 right-3 text-[10px] font-mono text-slate-400">
        REF: {title.slice(0, 24)}...
      </div>
    </div>
  );
};
