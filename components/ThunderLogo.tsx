'use client';

import React from 'react';

export function ThunderLogo({
  size = 'md',
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg' | number;
  className?: string;
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
      <div
        className={`${dim} rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-500 flex items-center justify-center shadow-lg border-2 border-amber-300 transform transition hover:rotate-6 flex-shrink-0`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`${iconSize} text-slate-950 drop-shadow`}
        >
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      </div>
      <div>
        <div className="flex items-center gap-1.5">
          <span className="font-black text-lg sm:text-xl tracking-tight text-white leading-none">
            SahulatRail
          </span>
          <span className="text-[9px] font-black tracking-widest uppercase bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.5 rounded-full">
            THUNDER
          </span>
        </div>
        <div className="text-[10px] text-indigo-200 tracking-wide font-medium">
          DPI AI Platform by Team Thunder
        </div>
      </div>
    </div>
  );
}

export default ThunderLogo;
