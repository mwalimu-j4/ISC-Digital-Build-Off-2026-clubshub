import type { LostFoundCategory } from '@prisma/client';

import type { DiscoveryResult } from '@/modules/discovery';

export type LandingClub = {
  id: string;
  name: string;
  slug: string;
  category: string;
  logoUrl: string | null;
  memberCount: number;
};

export type LandingEvent = {
  id: string;
  title: string;
  location: string;
  startsAt: Date;
  club: { name: string; slug: string };
};

export type LandingAnnouncement = {
  id: string;
  title: string;
  body: string;
  createdAt: Date;
};

export type LandingLostItem = {
  id: string;
  reportType: 'LOST' | 'FOUND';
  category: LostFoundCategory;
  campusArea: string;
  dateOccurred: Date;
};

export type LandingData = {
  categories: Array<{ name: string; count: number }>;
  clubs: LandingClub[];
  events: LandingEvent[];
  announcements: LandingAnnouncement[];
  lostItems: LandingLostItem[];
  discovery: DiscoveryResult;
  stats: {
    activeClubs: number | null;
    upcomingEvents: number | null;
    newAnnouncements: number | null;
    openLostItems: number | null;
  };
};
