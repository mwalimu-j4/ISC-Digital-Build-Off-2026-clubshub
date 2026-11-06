// Public API for profile module
export {
  getProfile,
  getProfileActivity,
  getProfileMemberships,
  getProfileProposedClubs,
  getProfileStats,
  ProfileServiceError,
  updateProfile,
} from './services/profile-service';
export type { ProfileUpdateData, ProfileWithPrivacy } from './types';
export type { UpdateProfileInput } from './validations/profile-schema';
export { updateProfileSchema } from './validations/profile-schema';
