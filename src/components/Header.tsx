import React from 'react';
import { User } from '../types';
import { Logo } from './Logo';
import { DigitalClock } from './DigitalClock';
import { LogOut, UserCheck, ShieldCheck, Stethoscope, Activity } from 'lucide-react';

interface HeaderProps {
  currentUser: User | null;
  onLogout: () => void;
  onSwitchUser?: (user: User) => void;
  allUsers?: User[];
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogout,
  onSwitchUser,
  allUsers = [],
}) => {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return {
          bg: 'bg-emerald-950 text-emerald-200 border-emerald-800',
          icon: ShieldCheck,
          label: 'ADMINISTRATOR',
        };
      case 'DOKTER':
        return {
          bg: 'bg-teal-50 text-teal-800 border-teal-200',
          icon: Stethoscope,
          label: 'DOKTER',
        };
      case 'PARAMEDIS':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          icon: Activity,
          label: 'PARAMEDIS',
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          icon: UserCheck,
          label: role,
        };
    }
  };

  const badge = currentUser ? getRoleBadge(currentUser.jabatan) : null;
  const RoleIcon = badge ? badge.icon : UserCheck;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-emerald-900/[0.07] transition-all">
      {/* Top Banner with Sidogiri Identity */}
      <div className="bg-[#12372A] text-white px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium tracking-wide text-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Sistem Informasi Presensi Elektronik Klinik Sidogiri</span>
            <span className="hidden md:inline text-emerald-400/40">•</span>
            <span className="hidden md:inline text-emerald-200/80">Pondok Pesantren Sidogiri, Pasuruan</span>
          </div>

          {/* Quick Account Switcher Helper for seamless testing */}
          {currentUser && onSwitchUser && allUsers.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-emerald-300/80 hidden sm:inline">
                Simulasi Akun:
              </span>
              <select
                className="bg-[#0c241b] border border-emerald-700/60 text-emerald-100 text-xs rounded-lg px-2.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer"
                value={currentUser.id}
                onChange={(e) => {
                  const selected = allUsers.find((u) => u.id === e.target.value);
                  if (selected) onSwitchUser(selected);
                }}
                title="Ganti akun untuk pengujian"
              >
                <optgroup label="Administrator">
                  {allUsers
                    .filter((u) => u.jabatan === 'ADMIN')
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        [ADMIN] {u.nama}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Dokter">
                  {allUsers
                    .filter((u) => u.jabatan === 'DOKTER')
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        [DOKTER] {u.nama}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Paramedis">
                  {allUsers
                    .filter((u) => u.jabatan === 'PARAMEDIS')
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        [PARAMEDIS] {u.nama}
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Clinic Branding */}
          <div className="flex items-center gap-3">
            <Logo size="md" textColor="text-[#133E2B]" />
            <div className="hidden sm:block border-l border-emerald-900/10 pl-3">
              <h1 className="text-xs sm:text-sm font-extrabold text-[#112F20] uppercase tracking-tight">
                ABSENSI DOKTER & PARAMEDIS
              </h1>
              <p className="text-[11px] font-semibold text-emerald-700">
                Presensi Digital Terpadu Realtime
              </p>
            </div>
          </div>

          {/* Right Section: Digital Clock & User Info */}
          <div className="flex items-center gap-3">
            <DigitalClock variant="compact" className="hidden lg:flex" />

            {currentUser && (
              <div className="flex items-center gap-3 pl-2 sm:border-l sm:border-emerald-900/10">
                <div className="text-right hidden sm:block">
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="font-bold text-xs sm:text-sm text-slate-800 leading-tight">
                      {currentUser.nama}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-1.5 mt-0.5">
                    <span className="text-[11px] text-slate-500">
                      {currentUser.bagian}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${badge?.bg}`}
                    >
                      <RoleIcon className="w-2.5 h-2.5" />
                      {badge?.label}
                    </span>
                  </div>
                </div>

                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] text-white font-bold flex items-center justify-center shadow-xs border border-white text-xs">
                  {currentUser.nama
                    .split(' ')
                    .map((n) => n[0])
                    .filter((c) => /[a-zA-Z]/.test(c))
                    .slice(0, 2)
                    .join('')
                    .toUpperCase() || 'SD'}
                </div>

                <button
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50/70 hover:bg-rose-100/80 border border-rose-200/70 rounded-xl transition-colors cursor-pointer"
                  title="Keluar dari akun"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Keluar</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
