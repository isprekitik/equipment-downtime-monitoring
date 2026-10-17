import React from 'react';

import {
  Moon,
  Sun,
} from 'lucide-react';

export default function ThemeToggle({
  isDark,
  onToggle,
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`
        flex
        h-11
        items-center
        gap-2
        rounded-xl
        border
        px-3
        text-sm
        font-black
        transition

        ${
          isDark
            ? `
                border-slate-700
                bg-slate-800
                text-slate-200
                hover:bg-slate-700
              `
            : `
                border-slate-300
                bg-white
                text-slate-700
                shadow-sm
                hover:bg-slate-100
              `
        }
      `}
      title={
        isDark
          ? 'Switch to Light Theme'
          : 'Switch to Dark Theme'
      }
    >
      {isDark ? (
        <>
          <Sun
            size={18}
            className="text-amber-400"
          />

          <span className="hidden sm:inline">
            Light
          </span>
        </>
      ) : (
        <>
          <Moon
            size={18}
            className="text-indigo-600"
          />

          <span className="hidden sm:inline">
            Dark
          </span>
        </>
      )}
    </button>
  );
}