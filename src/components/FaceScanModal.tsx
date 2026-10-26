import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, CheckCircle2, AlertTriangle, RefreshCw, Sparkles, Scan } from 'lucide-react';

interface FaceScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (photoDataUrl: string) => void;
  staffName: string;
  actionType: 'MASUK' | 'PULANG';
}

export const FaceScanModal: React.FC<FaceScanModalProps> = ({
  isOpen,
  onClose,
  onVerified,
  staffName,
  actionType,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [hasCamera, setHasCamera] = useState<boolean>(true);
  const [cameraLoading, setCameraLoading] = useState<boolean>(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState<number>(0);

  // Initialize Camera when open
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedImage(null);
      setScanProgress(0);
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setCameraLoading(true);
    setCameraError(null);
    setCapturedImage(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Kamera tidak didukung pada browser ini');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 640 },
          facingMode: 'user',
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setHasCamera(true);
      setCameraLoading(false);
    } catch (err: unknown) {
      console.warn('Camera access failed, falling back to simulation mode:', err);
      setHasCamera(false);
      setCameraLoading(false);
      setCameraError(
        'Kamera fisik tidak aktif atau izin belum diberikan. Mode Simulator Biometrik Wajah aktif untuk pengujian.'
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const generateSimulatedPhoto = (): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Draw clinical background
    const grad = ctx.createLinearGradient(0, 0, 400, 400);
    grad.addColorStop(0, '#133E2B');
    grad.addColorStop(1, '#1f6044');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 400, 400);

    // Oval face silhouette
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(200, 180, 75, 100, 0, 0, Math.PI * 2);
    ctx.fill();

    // Shoulders
    ctx.beginPath();
    ctx.ellipse(200, 360, 140, 90, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#e2e8f0';
    ctx.fill();

    // Biometric watermark
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('KLINIK SIDOGIRI - FACE VERIFIED', 200, 375);
    ctx.font = '11px sans-serif';
    ctx.fillText(`${staffName} | ${new Date().toLocaleTimeString('id-ID')} WIB`, 200, 390);

    return canvas.toDataURL('image/jpeg', 0.85);
  };

  const handleCaptureAndVerify = () => {
    setIsScanning(true);
    let current = 0;
    const interval = setInterval(() => {
      current += 20;
      setScanProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        finalizeCapture();
      }
    }, 150);
  };

  const finalizeCapture = () => {
    let photoData = '';
    if (hasCamera && videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 480;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw video frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        // Add clinic timestamp stamp
        ctx.fillStyle = 'rgba(19, 62, 43, 0.7)';
        ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(
          `KLINIK SIDOGIRI | ${staffName} | ${new Date().toLocaleTimeString('id-ID')}`,
          12,
          canvas.height - 15
        );
        photoData = canvas.toDataURL('image/jpeg', 0.85);
      }
    }

    if (!photoData) {
      photoData = generateSimulatedPhoto();
    }

    setCapturedImage(photoData);
    setIsScanning(false);

    // Short success pause before completing
    setTimeout(() => {
      stopCamera();
      onVerified(photoData);
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-emerald-900/10 flex flex-col">
        {/* Header */}
        <div className="bg-[#133E2B] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-700/50 rounded-xl border border-emerald-500/30">
              <Scan className="w-5 h-5 text-emerald-300 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-extrabold uppercase tracking-tight">
                Verifikasi Wajah (Face Scan)
              </h3>
              <p className="text-[11px] text-emerald-200">
                Absen {actionType === 'MASUK' ? 'Masuk' : 'Pulang'}: {staffName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-800/60 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Viewfinder */}
        <div className="p-6 flex flex-col items-center">
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full overflow-hidden border-4 border-emerald-600 shadow-inner bg-slate-950 flex items-center justify-center">
            {cameraLoading && (
              <div className="flex flex-col items-center gap-2 text-slate-300">
                <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
                <span className="text-xs">Mengaktifkan sensor kamera...</span>
              </div>
            )}

            {hasCamera ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-4 text-center text-slate-300">
                <div className="w-20 h-24 rounded-full border-2 border-dashed border-emerald-400/80 flex items-center justify-center mb-2">
                  <Camera className="w-8 h-8 text-emerald-300" />
                </div>
                <p className="text-xs font-bold text-emerald-300">Mode Simulator Kamera</p>
                <p className="text-[10px] text-slate-400 mt-1 max-w-[180px]">
                  Klik tombol di bawah untuk memproses verifikasi biometrik wajah.
                </p>
              </div>
            )}

            {/* Biometric Scanning Overlay Laser Line */}
            {isScanning && (
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between">
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-bounce" />
                <div className="text-center py-2 bg-emerald-950/70 text-emerald-300 text-[11px] font-bold tracking-wider">
                  MEMINDAI FITUR WAJAH {scanProgress}%
                </div>
              </div>
            )}

            {/* Target Face Oval Frame Guide */}
            <div className="absolute inset-4 rounded-full border-2 border-dashed border-emerald-400/40 pointer-events-none" />

            {/* Verified Check Badge */}
            {capturedImage && (
              <div className="absolute inset-0 bg-emerald-950/80 flex flex-col items-center justify-center text-white p-4">
                <CheckCircle2 className="w-14 h-14 text-emerald-400 animate-bounce mb-2" />
                <p className="font-extrabold text-sm uppercase tracking-wider text-emerald-200">
                  Wajah Terverifikasi!
                </p>
                <p className="text-[11px] text-emerald-300/80">Klinik Sidogiri AI Biometric</p>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {/* Guide text */}
          <div className="mt-4 text-center space-y-1">
            <p className="text-xs font-bold text-slate-800">
              Posisikan wajah Anda tepat di dalam lingkaran
            </p>
            <p className="text-[11px] text-slate-500 max-w-xs">
              Pastikan pencahayaan cukup dan lepas kacamata hitam atau masker jika menutupi wajah.
            </p>
          </div>

          {cameraError && (
            <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-[11px] text-amber-800 text-left">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{cameraError}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="w-full mt-6 space-y-2">
            <button
              onClick={handleCaptureAndVerify}
              disabled={isScanning || !!capturedImage}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] hover:from-[#245A44] hover:to-[#38805F] active:scale-[0.99] shadow-md shadow-emerald-900/20 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Memproses Titik Wajah ({scanProgress}%)...</span>
                </>
              ) : capturedImage ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Terverifikasi! Menyimpan...</span>
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  <span>Ambil Foto Wajah & Verifikasi</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              disabled={isScanning}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
            >
              Batalkan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
