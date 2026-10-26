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
      <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-900 ${className}`}>
        <Clock className="w-4 h-4 text-emerald-600 animate-pulse" />
        <span className="font-mono font-bold text-sm tracking-wider">
          {hours}:{minutes}:{seconds}
        </span>
        <span className="text-xs text-emerald-700 font-semibold border-l border-emerald-300 pl-2">
          {dayName}, {dayNum} {monthName}
        </span>
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-950 text-white p-6 shadow-xl shadow-emerald-900/20 border border-emerald-700/50 ${className}`}
      >
        <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-emerald-300">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-emerald-300 font-bold">
                Waktu Realtime Sistem
              </p>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {dayName}, {dayNum} {monthName} {year}
              </h3>
            </div>
          </div>

          <div className="flex items-baseline gap-2 bg-black/20 backdrop-blur-md px-5 py-2.5 rounded-xl border border-white/10">
            <span className="font-mono text-3xl sm:text-4xl font-extrabold tracking-widest text-emerald-300 drop-shadow">
              {hours}
              <span className="animate-pulse text-emerald-400">:</span>
              {minutes}
              <span className="animate-pulse text-emerald-400">:</span>
              {seconds}
            </span>
            <span className="text-xs font-bold text-emerald-200 tracking-wider">
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
      className={`rounded-2xl bg-white p-5 shadow-sm border border-emerald-100 flex flex-col justify-between ${className}`}
    >
      <div className="flex items-center justify-between text-slate-500 text-xs mb-2 font-medium">
        <span className="inline-flex items-center gap-1.5 text-emerald-800 font-bold uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5 text-emerald-600" />
          Jam Operasional
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          REALTIME
        </span>
      </div>

      <div className="my-1">
        <div className="font-mono text-3xl font-black tracking-wider text-emerald-950 flex items-center gap-1">
          <span>{hours}</span>
          <span className="animate-pulse text-emerald-600">:</span>
          <span>{minutes}</span>
          <span className="animate-pulse text-emerald-600">:</span>
          <span>{seconds}</span>
          <span className="text-xs font-bold text-emerald-700 ml-1.5 px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200">
            WIB
          </span>
        </div>
        <p className="text-sm font-semibold text-slate-600 mt-1 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
          {dayName}, {dayNum} {monthName} {year}
        </p>
      </div>
    </div>
  );
};
