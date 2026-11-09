export {
  REMEMBERED_SPACE_COOKIE,
  REMEMBERED_SPACE_MAX_AGE,
  SPACE_SEARCH_THRESHOLD,
} from './constants/spaces';
export {
  getSpaceById,
  getUserSpaces,
  resolvePostLoginDestination,
} from './services/spaces-service';
export type { UserSpace } from './types';
