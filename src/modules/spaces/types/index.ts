export type SpaceKind = 'student' | 'admin' | 'member' | 'pending' | 'suspended' | 'super-admin';

export type UserSpace = {
  id: string;
  kind: SpaceKind;
  label: string;
  href: string | null;
  club: {
    name: string;
    slug: string;
    logoUrl: string | null;
    memberCount: number;
  } | null;
  attentionCount: number;
  disabledReason?: string;
};
