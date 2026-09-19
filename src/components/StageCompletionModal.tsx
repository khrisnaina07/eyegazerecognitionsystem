import React, { useState } from 'react';
import { Stage } from '../types';
import { CheckCircle, Award, QrCode, ArrowRight, RefreshCw } from 'lucide-react';

interface StageCompletionModalProps {
  isOpen: boolean;
  stage: Stage;
  mechaNumber: string;
  onStartNextMecha: (newMechaNumber: string) => void;
  onOpenStageModal: () => void;
}

export const StageCompletionModal: React.FC<StageCompletionModalProps> = ({
  isOpen,
  stage,
  mechaNumber,
  onStartNextMecha,
  onOpenStageModal,
}) => {
  const [nextMechaInput, setNextMechaInput] = useState(() => {
    // Generate next sequential Mecha ID e.g. M-001 -> M-002
    const numMatch = mechaNumber.match(/(\d+)$/);
    if (numMatch) {
      const nextNum = parseInt(numMatch[1], 10) + 1;
      const prefix = mechaNumber.slice(0, numMatch.index);
      return `${prefix}${String(nextNum).padStart(numMatch[1].length, '0')}`;
    }
    return `${mechaNumber}-NEXT`;
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nextMechaInput.trim()) {
      onStartNextMecha(nextMechaInput.trim().toUpperCase());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 border-emerald-500/80 rounded-3xl w-full max-w-xl shadow-2xl shadow-emerald-950/60 overflow-hidden text-center p-6 sm:p-8 space-y-6">
        {/* Celebration Trophy Icon */}
        <div className="mx-auto w-20 h-20 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-inner">
          <Award className="w-10 h-10 animate-bounce" />
        </div>

        {/* Title */}
        <div>
          <span className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800">
            100% SIKLUS PROSES SELESAI
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
            {stage.code} COMPLETED
          </h2>
          <p className="text-sm text-slate-300 mt-1 font-medium">
            {stage.name}
          </p>
        </div>

        {/* Summary Metric Badges */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-950/80 border border-slate-800 rounded-2xl font-mono text-left">
          <div>
            <span className="text-[11px] text-slate-400 block">MECHA SELESAI:</span>
            <span className="text-sm font-bold text-cyan-300">{mechaNumber}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">TOTAL PROSES:</span>
            <span className="text-sm font-bold text-emerald-400">{stage.processes.length} / {stage.processes.length}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">CYCLE TIME:</span>
            <span className="text-sm font-bold text-white">15:00 (900s)</span>
          </div>
        </div>

        {/* Requirement 28 & 29 Explanation */}
        <div className="p-3 bg-blue-950/40 border border-blue-800/50 rounded-xl text-left text-xs text-blue-200 leading-relaxed">
          <strong className="font-semibold text-blue-300">Konsep Siklus Produksi:</strong> Sesuai SOP Epson, sistem <span className="underline font-bold">tetap berada pada {stage.code}</span> untuk produk Mecha berikutnya. Masukkan / scan nomor Mecha berikutnya untuk memulai kembali dari Process 01.
        </div>

        {/* Next Mecha Input Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="text-left text-xs font-mono font-medium text-slate-300 flex items-center gap-1.5">
            <QrCode className="w-4 h-4 text-blue-400" />
            SCAN ATAU MASUKKAN NOMOR MECHA BERIKUTNYA:
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={nextMechaInput}
              onChange={(e) => setNextMechaInput(e.target.value)}
              placeholder="Nomor Mecha berikutnya..."
              className="flex-1 bg-slate-950 border border-blue-500/80 focus:border-blue-400 rounded-xl px-4 py-3 text-sm font-mono font-bold text-white uppercase focus:outline-none tracking-wider"
              autoFocus
            />

            <button
              type="submit"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-950/50 flex items-center gap-2 transition-all cursor-pointer shrink-0"
            >
              <span>Mulai Mecha Ini</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Option to change stage manually if required */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Ingin beralih ke Stage lain?</span>
          <button
            type="button"
            onClick={onOpenStageModal}
            className="text-blue-400 hover:text-blue-300 font-semibold underline decoration-dotted cursor-pointer"
          >
            Pilih Stage Lain Secara Manual
          </button>
        </div>
      </div>
    </div>
  );
};
