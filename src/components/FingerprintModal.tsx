import React, { useState, useEffect, useRef } from 'react';
import { Fingerprint, X, CheckCircle2, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';

interface FingerprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
  staffName: string;
  actionType: 'MASUK' | 'PULANG';
}

export const FingerprintModal: React.FC<FingerprintModalProps> = ({
  isOpen,
  onClose,
  onVerified,
  staffName,
  actionType,
}) => {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setIsScanning(false);
      setProgress(0);
      setIsSuccess(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isOpen]);

  const handleStartScan = () => {
    if (isScanning || isSuccess) return;

    setIsScanning(true);
    setProgress(0);

    // Haptic feedback if available
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(50);
      } catch {
        // ignore
      }
    }

    let p = 0;
    timerRef.current = setInterval(() => {
      p += 15;
      if (p >= 100) {
        p = 100;
        setProgress(100);
        if (timerRef.current) clearInterval(timerRef.current);
        handleScanSuccess();
      } else {
        setProgress(p);
      }
    }, 120);
  };

  const handleScanSuccess = () => {
    setIsScanning(false);
    setIsSuccess(true);

    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([40, 30, 80]);
      } catch {
        // ignore
      }
    }

    setTimeout(() => {
      onVerified();
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
              <Fingerprint className="w-5 h-5 text-emerald-300 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-extrabold uppercase tracking-tight">
                Verifikasi Sidik Jari (Biometrik)
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

        {/* Sensor Area */}
        <div className="p-6 sm:p-8 flex flex-col items-center text-center">
          <div className="relative my-4 flex items-center justify-center">
            {/* Outer Progress Circle */}
            <svg className="w-44 h-44 transform -rotate-90">
              <circle
                cx="88"
                cy="88"
                r="78"
                stroke="currentColor"
                strokeWidth="6"
                className="text-slate-100"
                fill="transparent"
              />
              <circle
                cx="88"
                cy="88"
                r="78"
                stroke="currentColor"
                strokeWidth="6"
                strokeDasharray={2 * Math.PI * 78}
                strokeDashoffset={2 * Math.PI * 78 * (1 - progress / 100)}
                strokeLinecap="round"
                className={`transition-all duration-150 ${
                  isSuccess ? 'text-emerald-500' : 'text-emerald-600'
                }`}
                fill="transparent"
              />
            </svg>

            {/* Interactive Fingerprint Pad */}
            <button
              onClick={handleStartScan}
              disabled={isScanning || isSuccess}
              className={`absolute inset-4 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer group shadow-inner ${
                isSuccess
                  ? 'bg-emerald-600 text-white'
                  : isScanning
                  ? 'bg-emerald-50 border-2 border-emerald-500 text-emerald-700 animate-pulse'
                  : 'bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200 text-emerald-800 hover:scale-105 active:scale-95'
              }`}
            >
              {isSuccess ? (
                <CheckCircle2 className="w-16 h-16 text-white animate-bounce" />
              ) : (
                <Fingerprint
                  className={`w-16 h-16 transition-transform group-hover:scale-110 ${
                    isScanning ? 'text-emerald-600 animate-pulse' : 'text-emerald-700'
                  }`}
                />
              )}
            </button>
          </div>

          {/* Status Label */}
          <div className="mt-2 space-y-1">
            <h4 className="text-sm font-extrabold text-[#133E2B]">
              {isSuccess
                ? 'Sidik Jari Terverifikasi Cocok!'
                : isScanning
                ? `Memindai Pola Sidik Jari... (${progress}%)`
                : 'Ketuk / Tempelkan Jari Pada Sensor'}
            </h4>
            <p className="text-xs text-slate-500 max-w-xs">
              {isSuccess
                ? 'Identitas biometrik terkonfirmasi. Menyimpan kehadiran...'
                : 'Sensor biometrik digital Klinik Sidogiri mengenali cetak sidik jari petugas terdaftar.'}
            </p>
          </div>

          {/* Prompt Button */}
          <div className="w-full mt-6 space-y-2">
            {!isSuccess && !isScanning && (
              <button
                onClick={handleStartScan}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-[#1B4332] hover:bg-[#245A44] active:scale-[0.99] shadow-sm transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Fingerprint className="w-4 h-4" />
                <span>Pindai Sidik Jari Sekarang</span>
              </button>
            )}

            {isScanning && (
              <div className="w-full py-3 px-4 rounded-xl font-bold text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                <span>Mencocokkan Minutiae Sidik Jari...</span>
              </div>
            )}

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
