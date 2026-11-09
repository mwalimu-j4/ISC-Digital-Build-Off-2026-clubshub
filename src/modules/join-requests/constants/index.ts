export const DEPARTMENTS = [
  'Business',
  'Computing',
  'Education',
  'Health Sciences',
  'Humanities',
  'Social Sciences',
] as const;

export const REQUEST_PAGE_SIZE = 20;
export const REAPPLY_COOLDOWN_DAYS = 7;
export const UNDO_WINDOW_SECONDS = 10;

export const schoolIdPattern = /^[A-Za-z0-9]{4,30}$/;
