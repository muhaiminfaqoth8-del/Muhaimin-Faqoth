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
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
          icon: CheckCircle2,
          label: 'HADIR',
          iconColor: 'text-emerald-600',
        };
      case 'TERLAMBAT':
        return {
          bg: 'bg-amber-50 text-amber-900 border-amber-200/80',
          icon: Clock,
          label: 'TERLAMBAT',
          iconColor: 'text-amber-600',
        };
      case 'IZIN':
        return {
          bg: 'bg-sky-50 text-sky-900 border-sky-200/80',
          icon: FileText,
          label: 'IZIN',
          iconColor: 'text-sky-600',
        };
      case 'SAKIT':
        return {
          bg: 'bg-purple-50 text-purple-900 border-purple-200/80',
          icon: HeartPulse,
          label: 'SAKIT',
          iconColor: 'text-purple-600',
        };
      case 'ALPA':
        return {
          bg: 'bg-rose-50 text-rose-900 border-rose-200/80',
          icon: XCircle,
          label: 'ALPA',
          iconColor: 'text-rose-600',
        };
      case 'SUDAH PULANG':
        return {
          bg: 'bg-teal-50 text-teal-900 border-teal-200/80',
          icon: LogOut,
          label: 'SUDAH PULANG',
          iconColor: 'text-teal-600',
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          icon: Clock,
          label: st || 'BELUM ABSEN',
          iconColor: 'text-slate-400',
        };
    }
  };

  const config = getBadgeConfig(status);
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 font-semibold',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-bold',
    lg: 'text-xs sm:text-sm px-3 py-1.5 gap-2 font-bold',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-xl border shadow-2xs transition-all ${config.bg} ${sizeClasses}`}
    >
      {showIcon && <Icon className={`${iconSizes} ${config.iconColor} shrink-0`} />}
      <span className="tracking-wide">{config.label}</span>
    </span>
  );
};
