import React, { useState } from 'react';
import { User } from '../types';
import { Logo } from '../components/Logo';
import { DigitalClock } from '../components/DigitalClock';
import { storage } from '../services/storage';
import {
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ShieldCheck,
  Stethoscope,
  Activity,
  AlertCircle,
  LogIn,
  KeyRound,
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError('Harap masukkan Username atau ID Petugas.');
      return;
    }
    if (!pin) {
      setError('Harap masukkan Password / PIN petugas.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const result = storage.authenticate(username, pin);
      setLoading(false);

      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setError(result.message);
      }
    }, 250);
  };

  // Demo accounts helper
  const handleQuickLogin = (uname: string, pass: string) => {
    setUsername(uname);
    setPin(pass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F6FAF7] flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative calm ambient aura */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-200/30 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-200/20 rounded-full blur-3xl pointer-events-none -ml-32 -mb-32"></div>

      {/* Top Bar with Realtime Clock */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between z-10">
        <Logo size="md" textColor="text-[#133E2B]" />
        <DigitalClock variant="compact" />
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-auto py-6 z-10">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-[0_12px_40px_-10px_rgba(19,62,43,0.12)] border border-emerald-900/[0.08] overflow-hidden">
          {/* Card Header with Calm Sidogiri Pine Gradient */}
          <div className="bg-gradient-to-br from-[#1B4332] via-[#245A44] to-[#12372A] p-6 text-white text-center relative">
            <div className="inline-flex p-2.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-3 shadow-inner">
              <Logo size="lg" showText={false} />
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
              ABSENSI KLINIK SIDOGIRI
            </h2>
            <p className="text-xs text-emerald-200 font-medium mt-1">
              Portal Presensi Kehadiran Dokter & Paramedis
            </p>
          </div>

          {/* Form */}
          <div className="p-6 sm:p-8 space-y-5">
            {error && (
              <div className="p-3.5 bg-rose-50/90 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Username / ID Petugas
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4 text-emerald-700" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Contoh: dokter2 atau DOK-002"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F9FBFA] border border-emerald-900/15 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:bg-white focus:border-emerald-600 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Password / PIN Petugas
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4 text-emerald-700" />
                  </div>
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Masukkan Password / PIN"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#F9FBFA] border border-emerald-900/15 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:bg-white focus:border-emerald-600 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-[#1B4332] hover:bg-[#245A44] active:scale-[0.99] shadow-sm shadow-emerald-950/20 transition cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>LOGIN KE SISTEM</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Access by Role */}
            <div className="pt-4 border-t border-emerald-900/[0.08]">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center mb-2.5">
                Uji Coba Hak Akses Cepat (Klik untuk Isi):
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin', 'admin123')}
                  className="p-2 rounded-xl border border-emerald-900/10 bg-emerald-50/50 hover:bg-emerald-100/60 text-[#133E2B] text-left transition cursor-pointer group"
                >
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>ADMIN</span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">Ust. Abdullah</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('prasetyo', '1234')}
                  className="p-2 rounded-xl border border-teal-900/10 bg-teal-50/50 hover:bg-teal-100/60 text-[#133E2B] text-left transition cursor-pointer group"
                >
                  <div className="flex items-center gap-1 text-[11px] font-bold text-teal-800">
                    <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                    <span>DOKTER</span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">dr. Prasetyo</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('romly', '1234')}
                  className="p-2 rounded-xl border border-emerald-900/10 bg-emerald-50/50 hover:bg-emerald-100/60 text-[#133E2B] text-left transition cursor-pointer group"
                >
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800">
                    <Activity className="w-3.5 h-3.5 text-emerald-600" />
                    <span>PARAMEDIS</span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">Romly Amd.Kep</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer text */}
      <div className="text-center text-xs text-slate-500 z-10 py-2">
        <p className="font-bold text-[#133E2B]">Klinik Sidogiri</p>
        <p className="text-[11px]">Sistem Presensi Kedokteran & Keperawatan Terpadu</p>
      </div>
    </div>
  );
};
