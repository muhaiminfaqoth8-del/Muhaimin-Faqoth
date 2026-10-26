import React, { useState } from 'react';
import { User, ClinicProfile } from '../types';
import { storage } from '../services/storage';
import {
  Settings,
  Building2,
  Lock,
  Database,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';

interface SettingsViewProps {
  currentUser: User;
  onUpdateCurrentUser: (user: User) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  onUpdateCurrentUser,
}) => {
  const isAdmin = currentUser.jabatan === 'ADMIN';
  const [profile, setProfile] = useState<ClinicProfile>(storage.getClinicProfile());

  // Password / PIN change state
  const [oldPin, setOldPin] = useState<string>('');
  const [newPin, setNewPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);

  // Notifications
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSaveClinicProfile = (e: React.FormEvent) => {
    e.preventDefault();
    storage.updateClinicProfile(profile);
    setSuccessMsg('Profil dan informasi Klinik Sidogiri berhasil disimpan.');
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (oldPin !== currentUser.password) {
      setErrorMsg('Password / PIN lama tidak sesuai.');
      return;
    }
    if (!newPin || newPin.length < 3) {
      setErrorMsg('Password / PIN baru minimal 3 karakter.');
      return;
    }
    if (newPin !== confirmPin) {
      setErrorMsg('Konfirmasi Password / PIN tidak cocok.');
      return;
    }

    const updated = { ...currentUser, password: newPin };
    const res = storage.updateUser(updated);

    if (res.success) {
      onUpdateCurrentUser(updated);
      setSuccessMsg('Password / PIN Anda berhasil diubah.');
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
      setTimeout(() => setSuccessMsg(null), 3500);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleExportBackup = () => {
    const json = storage.exportDatabaseBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_Database_Klinik_Sidogiri_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = storage.importDatabaseBackup(content);
      if (res.success) {
        setSuccessMsg('Database berhasil dipulihkan dari file backup. Silakan muat ulang halaman jika diperlukan.');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setErrorMsg(res.message);
      }
    };
    reader.readAsText(file);
  };

  const handleResetToDefault = () => {
    if (
      window.confirm(
        'PERINGATAN: Tindakan ini akan mengembalikan seluruh data (petugas, absensi, jadwal) ke data awal default Klinik Sidogiri. Lanjutkan?'
      )
    ) {
      storage.resetToDefault();
      setSuccessMsg('Data telah direset ke data bawaan default.');
      setTimeout(() => window.location.reload(), 1200);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-emerald-900/[0.07] shadow-xs">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold uppercase tracking-wider border border-emerald-200/70">
          <Settings className="w-3.5 h-3.5 text-emerald-600" />
          <span>Konfigurasi & Keamanan</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-[#112F20] uppercase tracking-tight mt-1">
          PENGATURAN SISTEM & PROFIL
        </h1>
        <p className="text-xs text-slate-500">
          Kelola profil klinik, keamanan kata sandi petugas, dan pemeliharaan basis data permanen.
        </p>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-50/90 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-2xs animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50/90 border border-rose-200 rounded-2xl text-rose-900 text-xs font-bold flex items-center gap-2 shadow-2xs animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Keamanan Akun & Ganti PIN */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-emerald-900/[0.07] shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Lock className="w-4 h-4 text-emerald-700" />
            <div>
              <h2 className="text-base font-extrabold text-[#112F20] uppercase tracking-tight">
                Keamanan & Ganti Password / PIN
              </h2>
              <p className="text-xs text-slate-500">
                Ubah PIN untuk akun: <b>{currentUser.nama}</b> (@{currentUser.username})
              </p>
            </div>
          </div>

          <form onSubmit={handleChangePin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password / PIN Saat Ini
              </label>
              <input
                type={showPin ? 'text' : 'password'}
                value={oldPin}
                onChange={(e) => setOldPin(e.target.value)}
                placeholder="Masukkan PIN lama"
                className="w-full bg-[#F9FBFA] border border-emerald-900/15 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password / PIN Baru
                </label>
                <input
                  type={showPin ? 'text' : 'password'}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="PIN baru minimal 3 digit"
                  className="w-full bg-[#F9FBFA] border border-emerald-900/15 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Konfirmasi PIN Baru
                </label>
                <input
                  type={showPin ? 'text' : 'password'}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="Ulangi PIN baru"
                  className="w-full bg-[#F9FBFA] border border-emerald-900/15 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
              >
                {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPin ? 'Sembunyikan Digit' : 'Lihat Digit'}</span>
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#1B4332] hover:bg-[#245A44] transition cursor-pointer shadow-xs"
              >
                Simpan PIN Baru
              </button>
            </div>
          </form>
        </div>

        {/* 2. Informasi Database & Pemeliharaan */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-emerald-900/[0.07] shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Database className="w-4 h-4 text-emerald-700" />
            <div>
              <h2 className="text-base font-extrabold text-[#112F20] uppercase tracking-tight">
                Penyimpanan Database & Backup
              </h2>
              <p className="text-xs text-slate-500">
                Penyimpanan persisten terstruktur (users, attendance, schedules)
              </p>
            </div>
          </div>

          <div className="bg-[#F2F8F5] p-4 rounded-2xl border border-emerald-900/[0.06] text-xs text-slate-700 space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Status Ketahanan Data: Aktif & Permanen</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Seluruh catatan absensi, daftar dokter, paramedis, dan jadwal tersimpan secara permanen. Data tetap aman dan tidak akan hilang saat browser ditutup atau direfresh.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleExportBackup}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-emerald-900/15 bg-white hover:bg-emerald-50/60 text-[#133E2B] text-xs font-bold transition cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>Download Backup (JSON)</span>
            </button>

            <label className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer shadow-2xs">
              <Upload className="w-3.5 h-3.5 text-slate-600" />
              <span>Restore Backup</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
          </div>

          {isAdmin && (
            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={handleResetToDefault}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-rose-700 hover:bg-rose-50/60 border border-rose-200 text-xs font-bold transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset ke Data Bawaan Default Klinik</span>
              </button>
            </div>
          )}
        </div>

        {/* 3. Profil Klinik Sidogiri (Admin Editable) */}
        {isAdmin && (
          <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-emerald-900/[0.07] shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Building2 className="w-4 h-4 text-emerald-700" />
              <div>
                <h2 className="text-base font-extrabold text-[#112F20] uppercase tracking-tight">
                  Identitas & Profil Klinik Sidogiri
                </h2>
                <p className="text-xs text-slate-500">
                  Data instansi yang tercantum pada kop laporan dan sistem presensi
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveClinicProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Fasilitas Pelayanan Kesehatan
                  </label>
                  <input
                    type="text"
                    value={profile.nama}
                    onChange={(e) => setProfile({ ...profile, nama: e.target.value })}
                    className="w-full bg-[#F9FBFA] border border-emerald-900/15 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tagline / Semboyan
                  </label>
                  <input
                    type="text"
                    value={profile.tagline}
                    onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                    className="w-full bg-[#F9FBFA] border border-emerald-900/15 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alamat Lengkap
                </label>
                <input
                  type="text"
                  value={profile.alamat}
                  onChange={(e) => setProfile({ ...profile, alamat: e.target.value })}
                  className="w-full bg-[#F9FBFA] border border-emerald-900/15 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor Telepon & Emergency
                  </label>
                  <input
                    type="text"
                    value={profile.telepon}
                    onChange={(e) => setProfile({ ...profile, telepon: e.target.value })}
                    className="w-full bg-[#F9FBFA] border border-emerald-900/15 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Resmi
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full bg-[#F9FBFA] border border-emerald-900/15 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kepala Layanan Medis
                  </label>
                  <input
                    type="text"
                    value={profile.kepalaKlinik}
                    onChange={(e) => setProfile({ ...profile, kepalaKlinik: e.target.value })}
                    className="w-full bg-[#F9FBFA] border border-emerald-900/15 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#1B4332] hover:bg-[#245A44] transition cursor-pointer shadow-xs"
                >
                  Simpan Perubahan Profil Klinik
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
