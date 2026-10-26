import React from 'react';
import { Role } from '../types';
import {
  LayoutDashboard,
  Clock,
  CalendarDays,
  Users,
  History,
  FileSpreadsheet,
  Settings,
  LogOut,
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'absensi'
  | 'jadwal'
  | 'petugas'
  | 'riwayat'
  | 'laporan'
  | 'pengaturan';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  userRole?: Role;
  onLogout: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  userRole = 'DOKTER',
  onLogout,
}) => {
  const isAdmin = userRole === 'ADMIN';

  interface NavItem {
    id: TabType;
    label: string;
    icon: React.ElementType;
    adminOnly?: boolean;
    badge?: string;
  }

  const navItems: NavItem[] = isAdmin
    ? [
        {
          id: 'dashboard',
          label: 'Dashboard Admin',
          icon: LayoutDashboard,
        },
        {
          id: 'petugas',
          label: 'Data Petugas',
          icon: Users,
        },
        {
          id: 'jadwal',
          label: 'Jadwal Kerja',
          icon: CalendarDays,
        },
        {
          id: 'riwayat',
          label: 'Riwayat Absensi',
          icon: History,
        },
        {
          id: 'laporan',
          label: 'Laporan Excel',
          icon: FileSpreadsheet,
        },
        {
          id: 'pengaturan',
          label: 'Pengaturan & GPS',
          icon: Settings,
        },
      ]
    : [
        {
          id: 'absensi',
          label: 'Presensi Kehadiran',
          icon: Clock,
        },
        {
          id: 'jadwal',
          label: 'Jadwal Tugas Saya',
          icon: CalendarDays,
        },
        {
          id: 'riwayat',
          label: 'Riwayat Presensi Saya',
          icon: History,
        },
      ];

  const visibleItems = navItems;

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-emerald-900/[0.06] shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between overflow-x-auto scrollbar-none py-1.5">
          <div className="flex items-center space-x-1 sm:space-x-1.5">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#1B4332] text-white shadow-xs'
                      : 'text-slate-600 hover:text-[#133E2B] hover:bg-emerald-50/70'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 transition-transform ${
                      isActive ? 'text-emerald-300' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden md:flex items-center pl-4 border-l border-emerald-900/[0.08]">
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-rose-700 rounded-lg hover:bg-rose-50/60 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
