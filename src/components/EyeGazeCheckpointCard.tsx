import React, { useEffect, useState } from 'react';
import { EyeGazeState, BoxCoords } from '../types';
import { Eye, ShieldCheck, Camera, Sparkles, CheckCircle2, Loader2, Clock } from 'lucide-react';

interface EyeGazeCheckpointCardProps {
  isCheckpointActive: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  hasCameraPermission: boolean | null;
  cameraError: string | null;
  eyeGazeState: EyeGazeState;
  onManualSimulateLooking: () => void;
  processTitle: string;
  nextProcessTitle?: string;
}

export const EyeGazeCheckpointCard: React.FC<EyeGazeCheckpointCardProps> = ({
  isCheckpointActive,
  videoRef,
  hasCameraPermission,
  cameraError,
  eyeGazeState,
  onManualSimulateLooking,
  processTitle,
  nextProcessTitle,
}) => {
  // Requirement 6, 7, 12, 13:
  // When isCheckpointActive is FALSE: Eye-Gaze is completely OFF. Overlays are HIDDEN.
  // When isCheckpointActive is TRUE: Eye-Gaze turns ON, displays Face Box, Eye Box, and ONLY 2 UI statuses.

  const isLooking = eyeGazeState.isLookingAtPC;
  const holdSeconds = (eyeGazeState.holdDurationMs / 1000).toFixed(1);

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
        isCheckpointActive
          ? isLooking
            ? 'bg-slate-900 border-emerald-500 shadow-2xl shadow-emerald-950/50 ring-2 ring-emerald-500/30'
            : 'bg-slate-900 border-amber-500/80 shadow-2xl shadow-amber-950/40 ring-1 ring-amber-500/30'
          : 'bg-slate-900/90 border-slate-800 shadow-lg'
      }`}
    >
      {/* Top Banner: Authentic Epson VPS Eye Recognition System Header */}
      <div className="px-4 py-2.5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex flex-col">
            <span className="text-[11px] font-black tracking-widest text-blue-400 leading-none">
              EPSON
            </span>
            <span className="text-[8px] tracking-wider text-slate-400 font-sans leading-none mt-0.5">
              EXCEED YOUR VISION
            </span>
          </div>
          <div className="h-5 w-[1px] bg-slate-800" />
          <span className="font-mono text-xs font-black text-slate-100 tracking-wide">
            VPS EYE RECOGNITION SYSTEM
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isCheckpointActive ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              CHECKPOINT ACTIVE
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono bg-slate-800 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              STANDBY
            </span>
          )}
        </div>
      </div>

      {/* Recognition Indicator Bar (as seen below CONNECT in Epson VPS) */}
      <div className="w-full h-2 bg-slate-950 border-b border-slate-800/80 overflow-hidden">
        <div
          className={`h-full transition-all duration-150 ${
            isCheckpointActive && isLooking
              ? 'w-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]'
              : isCheckpointActive
              ? 'w-1/4 bg-amber-500/40'
              : 'w-0 bg-transparent'
          }`}
        />
      </div>

      {/* Video Stream Container with Mirrored Display & Overlays */}
      <div className="relative aspect-[4/3] w-full max-h-72 bg-black flex items-center justify-center overflow-hidden">
        {/* Real Webcam video element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }} // Natural mirror webcam view
        />

        {/* Camera Permission / Error Fallback message */}
        {hasCameraPermission === false && (
          <div className="absolute inset-0 z-10 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center">
            <Camera className="w-10 h-10 text-slate-500 mb-2" />
            <p className="text-xs text-slate-300 font-semibold mb-1">Akses Webcam Belum Aktif</p>
            <p className="text-[11px] text-slate-400 max-w-xs mb-3">
              {cameraError || 'Izinkan akses kamera pada browser atau gunakan tombol konfirmasi pengujian di bawah.'}
            </p>
            {isCheckpointActive && (
              <button
                type="button"
                onClick={onManualSimulateLooking}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Konfirmasi Simulasi: Lihat PC
              </button>
            )}
          </div>
        )}

        {/* REQUIREMENT 7 & 12:
            When operator is working (isCheckpointActive === false):
            Face Box HIDDEN, Eye Box HIDDEN, Gaze Overlay HIDDEN, Status Eye-Gaze HIDDEN.
        */}
        {!isCheckpointActive && (
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center z-10">
            <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-2.5">
              <Eye className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-xs font-bold text-slate-200 mb-1">Proses Sedang Berjalan</p>
            <p className="text-[11px] text-slate-400 max-w-xs">
              Operator bebas melihat benda kerja, alat, atau harness. Eye-Gaze mati selama timer masih berlangsung.
            </p>
          </div>
        )}

        {/* REQUIREMENT 13 + AUTHENTIC EPSON VPS DISPLAY:
            During Checkpoint (isCheckpointActive === true):
            - Eye box is present when that eye is detected looking at PC
            - Eye box disappears when that eye is not looking at PC
            - If only 1 eye is detected looking at PC, only 1 eye box is shown
              and the timer is NOT reset!
        */}
        {isCheckpointActive && (
          <>
            {/* Right Eye Blue Box (appears only if right eye is looking at PC) */}
            {eyeGazeState.rightEyeBox && (
              <div
                className="absolute border-2 border-blue-500 bg-blue-500/15 pointer-events-none transition-all duration-75 shadow-[0_0_8px_rgba(59,130,246,0.6)]"
                style={{
                  left: `${eyeGazeState.rightEyeBox.x * 100}%`,
                  top: `${eyeGazeState.rightEyeBox.y * 100}%`,
                  width: `${eyeGazeState.rightEyeBox.width * 100}%`,
                  height: `${eyeGazeState.rightEyeBox.height * 100}%`,
                }}
              >
                {/* Center target indicator */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                </div>
              </div>
            )}

            {/* Left Eye Blue Box (appears only if left eye is looking at PC) */}
            {eyeGazeState.leftEyeBox && (
              <div
                className="absolute border-2 border-blue-500 bg-blue-500/15 pointer-events-none transition-all duration-75 shadow-[0_0_8px_rgba(59,130,246,0.6)]"
                style={{
                  left: `${eyeGazeState.leftEyeBox.x * 100}%`,
                  top: `${eyeGazeState.leftEyeBox.y * 100}%`,
                  width: `${eyeGazeState.leftEyeBox.width * 100}%`,
                  height: `${eyeGazeState.leftEyeBox.height * 100}%`,
                }}
              >
                {/* Center target indicator */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* REQUIREMENT 10, 11, 22:
          UI OPERATOR HANYA BOLEH MEMPUNYAI DUA STATUS:
          STATUS 1: 👁️ MATA MELIHAT PC
          STATUS 2: 👁️ MATA TIDAK MELIHAT PC
          TIDAK ADA STATUS LAIN!
          HANYA DITAMPILKAN SAAT isCheckpointActive === true
      */}
      {isCheckpointActive ? (
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex flex-col gap-3">
          {/* Large prominent Status Bar with strictly only 2 statuses */}
          <div
            className={`w-full py-3 px-4 rounded-xl flex items-center justify-between border transition-all ${
              isLooking
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                : 'bg-amber-950/70 border-amber-500/70 text-amber-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xl">👁️</span>
              <span className="font-extrabold text-sm sm:text-base tracking-wide font-sans">
                {eyeGazeState.uiStatus}
              </span>
            </div>

            {isLooking ? (
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 font-mono">
                <CheckCircle2 className="w-4 h-4" />
                <span>CONFIRMING...</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 font-mono">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>WAIT</span>
              </div>
            )}
          </div>

          {/* Continuous 1.5 Seconds Gaze Hold Progress */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-1.5">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                {isLooking ? 'Menahan Tatapan ke Layar:' : 'Wajib Tatap Layar Terus-Menerus:'}
              </span>
              <span className={`font-bold font-mono text-xs ${isLooking ? 'text-emerald-300' : 'text-slate-400'}`}>
                {holdSeconds}s / 1.5s ({eyeGazeState.holdProgressPercent}%)
              </span>
            </div>

            {/* Hold progress bar */}
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-100 ${
                  isLooking
                    ? 'bg-gradient-to-r from-emerald-500 via-cyan-400 to-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                    : 'bg-amber-500/30'
                }`}
                style={{ width: `${eyeGazeState.holdProgressPercent}%` }}
              />
            </div>

            <div className="text-[11px] text-slate-400">
              {isLooking
                ? 'Tatapan terdeteksi. Pertahankan pandangan selama 1,5 detik untuk konfirmasi otomatis.'
                : 'Mata belum menghadap layar atau kamera tertutup. Arahkan mata ke layar PC selama 1,5 detik.'}
            </div>
          </div>

          {/* Testing / Quick Confirm button for ease of validation */}
          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
            <span>Toleransi: Jarak 0–1m, Kemiringan ±38°</span>
            <button
              type="button"
              onClick={onManualSimulateLooking}
              className="text-cyan-400 hover:text-cyan-300 font-medium underline decoration-dotted cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              Simulasi Tatap PC
            </button>
          </div>
        </div>
      ) : (
        /* When operator is working: clean minimal footer */
        <div className="p-3 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-600" />
            <span className="font-mono text-[11px]">Sensor Standby</span>
          </div>
          <span className="text-[11px] text-slate-400">Eye-Gaze aktif otomatis saat timer habis (00:00)</span>
        </div>
      )}
    </div>
  );
};
