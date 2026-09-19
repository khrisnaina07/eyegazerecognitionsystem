import React from 'react';
import { ProcessStep, Stage } from '../types';
import { VisualDiagram } from './VisualDiagram';
import { Wrench, Tag, AlertTriangle, CheckCircle2, Clock, ShieldCheck, Lock } from 'lucide-react';

interface WorkInstructionCardProps {
  currentStage: Stage;
  currentProcess: ProcessStep;
  processIndex: number;
  totalProcesses: number;
  timeRemainingSec: number;
  isCheckpointActive: boolean;
  isEyeGazeStage: boolean;
  isMechaConfirmed?: boolean;
}

export const WorkInstructionCard: React.FC<WorkInstructionCardProps> = ({
  currentStage,
  currentProcess,
  processIndex,
  totalProcesses,
  timeRemainingSec,
  isCheckpointActive,
  isEyeGazeStage,
  isMechaConfirmed = true,
}) => {
  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const timerProgress = currentProcess.durationSec > 0
    ? Math.max(0, Math.min(100, ((currentProcess.durationSec - timeRemainingSec) / currentProcess.durationSec) * 100))
    : 100;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
      {/* Top Bar: Process Index, Badge, and Timer */}
      <div className="p-4 sm:p-5 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Step Sequence Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600/20 border border-blue-500/50 text-blue-400 font-mono text-sm font-extrabold">
            <span>PROSES</span>
            <span>{String(processIndex + 1).padStart(2, '0')}</span>
            <span className="text-slate-500">/</span>
            <span className="text-slate-400">{String(totalProcesses).padStart(2, '0')}</span>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">
              Target Durasi: <strong className="text-slate-200">{currentProcess.durationSec}d</strong>
            </span>
          </div>
        </div>

        {/* Large Countdown Timer Display */}
        <div className="flex items-center gap-3 ml-auto">
          <div className="text-right">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              {!isMechaConfirmed
                ? 'MENUNGGU OK MECHA'
                : timeRemainingSec === 0
                ? isEyeGazeStage
                  ? 'MENUNGGU EYE-GAZE'
                  : 'PROSES SELESAI'
                : 'SISA WAKTU PROSES'}
            </div>
            <div
              className={`font-mono text-2xl sm:text-3xl font-extrabold tracking-tight transition-colors ${
                !isMechaConfirmed
                  ? 'text-amber-400 animate-pulse'
                  : timeRemainingSec === 0
                  ? isEyeGazeStage
                    ? 'text-amber-400 animate-pulse'
                    : 'text-emerald-400'
                  : timeRemainingSec <= 5
                  ? 'text-amber-400'
                  : 'text-cyan-400'
              }`}
            >
              {formatTimer(timeRemainingSec)}
            </div>
          </div>

          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center border ${
              timeRemainingSec === 0
                ? 'bg-amber-950/50 border-amber-500 text-amber-400'
                : 'bg-slate-800/80 border-slate-700 text-cyan-400'
            }`}
          >
            <Clock className={`w-6 h-6 ${timeRemainingSec > 0 ? 'animate-spin-slow' : ''}`} />
          </div>
        </div>
      </div>

      {/* Progress Bar of Current Process Timer */}
      <div className="w-full h-1.5 bg-slate-950 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            timeRemainingSec === 0
              ? 'bg-amber-400'
              : 'bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400'
          }`}
          style={{ width: `${timerProgress}%` }}
        />
      </div>

      {/* Main Content Area */}
      <div className="p-5 sm:p-6 space-y-5">
        {/* Process Title */}
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
            {currentProcess.title}
          </h2>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono">
              <Tag className="w-3.5 h-3.5 text-blue-400" />
              <span>PART: {currentProcess.partCode}</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-200 font-sans">{currentProcess.partName}</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 text-xs">
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              <span>TOOL: <strong className="text-slate-200 font-mono">{currentProcess.tool}</strong></span>
            </div>
          </div>
        </div>

        {/* Technical Visual Blueprint Diagram */}
        <VisualDiagram
          type={currentProcess.visualType}
          title={currentProcess.title}
          partCode={currentProcess.partCode}
        />

        {/* Step Instructions Text */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
            INSTRUKSI KERJA DETAIL:
          </div>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans">
            {currentProcess.instruction}
          </p>
        </div>

        {/* Quality & Safety Checkpoint Note */}
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-3.5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wide">
              KRITERIA KUALITAS / QUALITY CHECKPOINT:
            </span>
            <p className="text-xs text-amber-200/90 mt-0.5">
              {currentProcess.checkpointNote}
            </p>
          </div>
        </div>
      </div>

      {/* Sequential Process Flow (Strictly Sequential, No Manual Selection or Skipping - Requirement 4 & 5) */}
      <div className="mt-auto border-t border-slate-800/80 bg-slate-950/40 p-4">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            ALUR KERJA BERURUTAN (SISTEM DIKUNCI SEKUANSIAL)
          </span>
          <span>{processIndex + 1} dari {totalProcesses}</span>
        </div>

        {/* Horizontal Mini Step Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-700">
          {currentStage.processes.map((step, idx) => {
            const isDone = idx < processIndex;
            const isCurrent = idx === processIndex;
            return (
              <div
                key={step.id}
                title={`Langkah ${step.stepNumber}: ${step.title}`}
                className={`shrink-0 px-2.5 py-1 rounded text-xs font-mono font-bold flex items-center gap-1 select-none ${
                  isDone
                    ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/60'
                    : isCurrent
                    ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400/50'
                    : 'bg-slate-850 text-slate-500 border border-slate-800'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                ) : (
                  <span>#{String(step.stepNumber).padStart(2, '0')}</span>
                )}
                <span className="hidden md:inline font-sans text-[11px] font-normal truncate max-w-[90px]">
                  {step.title.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
