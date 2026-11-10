export type DiscoveryInterest = { id: string; name: string; slug: string };

export type ClubActivity = {
  label: 'Very active' | 'Active' | 'Quiet';
  score: number;
  dots: number;
};

export type DiscoveryClubCard = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  logoUrl: string | null;
  verified: boolean;
  memberCount: number;
  activity: ClubActivity;
  interests: DiscoveryInterest[];
  matchingInterests: DiscoveryInterest[];
  matchPercent?: number;
  featured: boolean;
  nextEvent: { title: string; startsAt: Date; location: string } | null;
  chairperson: { name: string; title: string } | null;
  createdAt: Date;
};

export type DiscoveryCandidate = Omit<
  DiscoveryClubCard,
  'matchingInterests' | 'matchPercent' | 'featured'
> & {
  latestPublicEventAt: Date | null;
};

export type RankedDiscoveryClub = DiscoveryCandidate & {
  matchingInterests: DiscoveryInterest[];
  matchPercent?: number;
  recommendationScore: number;
};

export type DiscoveryResult = {
  interests: DiscoveryInterest[];
  selectedInterests: string[];
  categories: Array<{ name: string; count: number }>;
  featured: DiscoveryClubCard[];
  clubs: DiscoveryClubCard[];
  total: number;
  page: number;
  pageSize: number;
};
