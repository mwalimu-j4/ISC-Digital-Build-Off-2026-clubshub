import type { LostFoundCategory } from '@prisma/client';

export const CATEGORY_LABELS: Record<LostFoundCategory, string> = {
  IDENTIFICATION: 'Identification Document',
  ELECTRONICS: 'Electronics',
  CLOTHING: 'Clothing & Apparel',
  BAGS_WALLETS: 'Bags & Wallets',
  BOOKS_STATIONERY: 'Books & Stationery',
  KEYS: 'Keys',
  JEWELRY_ACCESSORIES: 'Jewelry & Accessories',
  SPORTS_EQUIPMENT: 'Sports Equipment',
  DOCUMENTS: 'Documents',
  WATER_BOTTLES: 'Water Bottles',
  HEADPHONES_EARBUDS: 'Headphones & Earbuds',
  OTHER: 'Other',
};

export const CATEGORY_ICONS: Record<LostFoundCategory, string> = {
  IDENTIFICATION: '🪪',
  ELECTRONICS: '📱',
  CLOTHING: '👕',
  BAGS_WALLETS: '👜',
  BOOKS_STATIONERY: '📚',
  KEYS: '🔑',
  JEWELRY_ACCESSORIES: '💍',
  SPORTS_EQUIPMENT: '⚽',
  DOCUMENTS: '📄',
  WATER_BOTTLES: '🥤',
  HEADPHONES_EARBUDS: '🎧',
  OTHER: '📦',
};

export const CAMPUS_AREAS = [
  'Main Campus',
  'North Campus',
  'South Campus',
  'East Campus',
  'West Campus',
  'Sports Complex',
  'Student Centre',
  'Administration Block',
] as const;

export const CAMPUS_BUILDINGS: Record<string, string[]> = {
  'Main Campus': [
    'Main Library',
    'Science Block',
    'Engineering Block',
    'Arts Building',
    'Lecture Hall Complex',
    'Student Cafeteria',
    'Main Gate',
    'Parking Area',
  ],
  'North Campus': ['North Library', 'Computer Lab', 'Seminar Hall', 'North Gate'],
  'South Campus': ['South Library', 'Research Centre', 'Auditorium', 'South Gate'],
  'East Campus': ['Workshop Block', 'Laboratory Complex', 'East Gate'],
  'West Campus': ['Medical Centre', 'Hostel Block A', 'Hostel Block B', 'West Gate'],
  'Sports Complex': ['Gymnasium', 'Swimming Pool', 'Cricket Ground', 'Football Field', 'Indoor Court'],
  'Student Centre': ['Common Room', 'Food Court', 'Activities Hall', 'Meeting Rooms'],
  'Administration Block': ['Registrar Office', 'Finance Office', 'Exam Hall', 'Reception'],
};

export const DEFAULT_CHECKPOINTS: Record<string, string[]> = {
  'Main Library': [
    'Entrance & Reception',
    'Ground Floor — Study Area',
    'Ground Floor — Computer Section',
    'First Floor — Study Tables',
    'First Floor — Bookshelves',
    'Second Floor — Study Area',
    'Second Floor — Reading Room',
    'Lost & Found Desk',
    'Restrooms',
    'Exit Area',
  ],
  'Science Block': ['Entrance', 'Ground Floor Corridor', 'First Floor Labs', 'Second Floor Lecture Rooms', 'Staff Room', 'Restrooms'],
  'Engineering Block': ['Entrance', 'Ground Floor Labs', 'Workshop Area', 'First Floor Classrooms', 'Second Floor Classrooms', 'Computer Lab', 'Restrooms'],
  'Student Cafeteria': ['Main Dining Area', 'Counter Area', 'Outdoor Seating', 'Entrance'],
  'Lecture Hall Complex': ['Hall A', 'Hall B', 'Hall C', 'Corridor', 'Entrance', 'Restrooms'],
};

export const STATUS_LABELS: Record<string, string> = {
  PENDING_REVIEW: 'Pending Review',
  VERIFIED: 'Verified',
  SEARCHING: 'Searching',
  POSSIBLE_MATCH: 'Possible Match',
  OWNERSHIP_VERIFICATION: 'Verifying Ownership',
  READY_FOR_COLLECTION: 'Ready for Collection',
  HANDED_OVER: 'Handed Over',
  RECOVERED: 'Recovered',
  CLOSED: 'Closed',
  EXPIRED: 'Expired',
  REJECTED: 'Rejected',
};

export const STATUS_COLORS: Record<string, string> = {
  PENDING_REVIEW: 'status-pending',
  VERIFIED: 'status-verified',
  SEARCHING: 'status-searching',
  POSSIBLE_MATCH: 'status-match',
  OWNERSHIP_VERIFICATION: 'status-verification',
  READY_FOR_COLLECTION: 'status-collection',
  HANDED_OVER: 'status-handover',
  RECOVERED: 'status-recovered',
  CLOSED: 'status-closed',
  EXPIRED: 'status-expired',
  REJECTED: 'status-rejected',
};

export const RECOVERY_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED_FOUND: 'Found',
  COMPLETED_NOT_FOUND: 'Not Found',
  CANCELLED: 'Cancelled',
  ESCALATED: 'Escalated',
};

export const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

export const MAX_IMAGES = 4;
export const MAX_IMAGE_SIZE_MB = 5;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
