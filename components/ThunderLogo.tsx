'use client';

import React from 'react';

export function ThunderLogo({
  size = 'md',
  className = '',
  withText = true,
}: {
  size?: 'sm' | 'md' | 'lg' | number;
  className?: string;
  withText?: boolean;
}) {
  let dim = 'w-10 h-10';
  let iconSize = 'w-5 h-5';

  if (typeof size === 'number') {
    dim = size <= 20 ? 'w-6 h-6' : size <= 36 ? 'w-9 h-9' : 'w-12 h-12';
    iconSize = size <= 20 ? 'w-3.5 h-3.5' : size <= 36 ? 'w-5 h-5' : 'w-7 h-7';
  } else if (size === 'sm') {
    dim = 'w-8 h-8';
    iconSize = 'w-4 h-4';
  } else if (size === 'lg') {
    dim = 'w-14 h-14';
    iconSize = 'w-7 h-7';
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Lightning Badge */}
      <div
        className={`${dim} rounded-md bg-[#859114] flex items-center justify-center shadow border border-[#6F7910] text-white flex-shrink-0`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`${iconSize} text-white drop-shadow-sm`}
        >
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      </div>

      {withText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white leading-none">
              SahulatRail
            </span>
            <span className="text-[10px] font-black tracking-widest uppercase bg-white/20 text-white border border-white/30 px-1.5 py-0.2 rounded">
              THUNDER
            </span>
          </div>
          <span className="text-[10px] text-white/80 tracking-wide font-medium">
            AI on Public Rails
          </span>
        </div>
      )}
    </div>
  );
}

export default ThunderLogo;
