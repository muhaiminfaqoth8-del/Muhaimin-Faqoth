import React, { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';

interface DigitalClockProps {
  variant?: 'card' | 'compact' | 'hero';
  className?: string;
}

export const DigitalClock: React.FC<DigitalClockProps> = ({
  variant = 'card',
  className = '',
}) => {
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDayName = (date: Date) => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[date.getDay()];
  };

  const formatMonthName = (date: Date) => {
    const months = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ];
    return months[date.getMonth()];
  };

  const dayName = formatDayName(time);
  const dayNum = time.getDate();
  const monthName = formatMonthName(time);
  const year = time.getFullYear();

  const hours = String(time.getHours()).padStart(2, '0');
  const minutes = String(time.getMinutes()).padStart(2, '0');
  const seconds = String(time.getSeconds()).padStart(2, '0');

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/80 backdrop-blur-sm border border-emerald-900/[0.08] shadow-2xs text-[#133E2B] ${className}`}>
        <Clock className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
        <span className="font-mono font-bold text-xs tracking-wider tabular-nums">
          {hours}:{minutes}:{seconds}
        </span>
        <span className="text-[11px] text-slate-500 font-medium border-l border-emerald-900/10 pl-2">
          {dayName}, {dayNum} {monthName}
        </span>
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl bg-[#0F291E]/40 backdrop-blur-md p-4 sm:p-5 border border-white/10 ${className}`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/15 text-emerald-300">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-emerald-300 font-semibold">
                Waktu Realtime Sistem
              </p>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                {dayName}, {dayNum} {monthName} {year}
              </h3>
            </div>
          </div>

          <div className="flex items-baseline gap-2 bg-black/25 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
            <span className="font-mono text-2xl sm:text-3xl font-extrabold tracking-widest text-emerald-200 tabular-nums">
              {hours}
              <span className="animate-pulse text-emerald-400 mx-0.5">:</span>
              {minutes}
              <span className="animate-pulse text-emerald-400 mx-0.5">:</span>
              {seconds}
            </span>
            <span className="text-[10px] font-bold text-emerald-300 tracking-wider">
              WIB
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Default card variant
  return (
    <div
      className={`rounded-2xl bg-white p-5 shadow-xs border border-emerald-900/[0.07] flex flex-col justify-between ${className}`}
    >
      <div className="flex items-center justify-between text-slate-500 text-xs mb-2 font-medium">
        <span className="inline-flex items-center gap-1.5 text-[#133E2B] font-bold uppercase tracking-wider text-[11px]">
          <Clock className="w-3.5 h-3.5 text-emerald-600" />
          Jam Operasional
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full font-bold border border-emerald-200/60">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          REALTIME
        </span>
      </div>

      <div className="my-1">
        <div className="font-mono text-3xl font-black tracking-wider text-[#112F20] flex items-center gap-1 tabular-nums">
          <span>{hours}</span>
          <span className="animate-pulse text-emerald-600">:</span>
          <span>{minutes}</span>
          <span className="animate-pulse text-emerald-600">:</span>
          <span>{seconds}</span>
          <span className="text-xs font-bold text-emerald-800 ml-2 px-1.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200/70">
            WIB
          </span>
        </div>
        <p className="text-xs font-medium text-slate-500 mt-2 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
          {dayName}, {dayNum} {monthName} {year}
        </p>
      </div>
    </div>
  );
};
