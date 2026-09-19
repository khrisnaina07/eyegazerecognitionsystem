import React, { useState } from 'react';
import { Stage } from '../types';
import { QrCode, Play, Layers, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface MechaStartModalProps {
  isOpen: boolean;
  stage: Stage;
  currentMechaNumber: string;
  onConfirmMecha: (mechaNumber: string) => void;
  onOpenStageModal: () => void;
}

export const MechaStartModal: React.FC<MechaStartModalProps> = ({
  isOpen,
  stage,
  currentMechaNumber,
  onConfirmMecha,
  onOpenStageModal,
}) => {
  const [inputNumber, setInputNumber] = useState(currentMechaNumber || 'M-001');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputNumber.trim()) {
      onConfirmMecha(inputNumber.trim().toUpperCase());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 border-blue-500/70 rounded-3xl w-full max-w-lg shadow-2xl shadow-blue-950/60 overflow-hidden p-6 sm:p-8 space-y-6">
        {/* Top Icon & Brand */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#003399] px-3 py-1 rounded text-white font-extrabold tracking-widest text-base shadow-sm">
              EPSON
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Work Instruction System
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">Operator Terminal Start Gate</p>
            </div>
          </div>

          <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <QrCode className="w-5 h-5" />
          </div>
        </div>

        {/* Selected Stage Overview */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-blue-400 uppercase tracking-wider">
              STAGE AKTIF:
            </span>
            <button
              type="button"
              onClick={onOpenStageModal}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium underline decoration-dotted flex items-center gap-1 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              Ganti Stage
            </button>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-mono text-sm font-extrabold text-blue-400">{stage.code}</span>
            <span className="text-white font-bold text-base">{stage.name}</span>
          </div>

          <div className="flex items-center gap-3 pt-1 text-xs text-slate-400 font-mono">
            <span>Total: <strong>{stage.processes.length} Proses</strong></span>
            <span>•</span>
            <span>Target Cycle Time: <strong>15:00 (900s)</strong></span>
          </div>
        </div>

        {/* Form to enter/scan Mecha Number and click OK */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-blue-400" />
              SCAN / MASUKKAN NOMOR MECHA:
            </label>
            <p className="text-[11px] text-slate-400">
              Program perakitan hanya akan berjalan setelah nomor Mecha dikonfirmasi dengan mengklik tombol OK di bawah.
            </p>

            <input
              type="text"
              value={inputNumber}
              onChange={(e) => setInputNumber(e.target.value)}
              placeholder="Contoh: M-001"
              className="w-full bg-slate-950 border-2 border-blue-500/80 focus:border-cyan-400 rounded-2xl px-5 py-4 text-xl font-mono font-extrabold text-cyan-300 tracking-wider uppercase focus:outline-none shadow-inner"
              autoFocus
              required
            />
          </div>

          {/* Prominent OK Button to Start Program */}
          <button
            type="submit"
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-extrabold text-base rounded-2xl shadow-xl shadow-emerald-950/60 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>OK — MULAI PENGERJAAN MECHA</span>
          </button>
        </form>

        {/* Operational Note */}
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3 flex items-center gap-2.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Timer pengerjaan Proses 01 akan langsung aktif dan menghitung mundur begitu tombol <strong>OK</strong> ditekan.
          </span>
        </div>
      </div>
    </div>
  );
};
