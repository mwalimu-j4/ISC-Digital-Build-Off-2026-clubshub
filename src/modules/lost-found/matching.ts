interface MatchCandidate {
  id: string;
  name: string;
  description: string;
  category: string;
  color: string | null;
  brand: string | null;
  model: string | null;
  campusArea: string;
  building: string | null;
  dateOccurred: Date;
}

interface SourceItem {
  name: string;
  description: string;
  category: string;
  color?: string | null;
  brand?: string | null;
  model?: string | null;
  campusArea: string;
  building?: string | null;
  dateOccurred: Date;
}

export interface MatchResult {
  candidateId: string;
  score: number;
  breakdown: {
    category: number;
    location: number;
    time: number;
    description: number;
    color: number;
    brand: number;
  };
}

function normalise(s: string | null | undefined): string {
  return (s ?? '').toLowerCase().trim();
}

function wordOverlap(a: string, b: string): number {
  const wordsA = new Set(normalise(a).split(/\s+/).filter(Boolean));
  const wordsB = new Set(normalise(b).split(/\s+/).filter(Boolean));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let overlap = 0;
  for (const word of wordsA) {
    if (wordsB.has(word)) overlap++;
  }
  return overlap / Math.max(wordsA.size, wordsB.size);
}

function daysBetween(a: Date, b: Date): number {
  return Math.abs((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

export function computeMatchScore(source: SourceItem, candidate: MatchCandidate): MatchResult {
  const breakdown = {
    category: 0,
    location: 0,
    time: 0,
    description: 0,
    color: 0,
    brand: 0,
  };

  // Category — exact match (weight: 30)
  if (normalise(source.category) === normalise(candidate.category)) {
    breakdown.category = 30;
  }

  // Location — area + building (weight: 25)
  if (normalise(source.campusArea) === normalise(candidate.campusArea)) {
    breakdown.location += 15;
    if (source.building && candidate.building && normalise(source.building) === normalise(candidate.building)) {
      breakdown.location += 10;
    }
  }

  // Time proximity — within 14 days (weight: 15)
  const days = daysBetween(source.dateOccurred, candidate.dateOccurred);
  if (days <= 1) breakdown.time = 15;
  else if (days <= 3) breakdown.time = 12;
  else if (days <= 7) breakdown.time = 8;
  else if (days <= 14) breakdown.time = 4;

  // Description similarity (weight: 15)
  const descOverlap = wordOverlap(source.description, candidate.description);
  const nameOverlap = wordOverlap(source.name, candidate.name);
  breakdown.description = Math.round(Math.max(descOverlap, nameOverlap) * 15);

  // Color match (weight: 8)
  if (source.color && candidate.color && normalise(source.color) === normalise(candidate.color)) {
    breakdown.color = 8;
  }

  // Brand/model match (weight: 7)
  if (source.brand && candidate.brand && normalise(source.brand) === normalise(candidate.brand)) {
    breakdown.brand += 5;
  }
  if (source.model && candidate.model && normalise(source.model) === normalise(candidate.model)) {
    breakdown.brand += 2;
  }

  const score = Object.values(breakdown).reduce((sum, v) => sum + v, 0);

  return { candidateId: candidate.id, score, breakdown };
}

export function findMatches(source: SourceItem, candidates: MatchCandidate[], minScore = 30): MatchResult[] {
  return candidates
    .map((c) => computeMatchScore(source, c))
    .filter((m) => m.score >= minScore)
    .sort((a, b) => b.score - a.score);
}
