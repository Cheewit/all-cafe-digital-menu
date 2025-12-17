// KPI_FLAG_V1
export function kpiFlag(current?: number, prev?: number) {
  if (current == null || !isFinite(current) || prev == null || !isFinite(prev) || prev === 0) {
    return { deltaPct: null, icon: null, tone: 'neutral' as const };
  }
  const deltaPct = ((current - prev) / Math.abs(prev)) * 100;
  // Use a higher threshold for more significant alerts
  const icon = deltaPct > 15 ? '🔥' : deltaPct < -15 ? '❄️' : null; 
  const tone = deltaPct > 0 ? 'up' : deltaPct < 0 ? 'down' : 'neutral' as const;
  return { deltaPct, icon, tone };
}
