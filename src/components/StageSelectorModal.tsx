import React from 'react';
import { Stage } from '../types';
import { ALL_STAGES } from '../data/stagesData';
import { X, Cpu, Clock, CheckCircle2, ArrowRight } from 'lucide-react';

interface StageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStageId: number;
  onSelectStage: (stageId: number) => void;
}

export const StageSelectorModal: React.FC<StageSelectorModalProps> = ({
  isOpen,
  onClose,
  currentStageId,
  onSelectStage,
}) => {
  if (!isOpen) return null;

  const mechanismStages = ALL_STAGES.filter((s) => s.id <= 11);
  const otherStages = ALL_STAGES.filter((s) => s.id >= 12);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Daftar Stage Produksi (Total 35 Stage)
            </h2>
            <p className="text-xs text-slate-400">
              Pilih Stage secara manual. Setiap stage memiliki siklus total 15 Menit (900 detik).
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* Section 1: Stage 1 - 11 Mechanism */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-blue-600/20 text-blue-400 border border-blue-500/40 text-xs font-mono font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                STAGE 1 – STAGE 11: MECHANISM (EYE-GAZE AKTIF)
              </span>
              <span className="text-xs text-slate-400">
                Memerlukan konfirmasi Eye-Gaze setelah setiap timer proses selesai.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {mechanismStages.map((stage) => {
                const isSelected = stage.id === currentStageId;
                return (
                  <button
                    key={stage.id}
                    type="button"
                    onClick={() => {
                      onSelectStage(stage.id);
                      onClose();
                    }}
                    className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-950/60 border-blue-500 ring-1 ring-blue-500/50 shadow-lg shadow-blue-950/50'
                        : 'bg-slate-850 hover:bg-slate-800 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-bold text-blue-400">{stage.code}</span>
                        {isSelected && (
                          <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                            AKTIF
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-semibold text-slate-200 line-clamp-2">{stage.name}</h4>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>{stage.processes.length} Proses</span>
                      <span>15:00 (900s)</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Stage 12 - 35 Other */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                STAGE 12 – STAGE 35: STAGE LAINNYA (TANPA EYE-GAZE)
              </span>
              <span className="text-xs text-slate-400">
                Pindah proses otomatis mengikuti timer tanpa kamera.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {otherStages.map((stage) => {
                const isSelected = stage.id === currentStageId;
                return (
                  <button
                    key={stage.id}
                    type="button"
                    onClick={() => {
                      onSelectStage(stage.id);
                      onClose();
                    }}
                    className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-800 border-emerald-500 ring-1 ring-emerald-500/50'
                        : 'bg-slate-850/60 hover:bg-slate-800 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-bold text-slate-400">{stage.code}</span>
                        {isSelected && (
                          <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                            AKTIF
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-semibold text-slate-300 line-clamp-2">{stage.name}</h4>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>{stage.processes.length} Proses</span>
                      <span>15:00 (900s)</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
