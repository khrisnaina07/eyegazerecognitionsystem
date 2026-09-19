export interface ProcessStep {
  id: string;
  stepNumber: number;
  title: string;
  partCode: string;
  partName: string;
  tool: string;
  durationSec: number;
  instruction: string;
  checkpointNote: string;
  visualType: 'screw' | 'connector' | 'harness' | 'wiper' | 'board' | 'inspection' | 'gear' | 'spring' | 'roller';
}

export type StageCategory = 'Mechanism' | 'Other';

export interface Stage {
  id: number;
  code: string;
  name: string;
  category: StageCategory;
  isEyeGazeEnabled: boolean; // True for Stage 1-11, False for Stage 12-35
  processes: ProcessStep[];
  totalCycleTimeSec: number; // Always 900 seconds (15 minutes)
}

export type EyeGazeUIStatus = '👁️ MATA MELIHAT PC' | '👁️ MATA TIDAK MELIHAT PC';

export interface BoxCoords {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface EyeGazeState {
  isLookingAtPC: boolean;
  uiStatus: EyeGazeUIStatus;
  faceBox: BoxCoords | null;
  leftEyeBox: BoxCoords | null;
  rightEyeBox: BoxCoords | null;
  mouthBox: BoxCoords | null; // 3rd tracking anchor point shown in official Epson VPS system
  normalizedIrisX: number;
  normalizedIrisY: number;
  yaw: number;
  pitch: number;
  confidence: number;
  consecutiveValidFrames: number;
  holdDurationMs: number; // Duration held looking at PC (0 - 1500 ms)
  holdProgressPercent: number; // 0% - 100% of the 1.5s requirement
}

export interface MechaSession {
  mechaNumber: string;
  currentStageId: number;
  currentProcessIndex: number;
  isTimerRunning: boolean;
  timeRemainingSec: number;
  isEyeGazeCheckpointActive: boolean;
  completedProcesses: string[]; // ids of completed steps
  isStageCompleted: boolean;
  startedAt: string;
}
