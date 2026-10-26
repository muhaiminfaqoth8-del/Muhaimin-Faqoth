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
  Stethoscope,
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

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: isAdmin ? 'Dashboard Admin' : 'Dashboard Petugas',
      icon: LayoutDashboard,
    },
    {
      id: 'absensi',
      label: 'Absensi',
      icon: Clock,
    },
    {
      id: 'jadwal',
      label: 'Jadwal Kerja',
      icon: CalendarDays,
    },
    {
      id: 'petugas',
      label: 'Data Petugas',
      icon: Users,
      adminOnly: true,
    },
    {
      id: 'riwayat',
      label: 'Riwayat Absensi',
      icon: History,
    },
    {
      id: 'laporan',
      label: 'Laporan',
      icon: FileSpreadsheet,
    },
    {
      id: 'pengaturan',
      label: 'Pengaturan',
      icon: Settings,
    },
  ];

  const visibleItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <nav className="bg-white border-b border-emerald-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between overflow-x-auto scrollbar-none py-1">
          <div className="flex items-center space-x-1 sm:space-x-2">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                      : 'text-slate-600 hover:text-emerald-800 hover:bg-emerald-50/70'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-transform ${
                      isActive ? 'text-emerald-200 scale-110' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden md:flex items-center pl-4 border-l border-emerald-100">
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
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
