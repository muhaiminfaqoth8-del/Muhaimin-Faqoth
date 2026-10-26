import React from 'react';
import { AttendanceStatus } from '../types';
import { CheckCircle2, Clock, FileText, HeartPulse, XCircle, LogOut } from 'lucide-react';

interface StatusBadgeProps {
  status: AttendanceStatus | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const getBadgeConfig = (st: string) => {
    switch (st) {
      case 'HADIR':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-emerald-500/10',
          icon: CheckCircle2,
          label: 'HADIR',
          dot: 'bg-emerald-500',
        };
      case 'TERLAMBAT':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-300 ring-amber-500/10',
          icon: Clock,
          label: 'TERLAMBAT',
          dot: 'bg-amber-500',
        };
      case 'IZIN':
        return {
          bg: 'bg-sky-50 text-sky-700 border-sky-300 ring-sky-500/10',
          icon: FileText,
          label: 'IZIN',
          dot: 'bg-sky-500',
        };
      case 'SAKIT':
        return {
          bg: 'bg-purple-50 text-purple-700 border-purple-300 ring-purple-500/10',
          icon: HeartPulse,
          label: 'SAKIT',
          dot: 'bg-purple-500',
        };
      case 'ALPA':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-300 ring-rose-500/10',
          icon: XCircle,
          label: 'ALPA',
          dot: 'bg-rose-500',
        };
      case 'SUDAH PULANG':
        return {
          bg: 'bg-teal-50 text-teal-800 border-teal-300 ring-teal-500/10',
          icon: LogOut,
          label: 'SUDAH PULANG',
          dot: 'bg-teal-600',
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-400/10',
          icon: Clock,
          label: st || 'BELUM ABSEN',
          dot: 'bg-slate-400',
        };
    }
  };

  const config = getBadgeConfig(status);
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1 font-semibold',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-bold',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-extrabold',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-xs ring-1 transition-all ${config.bg} ${sizeClasses}`}
    >
      {showIcon && <Icon className={`${iconSizes} shrink-0`} />}
      <span>{config.label}</span>
    </span>
  );
};
