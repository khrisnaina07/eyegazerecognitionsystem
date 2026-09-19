import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ALL_STAGES } from './data/stagesData';
import { Stage, ProcessStep, MechaSession } from './types';
import { Header } from './components/Header';
import { WorkInstructionCard } from './components/WorkInstructionCard';
import { EyeGazeCheckpointCard } from './components/EyeGazeCheckpointCard';
import { StageSelectorModal } from './components/StageSelectorModal';
import { StageCompletionModal } from './components/StageCompletionModal';
import { MechaStartModal } from './components/MechaStartModal';
import { useEyeGazeDetector } from './hooks/useEyeGazeDetector';
import { soundManager } from './utils/audio';
import { Play, Pause, FastForward, RotateCcw, Sparkles, CheckCircle2, ShieldAlert, QrCode } from 'lucide-react';

export default function App() {
  // Current active Stage (default to Stage 4: Wiper Assy & Main Board Mechanism from prompt)
  const [currentStageId, setCurrentStageId] = useState<number>(4);
  const currentStage: Stage = ALL_STAGES.find((s) => s.id === currentStageId) || ALL_STAGES[3];

  // Operator Mecha Identification & Confirmation Gate
  // USER REQUIREMENT: "program berjalan hanya ketika nomor mecha sudah di klik oke"
  const [mechaNumber, setMechaNumber] = useState<string>('M-001');
  const [isMechaConfirmed, setIsMechaConfirmed] = useState<boolean>(false);
  const [isMechaModalOpen, setIsMechaModalOpen] = useState<boolean>(true);

  // Sequential Process State (Operator CANNOT manually select or skip steps)
  const [currentProcessIdx, setCurrentProcessIdx] = useState<number>(0);
  const currentProcess: ProcessStep = currentStage.processes[currentProcessIdx] || currentStage.processes[0];

  // Timer & Checkpoint State (Timer only starts once Mecha OK has been clicked)
  const [timeRemainingSec, setTimeRemainingSec] = useState<number>(currentProcess.durationSec);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [isCheckpointActive, setIsCheckpointActive] = useState<boolean>(false);
  const [isStageCompleted, setIsStageCompleted] = useState<boolean>(false);

  // Modals & Sound
  const [isStageModalOpen, setIsStageModalOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Cycle time tracking
  const [elapsedCycleTimeSec, setElapsedCycleTimeSec] = useState<number>(0);

  // Handle Mecha OK confirmation to officially start the program
  const handleConfirmMecha = (confirmedNum: string) => {
    setMechaNumber(confirmedNum);
    setIsMechaConfirmed(true);
    setIsMechaModalOpen(false);
    setIsTimerRunning(true);
  };

  // Advance to next process step
  const advanceToNextProcess = useCallback(() => {
    setIsCheckpointActive(false);

    if (!isMuted) {
      soundManager.playConfirmedChime();
    }

    if (currentProcessIdx + 1 < currentStage.processes.length) {
      // Proceed to next process
      const nextIdx = currentProcessIdx + 1;
      setCurrentProcessIdx(nextIdx);
      setTimeRemainingSec(currentStage.processes[nextIdx].durationSec);
      setIsTimerRunning(true);
    } else {
      // All processes in stage completed
      setIsStageCompleted(true);
      setIsTimerRunning(false);
      if (!isMuted) {
        soundManager.playStageCompleted();
      }
    }
  }, [currentProcessIdx, currentStage.processes, isMuted]);

  // Hook for Computer Vision Eye-Gaze tracking
  // ONLY ENABLED WHEN: current stage is Mechanism (Stage 1-11) AND process timer reached 00:00!
  const isEyeGazeRequiredForStage = currentStage.isEyeGazeEnabled;
  const isEyeGazeDetectorActive = isEyeGazeRequiredForStage && isCheckpointActive;

  const {
    videoRef,
    hasCameraPermission,
    cameraError,
    eyeGazeState,
    triggerManualConfirm,
  } = useEyeGazeDetector({
    enabled: isEyeGazeDetectorActive,
    onConfirmed: advanceToNextProcess,
    requiredHoldDurationMs: 1500, // USER REQUIREMENT: exactly 1.5s continuous hold
  });

  // Process Timer Loop
  useEffect(() => {
    // PROGRAM RUNS ONLY WHEN MECHA OK IS CLICKED
    if (!isTimerRunning || !isMechaConfirmed || isCheckpointActive || isStageCompleted) {
      return;
    }

    const interval = setInterval(() => {
      setTimeRemainingSec((prev) => {
        if (prev <= 1) {
          // Timer reached 00:00!
          clearInterval(interval);

          // Update total elapsed cycle time
          setElapsedCycleTimeSec((curr) => Math.min(900, curr + currentProcess.durationSec));

          if (isEyeGazeRequiredForStage) {
            // Stage 1 - 11: Activate Eye-Gaze Checkpoint (Requirements 8, 9, 25)
            setIsCheckpointActive(true);
            if (!isMuted) {
              soundManager.playCheckpointAlert();
            }
            return 0;
          } else {
            // Stage 12 - 35: No Eye-Gaze, immediately proceed to next process (Requirement 26)
            advanceToNextProcess();
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, isMechaConfirmed, isCheckpointActive, isStageCompleted, isEyeGazeRequiredForStage, currentProcess.durationSec, advanceToNextProcess, isMuted]);

  // Handle stage selection (Manual selection only, per Requirement 29)
  const handleSelectStage = (newStageId: number) => {
    setCurrentStageId(newStageId);
    const newStage = ALL_STAGES.find((s) => s.id === newStageId) || ALL_STAGES[0];
    setCurrentProcessIdx(0);
    setTimeRemainingSec(newStage.processes[0].durationSec);
    setElapsedCycleTimeSec(0);
    setIsCheckpointActive(false);
    setIsStageCompleted(false);
    // User must click OK on Mecha for new run:
    setIsMechaConfirmed(false);
    setIsMechaModalOpen(true);
    setIsTimerRunning(false);
  };

  // Handle next Mecha start after stage completes (STAGE STAYS THE SAME, per Requirement 28)
  const handleStartNextMecha = (newMechaNumber: string) => {
    setMechaNumber(newMechaNumber);
    setCurrentProcessIdx(0);
    setTimeRemainingSec(currentStage.processes[0].durationSec);
    setElapsedCycleTimeSec(0);
    setIsCheckpointActive(false);
    setIsStageCompleted(false);
    // Mecha already confirmed in completion modal
    setIsMechaConfirmed(true);
    setIsTimerRunning(true);
  };

  // Reset current process timer (helper)
  const handleResetCurrentProcess = () => {
    setTimeRemainingSec(currentProcess.durationSec);
    setIsCheckpointActive(false);
    if (isMechaConfirmed) {
      setIsTimerRunning(true);
    }
  };

  // Fast forward test helper (e.g. skip remaining seconds of current timer to test checkpoint)
  const handleFastForwardTimer = () => {
    if (timeRemainingSec > 2 && isMechaConfirmed) {
      setTimeRemainingSec(2);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Header Bar */}
      <Header
        currentStage={currentStage}
        mechaNumber={mechaNumber}
        isMechaConfirmed={isMechaConfirmed}
        onUpdateMechaNumber={(num) => handleConfirmMecha(num)}
        onOpenMechaModal={() => setIsMechaModalOpen(true)}
        onOpenStageModal={() => setIsStageModalOpen(true)}
        elapsedSec={elapsedCycleTimeSec + (currentProcess.durationSec - timeRemainingSec)}
        totalCycleTimeSec={currentStage.totalCycleTimeSec}
        currentProcessIdx={currentProcessIdx}
        totalProcesses={currentStage.processes.length}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted((m) => !m)}
      />

      {/* Main Work Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Work Instruction Guide Card (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <WorkInstructionCard
            currentStage={currentStage}
            currentProcess={currentProcess}
            processIndex={currentProcessIdx}
            totalProcesses={currentStage.processes.length}
            timeRemainingSec={timeRemainingSec}
            isCheckpointActive={isCheckpointActive}
            isEyeGazeStage={isEyeGazeRequiredForStage}
            isMechaConfirmed={isMechaConfirmed}
          />

          {/* Operator Production Controls */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
            {!isMechaConfirmed ? (
              <div className="w-full flex items-center justify-between bg-amber-950/60 border border-amber-500/50 rounded-lg p-3 text-amber-300">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <QrCode className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Program Siaga: Silakan konfirmasi Nomor Mecha untuk memulai pengerjaan.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMechaModalOpen(true)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-lg shadow cursor-pointer shrink-0"
                >
                  OK — Mulai Pengerjaan
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsTimerRunning((r) => !r)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isTimerRunning
                        ? 'bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                    }`}
                    title="Pause / Resume Timer Proses"
                  >
                    {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isTimerRunning ? 'Jeda Timer' : 'Lanjutkan Timer'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetCurrentProcess}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Ulangi timer langkah saat ini"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                    <span>Reset Langkah</span>
                  </button>
                </div>

                {/* Test Tool: Fast forward remaining timer seconds */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">Uji Sistem:</span>
                  <button
                    type="button"
                    onClick={handleFastForwardTimer}
                    disabled={timeRemainingSec <= 2 || !isMechaConfirmed}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 disabled:opacity-40 text-cyan-400 border border-slate-700 text-[11px] font-mono font-semibold flex items-center gap-1 cursor-pointer"
                    title="Percepat timer ke 2 detik terakhir untuk menguji aktivasi checkpoint"
                  >
                    <FastForward className="w-3 h-3" />
                    <span>Percepat Timer (Sisa 2s)</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Eye-Gaze Camera Checkpoint (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Eye-Gaze Camera Checkpoint Card */}
          <EyeGazeCheckpointCard
            isCheckpointActive={isCheckpointActive}
            videoRef={videoRef}
            hasCameraPermission={hasCameraPermission}
            cameraError={cameraError}
            eyeGazeState={eyeGazeState}
            onManualSimulateLooking={triggerManualConfirm}
            processTitle={currentProcess.title}
            nextProcessTitle={
              currentStage.processes[currentProcessIdx + 1]?.title || 'Selesai Stage'
            }
          />

          {/* Operational SOP Guidelines Card */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-xs text-slate-400 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 font-mono">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
              SOP EPSON EYE-GAZE CHECKPOINT
            </h3>

            <div className="space-y-2 text-slate-300/90 leading-relaxed">
              <div className="flex items-start gap-2">
                <span className="font-mono text-blue-400 font-bold">1.</span>
                <span>
                  <strong>Konfirmasi Mecha ID:</strong> Program dan timer hanya mulai berjalan setelah nomor Mecha dikonfirmasi dengan tombol OK.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-blue-400 font-bold">2.</span>
                <span>
                  <strong>Saat Timer Berjalan:</strong> Eye-Gaze OFF. Operator bebas melihat meja kerja, komponen, baut, dan obeng tanpa harus melihat monitor.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-blue-400 font-bold">3.</span>
                <span>
                  <strong>Saat Timer 00:00:</strong> Eye-Gaze aktif otomatis. Tatap layar PC terus-menerus selama <strong>1,5 detik</strong> untuk validasi dan konfirmasi instruksi proses berikutnya.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-blue-400 font-bold">4.</span>
                <span>
                  <strong>Anti-False-Positive:</strong> Jika kamera ditutup atau tidak ada wajah, sistem secara akurat menampilkan <em>MATA TIDAK MELIHAT PC</em>.
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-500 flex items-center justify-between">
              <span>Stage 1–11: Mechanism (Eye-Gaze)</span>
              <span>Stage 12–35: Other (No Eye-Gaze)</span>
            </div>
          </div>
        </div>
      </main>

      {/* Mecha Start Gate Modal */}
      <MechaStartModal
        isOpen={isMechaModalOpen}
        stage={currentStage}
        currentMechaNumber={mechaNumber}
        onConfirmMecha={handleConfirmMecha}
        onOpenStageModal={() => {
          setIsMechaModalOpen(false);
          setIsStageModalOpen(true);
        }}
      />

      {/* Stage Selector Modal (All 35 Stages) */}
      <StageSelectorModal
        isOpen={isStageModalOpen}
        onClose={() => setIsStageModalOpen(false)}
        currentStageId={currentStageId}
        onSelectStage={handleSelectStage}
      />

      {/* Stage Completion Celebration Modal (Next Mecha on same stage) */}
      <StageCompletionModal
        isOpen={isStageCompleted}
        stage={currentStage}
        mechaNumber={mechaNumber}
        onStartNextMecha={handleStartNextMecha}
        onOpenStageModal={() => {
          setIsStageCompleted(false);
          setIsStageModalOpen(true);
        }}
      />
    </div>
  );
}
