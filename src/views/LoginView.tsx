import React, { useState } from 'react';
import { User, Role } from '../types';
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
  CheckCircle2,
  Sparkles,
  MapPin,
  Fingerprint,
  Scan,
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  // Two distinct login portals: 'PETUGAS' or 'ADMIN'
  const [activePortal, setActivePortal] = useState<'PETUGAS' | 'ADMIN'>('PETUGAS');

  const [username, setUsername] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const allUsers = storage.getUsers();
  const medicalStaff = allUsers.filter(
    (u) => (u.jabatan === 'DOKTER' || u.jabatan === 'PARAMEDIS') && u.statusAktif
  );

  const handlePortalSwitch = (portal: 'PETUGAS' | 'ADMIN') => {
    setActivePortal(portal);
    setError(null);
    if (portal === 'ADMIN') {
      setUsername('admin');
      setPin('admin123');
    } else {
      setUsername('prasetyo');
      setPin('1234');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError('Harap masukkan Username atau ID Petugas.');
      return;
    }
    if (!pin) {
      setError('Harap masukkan Password / PIN.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const result = storage.authenticate(username, pin);
      setLoading(false);

      if (result.success && result.user) {
        // Enforce role consistency with portal
        if (activePortal === 'ADMIN' && result.user.jabatan !== 'ADMIN') {
          setError(
            'Akun ini adalah Petugas Medis, silakan login melalui portal "Login Petugas".'
          );
          return;
        }
        if (activePortal === 'PETUGAS' && result.user.jabatan === 'ADMIN') {
          setError(
            'Akun ini adalah Administrator. Silakan gunakan portal "Login Administrator" untuk mengelola dan mengedit absensi.'
          );
          return;
        }

        onLoginSuccess(result.user);
      } else {
        setError(result.message);
      }
    }, 200);
  };

  const handleSelectStaff = (staff: User) => {
    setUsername(staff.username);
    setPin(staff.password || '1234');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F6FAF7] flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative calm ambient aura */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-200/30 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-200/25 rounded-full blur-3xl pointer-events-none -ml-32 -mb-32"></div>

      {/* Top Bar with Realtime Clock & Dark Green Crescent Logo */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between z-10">
        <Logo size="md" textColor="text-[#133E2B]" />
        <DigitalClock variant="compact" />
      </div>

      {/* Main Login Card */}
      <div className="max-w-xl w-full mx-auto my-auto py-6 z-10">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-[0_16px_45px_-12px_rgba(19,62,43,0.15)] border border-emerald-900/[0.08] overflow-hidden">
          {/* Card Header with Calm Sidogiri Pine Gradient & Dark Green Crescent */}
          <div className="bg-gradient-to-br from-[#1B4332] via-[#245A44] to-[#12372A] p-6 text-white text-center relative">
            <div className="inline-flex p-2.5 rounded-2xl bg-white/95 backdrop-blur-sm shadow-md mb-2">
              <Logo size="lg" showText={false} />
            </div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
              ABSENSI KLINIK SIDOGIRI
            </h1>
            <p className="text-xs text-emerald-200 font-medium mt-1">
              Sistem Presensi Kedokteran & Paramedis Berbasis Biometrik & Geofence
            </p>
          </div>

          {/* TWO DISTINCT LOGIN PORTALS (PILIH PORTAL) */}
          <div className="p-2 bg-emerald-950/5 border-b border-emerald-900/10 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handlePortalSwitch('PETUGAS')}
              className={`py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activePortal === 'PETUGAS'
                  ? 'bg-white text-[#133E2B] shadow-sm border border-emerald-900/10 ring-2 ring-emerald-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <div
                className={`p-1 rounded-md ${
                  activePortal === 'PETUGAS' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <div>1. LOGIN PETUGAS</div>
                <div className="text-[10px] font-normal text-slate-500 lowercase">
                  cukup absen saja
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handlePortalSwitch('ADMIN')}
              className={`py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activePortal === 'ADMIN'
                  ? 'bg-[#1B4332] text-white shadow-sm ring-2 ring-emerald-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <div
                className={`p-1 rounded-md ${
                  activePortal === 'ADMIN' ? 'bg-emerald-700 text-emerald-200' : 'bg-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <div>2. ADMINISTRATOR</div>
                <div className="text-[10px] font-normal opacity-80 lowercase">
                  kelola & edit absen
                </div>
              </div>
            </button>
          </div>

          {/* Portal Explanation Banner */}
          <div className="px-6 sm:px-8 pt-5">
            {activePortal === 'PETUGAS' ? (
              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1">
                    <span className="p-1 rounded-full bg-emerald-200 text-emerald-800">
                      <Scan className="w-3 h-3" />
                    </span>
                    <span className="p-1 rounded-full bg-emerald-300 text-emerald-900">
                      <Fingerprint className="w-3 h-3" />
                    </span>
                  </div>
                  <div>
                    <span className="font-extrabold">Portal Presensi Dokter & Paramedis:</span>
                    <p className="text-[11px] text-emerald-700">
                      Fokus pada absen masuk & pulang dengan verifikasi Scan Wajah & Sidik Jari.
                    </p>
                  </div>
                </div>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-emerald-200/80 text-[10px] font-bold text-emerald-900">
                  Khusus Di Klinik
                </span>
              </div>
            ) : (
              <div className="p-3 bg-slate-100 border border-slate-200 rounded-2xl flex items-center gap-2 text-xs text-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-800 shrink-0" />
                <div>
                  <span className="font-extrabold">Portal Administrator Klinik:</span>
                  <p className="text-[11px] text-slate-600">
                    Otoritas khusus untuk mengedit data absen, mengoreksi status, mengelola jadwal & laporan.
                  </p>
                </div>
              </div>
            )}
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
                  {activePortal === 'ADMIN' ? 'Username Admin' : 'Username / ID Petugas Medis'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4 text-emerald-700" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={
                      activePortal === 'ADMIN'
                        ? 'Username administrator (admin)'
                        : 'Contoh: prasetyo atau DOK-001'
                    }
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F9FBFA] border border-emerald-900/15 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:bg-white focus:border-emerald-600 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Password / PIN
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4 text-emerald-700" />
                  </div>
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Masukkan PIN / Password"
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
                className="w-full mt-2 py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#1B4332] to-[#245A44] hover:from-[#245A44] hover:to-[#1B4332] active:scale-[0.99] shadow-md shadow-emerald-950/20 transition cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>
                      {activePortal === 'ADMIN'
                        ? 'MASUK SEBAGAI ADMINISTRATOR'
                        : 'MASUK UNTUK ABSENSI'}
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Staff Selection in Petugas portal */}
            {activePortal === 'PETUGAS' && (
              <div className="pt-4 border-t border-emerald-900/[0.08] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Pilih Petugas (Klik untuk Isi Cepat):
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold">
                    Dokter & Paramedis
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                  {medicalStaff.slice(0, 6).map((staff) => (
                    <button
                      key={staff.id}
                      type="button"
                      onClick={() => handleSelectStaff(staff)}
                      className={`p-2 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        username === staff.username
                          ? 'border-emerald-600 bg-emerald-100/70 shadow-xs'
                          : 'border-slate-200 bg-slate-50/70 hover:bg-emerald-50/60 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            staff.jabatan === 'DOKTER' ? 'bg-teal-600' : 'bg-emerald-600'
                          }`}
                        />
                        <span className="text-[11px] font-bold text-slate-800 truncate">
                          {staff.nama}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 truncate mt-1">
                        {staff.bagian}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Admin shortcut in Admin portal */}
            {activePortal === 'ADMIN' && (
              <div className="pt-4 border-t border-slate-200">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>Akun Administrator Standar:</span>
                    <span className="text-emerald-700">Terverifikasi</span>
                  </div>
                  <p className="text-[11px]">
                    Username: <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border">admin</code> | PIN: <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border">admin123</code>
                  </p>
                  <p className="text-[10px] text-slate-500 pt-1">
                    * Administrator memiliki wewenang untuk mengedit kehadiran, menghapus data tidak valid, dan mencetak laporan Excel.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer text */}
      <div className="text-center text-xs text-slate-500 z-10 py-2">
        <p className="font-bold text-[#133E2B]">Klinik Sidogiri</p>
        <p className="text-[11px]">
          Jl. Asrama Putra Ponpes Sidogiri, Kraton, Pasuruan • Telp: (0343) 420800
        </p>
      </div>
    </div>
  );
};
