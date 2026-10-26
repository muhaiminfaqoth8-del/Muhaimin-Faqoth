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
  textColor = 'text-[#112F20]',
  className = '',
}) => {
  const dimensions = {
    sm: { box: 'w-8 h-8', icon: 'w-4 h-4', textTitle: 'text-sm font-bold', textSub: 'text-[10px]' },
    md: { box: 'w-10 h-10', icon: 'w-5 h-5', textTitle: 'text-base font-extrabold', textSub: 'text-[11px]' },
    lg: { box: 'w-14 h-14', icon: 'w-7 h-7', textTitle: 'text-xl font-black', textSub: 'text-xs' },
    xl: { box: 'w-20 h-20', icon: 'w-10 h-10', textTitle: 'text-2xl font-black', textSub: 'text-sm' },
  }[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Refined Islamic Medical Seal */}
      <div
        className={`relative flex-shrink-0 ${dimensions.box} rounded-2xl bg-gradient-to-br from-[#1B4332] via-[#245A44] to-[#0F291E] shadow-sm shadow-emerald-950/20 flex items-center justify-center p-2 border border-emerald-500/25 transition-transform hover:scale-105`}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-xs"
        >
          {/* Subtle Octagram / Islamic Geometric Circle */}
          <circle cx="50" cy="50" r="44" stroke="#A7F3D0" strokeWidth="2" strokeDasharray="3 3" opacity="0.45" />

          {/* Gentle Medical Crescent */}
          <path
            d="M58 20C40 20 25 34 25 52C25 70 40 84 58 84C48 80 41 68 41 52C41 36 48 24 58 20Z"
            fill="#FACC15"
            opacity="0.95"
          />

          {/* Medical Cross in Pure White */}
          <path
            d="M57 37H65V48H76V56H65V67H57V56H46V48H57V37Z"
            fill="#FFFFFF"
          />

          {/* Stethoscope Curve Accent */}
          <path
            d="M32 50C32 60 40 68 50 68C56 68 61 65 64 61"
            stroke="#6EE7B7"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="64" cy="61" r="2.5" fill="#FFFFFF" />
        </svg>

        {/* Delicate pulse aura indicator */}
        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 ring-2 ring-white"></span>
        </span>
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <span className={`tracking-tight leading-tight uppercase font-black ${textColor} ${dimensions.textTitle}`}>
            KLINIK SIDOGIRI
          </span>
          <span className={`text-emerald-700 font-semibold tracking-normal ${dimensions.textSub}`}>
            Layanan Kesehatan Terpadu
          </span>
        </div>
      )}
    </div>
  );
};
