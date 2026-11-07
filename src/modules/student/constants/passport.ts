export type PassportCounts = {
  profileComplete: boolean;
  clubsJoined: number;
  eventsRegistered: number;
  proposalsSubmitted: number;
};

export type PassportResult = {
  level: 'Newcomer' | 'Explorer' | 'Connector' | 'Contributor' | 'Leader';
  completed: number;
  total: number;
  nextHint: string;
};

const LEVELS: PassportResult['level'][] = [
  'Newcomer',
  'Explorer',
  'Connector',
  'Contributor',
  'Leader',
];

export function calculatePassport(counts: PassportCounts): PassportResult {
  const completed = [
    counts.profileComplete,
    counts.clubsJoined >= 1,
    counts.eventsRegistered >= 1,
    counts.clubsJoined >= 2,
    counts.proposalsSubmitted >= 1,
  ].filter(Boolean).length;
  const level = LEVELS[Math.min(Math.max(completed - 1, 0), LEVELS.length - 1)] ?? 'Newcomer';
  const hints = [
    'Complete your profile to get started.',
    'Join your first club to unlock Explorer.',
    'Attend your first event to unlock Connector.',
    'Join a second club to unlock Contributor.',
    'Propose a club to reach Leader.',
    'You have unlocked every campus milestone.',
  ];

  const nextHint = hints[completed] ?? 'You have unlocked every campus milestone.';
  return { level, completed, total: LEVELS.length, nextHint };
}
