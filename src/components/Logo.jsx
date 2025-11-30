import React from 'react';

export default function Logo({ className = "w-10 h-10" }) {
  return (
    <div className={`${className} relative flex items-center justify-center`}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <linearGradient id="logoGrad" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#06b6d4" />   {/* Cyan-500 */}
            <stop offset="100%" stopColor="#10b981" /> {/* Emerald-500 */}
          </linearGradient>
        </defs>

        {/* Outer Ring (Static) */}
        <circle cx="50" cy="50" r="45" stroke="url(#logoGrad)" strokeWidth="8" strokeOpacity="0.3" />

        {/* Inner Segment (Rotating) */}
        <path 
          d="M50 15 A35 35 0 1 1 15 50" 
          stroke="url(#logoGrad)" 
          strokeWidth="8" 
          strokeLinecap="round"
          className="origin-center animate-[spin_3s_linear_infinite]" 
        />

        {/* Central Core (Pulse) */}
        <circle cx="50" cy="50" r="12" fill="#fff" className="animate-pulse" />
      </svg>
    </div>
  );
}