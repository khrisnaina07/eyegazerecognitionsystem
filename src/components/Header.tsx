import React, { useState } from 'react';
import { Stage } from '../types';
import { QrCode, Layers, Clock, CheckCircle2, ChevronDown, Volume2, VolumeX, ShieldAlert, Cpu } from 'lucide-react';

interface HeaderProps {
  currentStage: Stage;
  mechaNumber: string;
  isMechaConfirmed: boolean;
  onUpdateMechaNumber: (newNumber: string) => void;
  onOpenMechaModal: () => void;
  onOpenStageModal: () => void;
  elapsedSec: number;
  totalCycleTimeSec: number;
  currentProcessIdx: number;
  totalProcesses: number;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStage,
  mechaNumber,
  isMechaConfirmed,
  onUpdateMechaNumber,
  onOpenMechaModal,
  onOpenStageModal,
  elapsedSec,
  totalCycleTimeSec,
  currentProcessIdx,
  totalProcesses,
  isMuted,
  onToggleMute,
}) => {
  const [isEditingMecha, setIsEditingMecha] = useState(false);
  const [tempMecha, setTempMecha] = useState(mechaNumber);

  const handleMechaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempMecha.trim()) {
      onUpdateMechaNumber(tempMecha.trim().toUpperCase());
      setIsEditingMecha(false);
    }
  };

  const progressPercent = Math.min(100, Math.round((elapsedSec / totalCycleTimeSec) * 100));
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <header className="w-full bg-slate-900 border-b border-slate-800 px-4 lg:px-6 py-3 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Brand & Stage Badge */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            {/* Epson Badge */}
            <div className="bg-[#003399] px-3 py-1 rounded text-white font-extrabold tracking-widest text-lg shadow-sm">
              EPSON
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                Work Instruction System
                <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  v2.4
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">Sequential Assembly & Eye-Gaze Checkpoint</p>
            </div>
          </div>

          {/* Current Stage Picker Button */}
          <button
            type="button"
            onClick={onOpenStageModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 transition-colors text-xs font-semibold group cursor-pointer"
            title="Klik untuk memilih Stage lain (1 - 35)"
          >
            <Layers className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-blue-400 font-mono font-bold">{currentStage.code}</span>
                <span className="hidden sm:inline text-slate-300 truncate max-w-[180px]">
                  {currentStage.name.split(':')[1]?.trim() || currentStage.name}
                </span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* Middle: Mecha Barcode Input */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-center">
          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-700/80 rounded-lg px-3 py-1.5">
            <QrCode className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-400 font-medium">MECHA ID:</span>

            {!isMechaConfirmed ? (
              <button
                type="button"
                onClick={onOpenMechaModal}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-mono font-extrabold px-2.5 py-0.5 rounded shadow flex items-center gap-1 cursor-pointer animate-pulse"
              >
                <span>KLIK OK UNTUK MULAI</span>
              </button>
            ) : isEditingMecha ? (
              <form onSubmit={handleMechaSubmit} className="flex items-center gap-1">
                <input
                  type="text"
                  value={tempMecha}
                  onChange={(e) => setTempMecha(e.target.value)}
                  placeholder="Contoh: M-001"
                  className="bg-slate-900 border border-blue-500 rounded px-2 py-0.5 text-xs font-mono font-bold text-white uppercase focus:outline-none w-28"
                  autoFocus
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold px-2 py-0.5 rounded cursor-pointer"
                >
                  OK
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setTempMecha(mechaNumber);
                  setIsEditingMecha(true);
                }}
                className="font-mono text-xs font-bold text-cyan-300 hover:text-cyan-200 underline decoration-dotted cursor-pointer flex items-center gap-1"
                title="Klik untuk ubah/scan nomor Mecha baru"
              >
                {mechaNumber}
                <span className="text-[10px] text-slate-500 font-sans">(ubah)</span>
              </button>
            )}
          </div>

          {/* Mode Indicator: Mechanism (Eye-Gaze) vs Other */}
          {currentStage.isEyeGazeEnabled ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-950/80 border border-blue-600/60 text-blue-300 text-xs font-semibold">
              <Cpu className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span>STAGE 1–11: EYE-GAZE CHECKPOINT</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
              <span>STAGE 12–35: TIMER OTOMATIS</span>
            </div>
          )}
        </div>

        {/* Right: Cycle Time 15m Indicator & Sound */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5 text-xs font-mono text-slate-300">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>CYCLE TIME:</span>
              <span className="font-bold text-white">{formatTime(elapsedSec)}</span>
              <span className="text-slate-500">/ 15:00</span>
            </div>
            {/* Progress bar */}
            <div className="w-36 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Audio toggle button */}
          <button
            type="button"
            onClick={onToggleMute}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
            title={isMuted ? 'Aktifkan Suara' : 'Bisukan Suara'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-blue-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
