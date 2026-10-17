import React from 'react';
import { statusLabel } from '../utils';

export default function StatusBadge({ status }) {
  const cls = status === 'down'
    ? 'bg-red-500/15 text-red-300 border-red-500/30'
    : status === 'standby'
      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
      : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${cls}`}>{statusLabel(status)}</span>;
}
