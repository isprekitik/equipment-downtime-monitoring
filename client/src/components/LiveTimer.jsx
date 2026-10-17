import React, { useEffect, useState } from 'react';
import { formatDuration } from '../utils';

export default function LiveTimer({ startedAt }) {
  const [tick, setTick] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="font-mono tabular-nums">{formatDuration(tick - (startedAt || tick))}</span>;
}
