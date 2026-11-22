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
      {/* High-Contrast Electric Gold Lightning Badge - Totally distinct from body #4A4949 */}
      <div
        className={`${dim} rounded-md bg-gradient-to-br from-[#F59E0B] via-[#EAB308] to-[#D97706] flex items-center justify-center shadow-lg border-2 border-[#FEF08A] text-[#1C1B1F] flex-shrink-0 transition-transform group-hover:scale-105`}
        title="Team Thunder - Coder's Cup '26"
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`${iconSize} text-[#1C1B1F] drop-shadow-sm`}
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
            <span className="text-[10px] font-black tracking-widest uppercase bg-[#F59E0B] text-[#1C1B1F] border border-[#FEF08A] px-1.5 py-0.5 rounded shadow-sm">
              THUNDER
            </span>
          </div>
          <span className="text-[10px] text-white/90 tracking-wide font-medium">
            AI on Public Rails
          </span>
        </div>
      )}
    </div>
  );
}

export default ThunderLogo;
