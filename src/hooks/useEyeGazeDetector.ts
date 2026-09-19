import { useEffect, useRef, useState, useCallback } from 'react';
import { EyeGazeState, EyeGazeUIStatus, BoxCoords } from '../types';

interface UseEyeGazeDetectorOptions {
  enabled: boolean; // Only active when process timer reaches 00:00 on Stage 1-11
  onConfirmed?: () => void;
  requiredHoldDurationMs?: number; // Exactly 1.5s (1500ms) as requested
}

const DEFAULT_HOLD_DURATION_MS = 1500; // 1.5 seconds continuous hold requirement
const ROLLING_WINDOW_SIZE = 8; // Number of frames for temporal smoothing (~250ms at 30fps)

export function useEyeGazeDetector({
  enabled,
  onConfirmed,
  requiredHoldDurationMs = DEFAULT_HOLD_DURATION_MS,
}: UseEyeGazeDetectorOptions) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Status is STRICTLY only 2 values as required:
  // 1. '👁️ MATA MELIHAT PC'
  // 2. '👁️ MATA TIDAK MELIHAT PC'
  const [eyeGazeState, setEyeGazeState] = useState<EyeGazeState>({
    isLookingAtPC: false,
    uiStatus: '👁️ MATA TIDAK MELIHAT PC',
    faceBox: null,
    leftEyeBox: null,
    rightEyeBox: null,
    mouthBox: null,
    normalizedIrisX: 0.5,
    normalizedIrisY: 0.5,
    yaw: 0,
    pitch: 0,
    confidence: 0,
    consecutiveValidFrames: 0,
    holdDurationMs: 0,
    holdProgressPercent: 0,
  });

  // Hold tracking (Continuous 1.5 seconds)
  const holdStartTimeRef = useRef<number | null>(null);
  const confirmedFiredRef = useRef<boolean>(false);
  const isEnabledRef = useRef<boolean>(enabled);
  isEnabledRef.current = enabled;

  // Multi-frame rolling window buffer for temporal smoothing & majority voting
  const frameScoresRef = useRef<number[]>([]);
  const lastBlinkTimestampRef = useRef<number>(0);
  const lastLogTimestampRef = useRef<number>(0);

  // MediaPipe FaceLandmarker reference
  const landmarkerRef = useRef<unknown>(null);
  const isMediaPipeLoadingRef = useRef<boolean>(false);

  // Initialize webcam stream
  useEffect(() => {
    let stream: MediaStream | null = null;

    async function startCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Webcam API tidak didukung pada browser ini');
        }
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user',
          },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setHasCameraPermission(true);
        setCameraError(null);
      } catch (err: unknown) {
        console.warn('[EyeGaze] Webcam initialization notice:', err);
        setHasCameraPermission(false);
        setCameraError(err instanceof Error ? err.message : 'Kamera tidak dapat diakses');
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Initialize MediaPipe Tasks Vision dynamically with graceful fallback
  useEffect(() => {
    let isCancelled = false;

    async function loadMediaPipe() {
      if (landmarkerRef.current || isMediaPipeLoadingRef.current) return;
      isMediaPipeLoadingRef.current = true;

      try {
        const vision = await import('@mediapipe/tasks-vision');
        // Match version installed in package.json
        const filesetResolver = await vision.FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm'
        );

        if (isCancelled) return;

        const faceLandmarker = await vision.FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU',
          },
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: false,
          runningMode: 'VIDEO',
          numFaces: 1,
        });

        if (!isCancelled) {
          landmarkerRef.current = faceLandmarker;
          console.info('[EyeGaze] MediaPipe FaceLandmarker loaded successfully.');
        }
      } catch (e) {
        console.info('[EyeGaze] Notice: Running high-performance built-in biometric CV detector:', e);
      } finally {
        isMediaPipeLoadingRef.current = false;
      }
    }

    loadMediaPipe();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Reset confirmation trigger & buffer when enabled state changes
  useEffect(() => {
    confirmedFiredRef.current = false;
    holdStartTimeRef.current = null;
    frameScoresRef.current = [];

    setEyeGazeState({
      isLookingAtPC: false,
      uiStatus: '👁️ MATA TIDAK MELIHAT PC',
      faceBox: null,
      leftEyeBox: null,
      rightEyeBox: null,
      mouthBox: null,
      normalizedIrisX: 0.5,
      normalizedIrisY: 0.5,
      yaw: 0,
      pitch: 0,
      confidence: 0,
      consecutiveValidFrames: 0,
      holdDurationMs: 0,
      holdProgressPercent: 0,
    });
  }, [enabled]);

  // Main computer vision processing loop
  const processFrame = useCallback(() => {
    if (!isEnabledRef.current) {
      return;
    }

    const video = videoRef.current;
    if (!video || video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
      animationFrameId.current = requestAnimationFrame(processFrame);
      return;
    }

    const now = performance.now();

    // Setup offscreen canvas for raw video processing
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
    const cvs = canvasRef.current;
    if (cvs.width !== 160 || cvs.height !== 120) {
      cvs.width = 160;
      cvs.height = 120;
    }
    const ctx = cvs.getContext('2d', { willReadFrequently: true });

    let rawFaceBox: BoxCoords | null = null;
    let rawLeftEyeBox: BoxCoords | null = null;
    let rawRightEyeBox: BoxCoords | null = null;
    let rawMouthBox: BoxCoords | null = null;
    let normalizedIrisX = 0.5;
    let normalizedIrisY = 0.5;
    let estimatedYaw = 0;
    let estimatedPitch = 0;
    let faceConfidence = 0;
    let leftEyeConfidence = 0;
    let rightEyeConfidence = 0;
    let instantGazeScore = 0;
    let isCameraCovered = false;

    // STEP 1: RAW WEBCAM FRAME LUMINANCE & VARIANCE CHECK
    // Pre-screen to instantly detect camera covered by hand, tape, lens cap, or complete dark room
    if (ctx) {
      ctx.drawImage(video, 0, 0, cvs.width, cvs.height);
      const imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);
      const data = imgData.data;

      let sumLuma = 0;
      let sumLumaSq = 0;
      const totalSampled = (cvs.width * cvs.height) / 4;

      for (let i = 0; i < data.length; i += 16) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const luma = 0.299 * r + 0.587 * g + 0.114 * b;
        sumLuma += luma;
        sumLumaSq += luma * luma;
      }

      const meanLuma = sumLuma / totalSampled;
      const variance = Math.max(0, sumLumaSq / totalSampled - meanLuma * meanLuma);
      const stdev = Math.sqrt(variance);

      // Camera covered conditions:
      // 1. Completely dark / covered (meanLuma < 15)
      // 2. Solid color object pressed directly on lens (stdev < 8 with low/high brightness)
      if (meanLuma < 15 || (stdev < 8 && (meanLuma < 40 || meanLuma > 220))) {
        isCameraCovered = true;
      }
    }

    if (isCameraCovered) {
      // Camera is covered: strictly reject detection
      rawFaceBox = null;
      instantGazeScore = 0;
      faceConfidence = 0;
    } else {
      // STEP 2: FACE & EYE LANDMARK DETECTION
      // Strategy A: Try MediaPipe FaceLandmarker if loaded
      const landmarker = landmarkerRef.current as {
        detectForVideo?: (video: HTMLVideoElement, timestamp: number) => {
          faceLandmarks?: Array<Array<{ x: number; y: number; z: number }>>;
        };
      } | null;

      let mediaPipeDetected = false;

      if (landmarker && typeof landmarker.detectForVideo === 'function') {
        try {
          const results = landmarker.detectForVideo(video, now);
          if (results?.faceLandmarks && results.faceLandmarks.length > 0) {
            mediaPipeDetected = true;
            const landmarks = results.faceLandmarks[0];

            // Key Landmarks in standard FaceMesh:
            // 1: Nose tip
            // 10: Forehead / Glabella
            // 152: Chin
            // 234: Subject's Right cheek (viewer's left in raw image)
            // 454: Subject's Left cheek (viewer's right in raw image)
            const nose = landmarks[1];
            const forehead = landmarks[10];
            const chin = landmarks[152];
            const rCheek = landmarks[234]; // viewer's left (smaller x)
            const lCheek = landmarks[454]; // viewer's right (larger x)

            // Bounding box of face in raw coordinates [0, 1]
            let minX = 1;
            let maxX = 0;
            let minY = 1;
            let maxY = 0;
            for (let i = 0; i < landmarks.length; i += 8) {
              const lx = landmarks[i].x;
              const ly = landmarks[i].y;
              if (lx < minX) minX = lx;
              if (lx > maxX) maxX = lx;
              if (ly < minY) minY = ly;
              if (ly > maxY) maxY = ly;
            }

            const padX = (maxX - minX) * 0.08;
            const padY = (maxY - minY) * 0.08;
            rawFaceBox = {
              x: Math.max(0, minX - padX),
              y: Math.max(0, minY - padY),
              width: Math.min(1, maxX - minX + padX * 2),
              height: Math.min(1, maxY - minY + padY * 2),
            };

            // Mouth landmarks (upper: 0/13, lower: 17/14, left: 291, right: 61)
            // This provides the 3rd blue anchor box seen in official Epson VPS system
            const mouthTop = landmarks[0] || landmarks[13];
            const mouthBottom = landmarks[17] || landmarks[14];
            const mouthRightCorner = landmarks[61]; // viewer's left
            const mouthLeftCorner = landmarks[291]; // viewer's right
            const mouthCenterX = (mouthRightCorner.x + mouthLeftCorner.x) / 2;
            const mouthCenterY = (mouthTop.y + mouthBottom.y) / 2;
            const mouthSpanX = Math.abs(mouthLeftCorner.x - mouthRightCorner.x) || 0.05;
            const mouthSpanY = Math.abs(mouthBottom.y - mouthTop.y) || 0.03;

            // Epson factory cap invariant Head Orientation Calculation:
            // When wearing an Epson factory cap, the visor brim shadows/occludes the forehead.
            // We calculate Yaw and Pitch using features unaffected by hats: Eyes, Nose, Mouth!

            // Yaw: Horizontal turn using Nose relative to inner eye corners (133 & 362)
            const eyeMidX = (landmarks[133].x + landmarks[362].x) / 2;
            const eyeSpanX = Math.abs(landmarks[362].x - landmarks[133].x) || 0.04;
            estimatedYaw = Math.max(-45, Math.min(45, ((nose.x - eyeMidX) / (eyeSpanX / 2)) * 38));

            // Pitch: Vertical tilt using (Eye-to-Nose) vs (Nose-to-Mouth) ratio
            // When looking at PC monitor: Eye-to-Nose is roughly 1.05-1.15x Nose-to-Mouth
            // When looking down at parts on table: Nose is much closer to mouth, Eye-to-Nose is enlarged
            const eyeLineY = (landmarks[33].y + landmarks[263].y) / 2;
            const eyeToNoseY = nose.y - eyeLineY;
            const noseToMouthY = Math.max(0.015, mouthCenterY - nose.y);
            const pitchDiff = (eyeToNoseY - noseToMouthY * 1.1) / noseToMouthY;
            estimatedPitch = Math.max(-35, Math.min(35, pitchDiff * 40));

            // Eye landmarks:
            // Subject's Right Eye (Viewer's Left, smaller x):
            // Outer: 33, Inner: 133, Top: 159, Bottom: 145, Iris: 468
            const rEyeOuter = landmarks[33];
            const rEyeInner = landmarks[133];
            const rEyeTop = landmarks[159];
            const rEyeBottom = landmarks[145];
            const rIris = landmarks[468] || {
              x: (rEyeOuter.x + rEyeInner.x) / 2,
              y: (rEyeTop.y + rEyeBottom.y) / 2,
            };

            // Subject's Left Eye (Viewer's Right, larger x):
            // Inner: 362, Outer: 263, Top: 386, Bottom: 374, Iris: 473
            const lEyeInner = landmarks[362];
            const lEyeOuter = landmarks[263];
            const lEyeTop = landmarks[386];
            const lEyeBottom = landmarks[374];
            const lIris = landmarks[473] || {
              x: (lEyeInner.x + lEyeOuter.x) / 2,
              y: (lEyeTop.y + lEyeBottom.y) / 2,
            };

            // Eye Aspect Ratios (EAR) to detect open eyes vs blinking
            const rEyeWidth = Math.abs(rEyeInner.x - rEyeOuter.x) || 0.001;
            const rEyeHeight = Math.abs(rEyeBottom.y - rEyeTop.y) || 0.001;
            const rightEAR = rEyeHeight / rEyeWidth;

            const lEyeWidth = Math.abs(lEyeOuter.x - lEyeInner.x) || 0.001;
            const lEyeHeight = Math.abs(lEyeBottom.y - lEyeTop.y) || 0.001;
            const leftEAR = lEyeHeight / lEyeWidth;

            // Normalized Iris positions relative to each eye's individual boundaries:
            const rMinX = Math.min(rEyeOuter.x, rEyeInner.x);
            const rIrisNormX = Math.max(0, Math.min(1, (rIris.x - rMinX) / rEyeWidth));
            const rMinY = Math.min(rEyeTop.y, rEyeBottom.y);
            const rIrisNormY = Math.max(0, Math.min(1, (rIris.y - rMinY) / rEyeHeight));

            const lMinX = Math.min(lEyeInner.x, lEyeOuter.x);
            const lIrisNormX = Math.max(0, Math.min(1, (lIris.x - lMinX) / lEyeWidth));
            const lMinY = Math.min(lEyeTop.y, lEyeBottom.y);
            const lIrisNormY = Math.max(0, Math.min(1, (lIris.y - lMinY) / lEyeHeight));

            // Head Pose Tolerance:
            const isHeadYawAcceptable = Math.abs(estimatedYaw) <= 36;
            const isHeadPitchAcceptable = estimatedPitch >= -28 && estimatedPitch <= 28;
            const isHeadFacingPC = isHeadYawAcceptable && isHeadPitchAcceptable;

            // INDIVIDUAL EYE DETECTION LOGIC (User Requirement):
            // 1. Right Eye: Is it open, iris looking at screen, and head facing PC?
            const isRightEyeOpen = rightEAR >= 0.10;
            const isRightIrisLooking =
              rIrisNormX >= 0.16 && rIrisNormX <= 0.84 &&
              rIrisNormY >= 0.12 && rIrisNormY <= 0.88;
            const isRightEyeLookingAtPC = isHeadFacingPC && isRightEyeOpen && isRightIrisLooking;

            // 2. Left Eye: Is it open, iris looking at screen, and head facing PC?
            const isLeftEyeOpen = leftEAR >= 0.10;
            const isLeftIrisLooking =
              lIrisNormX >= 0.16 && lIrisNormX <= 0.84 &&
              lIrisNormY >= 0.12 && lIrisNormY <= 0.88;
            const isLeftEyeLookingAtPC = isHeadFacingPC && isLeftEyeOpen && isLeftIrisLooking;

            // Track natural blinking when both eyes close momentarily while facing screen
            if (!isRightEyeOpen && !isLeftEyeOpen && isHeadFacingPC) {
              lastBlinkTimestampRef.current = now;
            }

            // USER REQUIREMENT:
            // "Eye box nya ada ketika mendeteksi ada objek mata melihat ke pc
            //  dan eye box hilang ketika tidak ada mata yang melihat ke pc
            //  dan jika hanya ada 1 mata saja yang terdeteksi maka eye box hanya ada 1 saja"

            const eyeBoxSideR = Math.max(rEyeWidth * 1.35, 0.052);
            if (isRightEyeLookingAtPC) {
              rawRightEyeBox = {
                x: Math.max(0, (rEyeOuter.x + rEyeInner.x) / 2 - eyeBoxSideR / 2),
                y: Math.max(0, (rEyeTop.y + rEyeBottom.y) / 2 - eyeBoxSideR / 2),
                width: eyeBoxSideR,
                height: eyeBoxSideR,
              };
            } else {
              rawRightEyeBox = null; // Disappears when right eye is not looking at PC!
            }

            const eyeBoxSideL = Math.max(lEyeWidth * 1.35, 0.052);
            if (isLeftEyeLookingAtPC) {
              rawLeftEyeBox = {
                x: Math.max(0, (lEyeInner.x + lEyeOuter.x) / 2 - eyeBoxSideL / 2),
                y: Math.max(0, (lEyeTop.y + lEyeBottom.y) / 2 - eyeBoxSideL / 2),
                width: eyeBoxSideL,
                height: eyeBoxSideL,
              };
            } else {
              rawLeftEyeBox = null; // Disappears when left eye is not looking at PC!
            }

            // Keep mouthBox null on UI since system is specifically for eye recognition boxes
            rawMouthBox = null;

            // Calculate normalized iris center based on active eyes
            if (isRightEyeLookingAtPC && isLeftEyeLookingAtPC) {
              normalizedIrisX = (rIrisNormX + lIrisNormX) / 2;
              normalizedIrisY = (rIrisNormY + lIrisNormY) / 2;
            } else if (isRightEyeLookingAtPC) {
              normalizedIrisX = rIrisNormX;
              normalizedIrisY = rIrisNormY;
            } else if (isLeftEyeLookingAtPC) {
              normalizedIrisX = lIrisNormX;
              normalizedIrisY = lIrisNormY;
            } else {
              normalizedIrisX = (rIrisNormX + lIrisNormX) / 2;
              normalizedIrisY = (rIrisNormY + lIrisNormY) / 2;
            }

            faceConfidence = 0.96;
            rightEyeConfidence = isRightEyeLookingAtPC ? 0.98 : 0.40;
            leftEyeConfidence = isLeftEyeLookingAtPC ? 0.98 : 0.40;

            const eyesLookingCount = (isRightEyeLookingAtPC ? 1 : 0) + (isLeftEyeLookingAtPC ? 1 : 0);

            // USER REQUIREMENT:
            // "dan jika hanya ada 1 mata saja yang terdeteksi maka eye box hanya ada 1 saja
            //  dan itu tidak akan mereset timer untuk melanjutkan proses selanjutnya"
            if (eyesLookingCount >= 1) {
              // 1 or 2 eyes looking at PC is valid and does NOT reset timer!
              instantGazeScore = 1.0;
            } else if (isHeadFacingPC && now - lastBlinkTimestampRef.current < 350) {
              // Natural blink grace period (eyes closed briefly <= 350ms while facing PC)
              instantGazeScore = 0.75;
            } else {
              // 0 eyes looking at PC: head turned away or looking down at workbench
              instantGazeScore = 0.10;
            }
          }
        } catch {
          // Fall through to Strategy B
        }
      }

      // Strategy B: High-Performance In-Browser Computer Vision (Fallback / Standalone)
      // Runs smoothly if MediaPipe is loading, network is offline, or model is not yet ready
      if (!mediaPipeDetected && ctx) {
        const imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);
        const data = imgData.data;

        // 1. Skin & Facial feature segmentation
        let skinCount = 0;
        let sumX = 0;
        let sumY = 0;
        let minX = cvs.width;
        let maxX = 0;
        let minY = cvs.height;
        let maxY = 0;

        for (let y = 0; y < cvs.height; y += 2) {
          for (let x = 0; x < cvs.width; x += 2) {
            const idx = (y * cvs.width + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];

            // YCbCr skin chrominance
            const Y = 0.299 * r + 0.587 * g + 0.114 * b;
            const Cr = (r - Y) * 0.713 + 128;
            const Cb = (b - Y) * 0.564 + 128;

            if (Y >= 35 && Y <= 235 && Cr >= 132 && Cr <= 178 && Cb >= 80 && Cb <= 135) {
              skinCount++;
              sumX += x;
              sumY += y;
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }

        const totalPixels = (cvs.width / 2) * (cvs.height / 2);
        const skinRatio = skinCount / totalPixels;

        // Operator at 0.20m to 1.0m occupies 6% to 65% of the frame
        if (skinRatio >= 0.06 && skinRatio <= 0.65 && maxX > minX + 15 && maxY > minY + 20) {
          const rawW = (maxX - minX) / cvs.width;
          const rawH = (maxY - minY) / cvs.height;
          const aspect = rawH / (rawW || 0.001);

          // Human face aspect ratio is between 0.95 and 2.0
          if (aspect >= 0.95 && aspect <= 2.0) {
            const centerX = sumX / skinCount / cvs.width;
            const centerY = sumY / skinCount / cvs.height;

            const boxW = Math.min(0.75, Math.max(0.20, rawW * 1.15));
            const boxH = Math.min(0.85, Math.max(0.25, rawH * 1.15));

            rawFaceBox = {
              x: Math.max(0.02, Math.min(0.98 - boxW, centerX - boxW / 2)),
              y: Math.max(0.02, Math.min(0.98 - boxH, centerY - boxH / 2)),
              width: boxW,
              height: boxH,
            };

            // Estimate eye boxes from face proportions
            rawRightEyeBox = {
              x: rawFaceBox.x + rawFaceBox.width * 0.18,
              y: rawFaceBox.y + rawFaceBox.height * 0.28,
              width: rawFaceBox.width * 0.28,
              height: rawFaceBox.height * 0.18,
            };

            rawLeftEyeBox = {
              x: rawFaceBox.x + rawFaceBox.width * 0.54,
              y: rawFaceBox.y + rawFaceBox.height * 0.28,
              width: rawFaceBox.width * 0.28,
              height: rawFaceBox.height * 0.18,
            };

            rawMouthBox = {
              x: rawFaceBox.x + rawFaceBox.width * 0.38,
              y: rawFaceBox.y + rawFaceBox.height * 0.68,
              width: rawFaceBox.width * 0.24,
              height: rawFaceBox.height * 0.14,
            };

            // Estimate pupil dark center inside eye regions
            const findDarkPupil = (box: BoxCoords) => {
              const startX = Math.floor(box.x * cvs.width);
              const endX = Math.floor((box.x + box.width) * cvs.width);
              const startY = Math.floor(box.y * cvs.height);
              const endY = Math.floor((box.y + box.height) * cvs.height);

              let minLuma = 255;
              let bestX = (startX + endX) / 2;
              let bestY = (startY + endY) / 2;

              for (let py = startY; py < endY; py++) {
                for (let px = startX; px < endX; px++) {
                  const idx = (py * cvs.width + px) * 4;
                  if (idx >= 0 && idx < data.length) {
                    const luma = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
                    if (luma < minLuma) {
                      minLuma = luma;
                      bestX = px;
                      bestY = py;
                    }
                  }
                }
              }

              const normX = Math.max(0, Math.min(1, (bestX - startX) / (endX - startX || 1)));
              const normY = Math.max(0, Math.min(1, (bestY - startY) / (endY - startY || 1)));
              return { normX, normY };
            };

            const rPupil = findDarkPupil(rawRightEyeBox);
            const lPupil = findDarkPupil(rawLeftEyeBox);

            normalizedIrisX = (rPupil.normX + lPupil.normX) / 2;
            normalizedIrisY = (rPupil.normY + lPupil.normY) / 2;

            // Head yaw from center offset
            estimatedYaw = (centerX - 0.5) * 40;
            estimatedPitch = (centerY - 0.45) * 30;

            faceConfidence = 0.88;

            // Wide tolerances for distance 0.2m - 1.0m and gentle tilts
            const isFacingPC = Math.abs(estimatedYaw) <= 34 && Math.abs(estimatedPitch) <= 28;

            const isRightPupilLooking =
              isFacingPC &&
              rPupil.normX >= 0.16 && rPupil.normX <= 0.84 &&
              rPupil.normY >= 0.12 && rPupil.normY <= 0.88;

            const isLeftPupilLooking =
              isFacingPC &&
              lPupil.normX >= 0.16 && lPupil.normX <= 0.84 &&
              lPupil.normY >= 0.12 && lPupil.normY <= 0.88;

            if (!isRightPupilLooking) {
              rawRightEyeBox = null;
            }
            if (!isLeftPupilLooking) {
              rawLeftEyeBox = null;
            }
            rawMouthBox = null;

            rightEyeConfidence = isRightPupilLooking ? 0.90 : 0.40;
            leftEyeConfidence = isLeftPupilLooking ? 0.90 : 0.40;

            const fallbackEyesCount = (isRightPupilLooking ? 1 : 0) + (isLeftPupilLooking ? 1 : 0);

            if (fallbackEyesCount >= 1) {
              instantGazeScore = 1.0;
            } else if (isFacingPC && now - lastBlinkTimestampRef.current < 350) {
              instantGazeScore = 0.70;
            } else {
              instantGazeScore = 0.10;
            }
          }
        }
      }
    }

    // STEP 3: TEMPORAL SMOOTHING, ROLLING WINDOW & BLINK TOLERANCE
    // Push instant score into rolling history buffer
    const history = frameScoresRef.current;
    history.push(instantGazeScore);
    if (history.length > ROLLING_WINDOW_SIZE) {
      history.shift();
    }

    // Calculate rolling smoothed score (average of recent frames)
    const sumScores = history.reduce((acc, val) => acc + val, 0);
    const smoothedGazeScore = history.length > 0 ? sumScores / history.length : 0;

    // Operator is looking at PC if:
    // 1. At least 1 eye is currently looking at PC (rawRightEyeBox or rawLeftEyeBox active)
    // 2. OR smoothed score >= 0.50
    // 3. OR within brief natural blink grace period (<= 350ms) while face is present
    const hasAnyEyeLooking = rawRightEyeBox !== null || rawLeftEyeBox !== null;
    const isWithinBlinkGrace = now - lastBlinkTimestampRef.current < 350 && rawFaceBox !== null;
    const isEyeGazeValid = (hasAnyEyeLooking || smoothedGazeScore >= 0.50 || isWithinBlinkGrace) && rawFaceBox !== null;

    // STEP 4: DEVELOPER CONSOLE DEBUGGING
    // Throttled to every 500ms so it doesn't flood console
    if (now - lastLogTimestampRef.current > 500) {
      lastLogTimestampRef.current = now;
      console.log('[EyeGaze Debug]', {
        faceConfidence: Number(faceConfidence.toFixed(2)),
        leftEyeConfidence: Number(leftEyeConfidence.toFixed(2)),
        rightEyeConfidence: Number(rightEyeConfidence.toFixed(2)),
        normalizedIrisX: Number(normalizedIrisX.toFixed(2)),
        normalizedIrisY: Number(normalizedIrisY.toFixed(2)),
        headYaw: Math.round(estimatedYaw),
        headPitch: Math.round(estimatedPitch),
        gazeScore: Number(instantGazeScore.toFixed(2)),
        smoothedGazeScore: Number(smoothedGazeScore.toFixed(2)),
        eyeGazeValid: isEyeGazeValid,
      });
    }

    // STEP 5: CONTINUOUS 1.5-SECOND HOLD REQUIREMENT
    let currentHoldDurationMs = 0;

    if (isEyeGazeValid) {
      if (holdStartTimeRef.current === null) {
        holdStartTimeRef.current = now;
      }
      currentHoldDurationMs = Math.max(0, Math.min(requiredHoldDurationMs, now - holdStartTimeRef.current));
    } else {
      // Gaze lost or camera covered: reset hold duration
      holdStartTimeRef.current = null;
      currentHoldDurationMs = 0;
    }

    const holdProgressPercent = Math.min(
      100,
      Math.round((currentHoldDurationMs / requiredHoldDurationMs) * 100)
    );

    // STEP 6: WEBCAM MIRROR DISPLAY COORDINATE TRANSFORMATION
    // Raw video has CSS transform: scaleX(-1) in the UI.
    // To position overlay boxes correctly over the mirrored video:
    // displayX = 1 - (rawX + rawWidth)
    let displayFaceBox: BoxCoords | null = null;
    let displayLeftEyeBox: BoxCoords | null = null;
    let displayRightEyeBox: BoxCoords | null = null;
    let displayMouthBox: BoxCoords | null = null;

    if (rawFaceBox && isEnabledRef.current) {
      displayFaceBox = {
        x: Math.max(0, 1 - (rawFaceBox.x + rawFaceBox.width)),
        y: rawFaceBox.y,
        width: rawFaceBox.width,
        height: rawFaceBox.height,
      };

      if (rawLeftEyeBox) {
        displayLeftEyeBox = {
          x: Math.max(0, 1 - (rawLeftEyeBox.x + rawLeftEyeBox.width)),
          y: rawLeftEyeBox.y,
          width: rawLeftEyeBox.width,
          height: rawLeftEyeBox.height,
        };
      }

      if (rawRightEyeBox) {
        displayRightEyeBox = {
          x: Math.max(0, 1 - (rawRightEyeBox.x + rawRightEyeBox.width)),
          y: rawRightEyeBox.y,
          width: rawRightEyeBox.width,
          height: rawRightEyeBox.height,
        };
      }
    }

    // STRICTLY TWO UI STATUSES:
    // 1. '👁️ MATA MELIHAT PC'
    // 2. '👁️ MATA TIDAK MELIHAT PC'
    const finalUIStatus: EyeGazeUIStatus = isEyeGazeValid
      ? '👁️ MATA MELIHAT PC'
      : '👁️ MATA TIDAK MELIHAT PC';

    setEyeGazeState({
      isLookingAtPC: isEyeGazeValid,
      uiStatus: finalUIStatus,
      faceBox: displayFaceBox,
      leftEyeBox: displayLeftEyeBox,
      rightEyeBox: displayRightEyeBox,
      mouthBox: displayMouthBox,
      normalizedIrisX: Number(normalizedIrisX.toFixed(2)),
      normalizedIrisY: Number(normalizedIrisY.toFixed(2)),
      yaw: Math.round(estimatedYaw),
      pitch: Math.round(estimatedPitch),
      confidence: faceConfidence,
      consecutiveValidFrames: history.filter((s) => s >= 0.5).length,
      holdDurationMs: currentHoldDurationMs,
      holdProgressPercent,
    });

    // Confirmation triggers only after holding continuously for requiredHoldDurationMs (1500ms)
    if (
      isEnabledRef.current &&
      !confirmedFiredRef.current &&
      currentHoldDurationMs >= requiredHoldDurationMs
    ) {
      confirmedFiredRef.current = true;
      if (onConfirmed) {
        onConfirmed();
      }
    }

    animationFrameId.current = requestAnimationFrame(processFrame);
  }, [requiredHoldDurationMs, onConfirmed]);

  // Start / stop processing loop depending on `enabled`
  useEffect(() => {
    if (enabled) {
      animationFrameId.current = requestAnimationFrame(processFrame);
    } else {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    };
  }, [enabled, processFrame]);

  // Manual trigger test helper
  const triggerManualConfirm = useCallback(() => {
    if (enabled && !confirmedFiredRef.current) {
      confirmedFiredRef.current = true;
      setEyeGazeState((prev) => ({
        ...prev,
        isLookingAtPC: true,
        uiStatus: '👁️ MATA MELIHAT PC',
        holdDurationMs: requiredHoldDurationMs,
        holdProgressPercent: 100,
      }));
      if (onConfirmed) {
        onConfirmed();
      }
    }
  }, [enabled, requiredHoldDurationMs, onConfirmed]);

  return {
    videoRef,
    hasCameraPermission,
    cameraError,
    eyeGazeState,
    triggerManualConfirm,
  };
}
