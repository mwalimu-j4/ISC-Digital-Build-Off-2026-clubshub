import type { ClubActivity } from '@/modules/discovery/types';

export function activityFromHealthScore(score: number): ClubActivity {
  const normalized = Math.min(100, Math.max(0, score));
  if (normalized >= 70) return { label: 'Very active', score: normalized, dots: 5 };
  if (normalized >= 40) return { label: 'Active', score: normalized, dots: 3 };
  return { label: 'Quiet', score: normalized, dots: 1 };
}
