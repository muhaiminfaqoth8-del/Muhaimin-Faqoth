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
  textColor = 'text-emerald-950',
  className = '',
}) => {
  const dimensions = {
    sm: { box: 'w-8 h-8', textTitle: 'text-sm font-bold', textSub: 'text-[10px]' },
    md: { box: 'w-11 h-11', textTitle: 'text-base font-bold', textSub: 'text-xs' },
    lg: { box: 'w-14 h-14', textTitle: 'text-xl font-extrabold', textSub: 'text-xs' },
    xl: { box: 'w-20 h-20', textTitle: 'text-2xl font-black', textSub: 'text-sm' },
  }[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* SVG Emblem with Emerald Gradient, Islamic Crescent, and Medical Cross */}
      <div className={`relative flex-shrink-0 ${dimensions.box} rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-900 shadow-md shadow-emerald-700/20 flex items-center justify-center p-2 border border-emerald-400/40`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow"
        >
          {/* Subtle Octagram/Star Islamic Ring */}
          <circle cx="50" cy="50" r="44" stroke="#A7F3D0" strokeWidth="2.5" strokeDasharray="3 3" opacity="0.6" />
          
          {/* Elegant Medical Crescent */}
          <path
            d="M58 20C40 20 25 34 25 52C25 70 40 84 58 84C48 80 41 68 41 52C41 36 48 24 58 20Z"
            fill="#FDE047"
          />

          {/* Medical Cross in White */}
          <path
            d="M57 37H65V48H76V56H65V67H57V56H46V48H57V37Z"
            fill="#FFFFFF"
          />

          {/* Stethoscope Accent */}
          <path
            d="M32 50C32 60 40 68 50 68C56 68 61 65 64 61"
            stroke="#6EE7B7"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="64" cy="61" r="2.5" fill="#FFFFFF" />
        </svg>
        {/* Glow indicator */}
        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-white"></div>
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <span className={`tracking-tight leading-tight uppercase ${textColor} ${dimensions.textTitle}`}>
            KLINIK SIDOGIRI
          </span>
          <span className={`text-emerald-700 font-medium tracking-normal ${dimensions.textSub}`}>
            Layanan Kesehatan Terpadu
          </span>
        </div>
      )}
    </div>
  );
};
