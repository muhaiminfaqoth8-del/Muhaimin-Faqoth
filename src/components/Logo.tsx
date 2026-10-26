import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: string;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  textColor = 'text-slate-900',
  className = '',
}) => {
  const dimensions = {
    sm: { box: 'w-8 h-8', img: 'w-8 h-8', textTitle: 'text-sm font-bold', textSub: 'text-[10px]' },
    md: { box: 'w-11 h-11', img: 'w-11 h-11', textTitle: 'text-base font-extrabold', textSub: 'text-[11px]' },
    lg: { box: 'w-16 h-16', img: 'w-16 h-16', textTitle: 'text-xl font-black', textSub: 'text-xs' },
    xl: { box: 'w-24 h-24', img: 'w-24 h-24', textTitle: 'text-2xl font-black', textSub: 'text-sm' },
  }[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Official Red Crescent Logo (Bulan Sabit Merah Klinik Sidogiri) */}
      <div
        className={`relative shrink-0 ${dimensions.box} flex items-center justify-center transition-transform hover:scale-105`}
      >
        <img
          src="/assets/logo_clean.png"
          alt="Logo Klinik Sidogiri"
          className={`${dimensions.img} object-contain drop-shadow-xs`}
          onError={(e) => {
            // Fallback to vector SVG if png fails to load
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/assets/logo_sidogiri_merah.svg';
          }}
        />

        {/* Delicate active indicator */}
        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600 ring-2 ring-white"></span>
        </span>
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className={`tracking-tight leading-tight uppercase font-black ${textColor} ${dimensions.textTitle}`}>
              KLINIK SIDOGIRI
            </span>
          </div>
          <span className={`text-rose-700 font-bold tracking-normal ${dimensions.textSub}`}>
            Layanan Kesehatan Terpadu
          </span>
        </div>
      )}
    </div>
  );
};
