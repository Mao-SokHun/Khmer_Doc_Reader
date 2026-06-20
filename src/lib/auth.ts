/** Google Sign-In + workspace owner id management. */

const OWNER_KEY = 'khmer-lesson-doc-owner-id';
const PROFILE_KEY = 'khmer-lesson-doc-user-profile';
const READER_KEY = 'khmer-lesson-doc-reader-id';

export const LEGACY_GUEST_OWNER_ID = 'guest';

export type UserProfile = {
  ownerId: string;
  email: string;
  name: string;
  picture: string;
};

function createLocalOwnerId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `local:${crypto.randomUUID()}`;
  }
  return `local:${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function getOwnerId(): string {
  try {
    let id = localStorage.getItem(OWNER_KEY);
    if (!id) {
      id = createLocalOwnerId();
      localStorage.setItem(OWNER_KEY, id);
    }
    return id;
  } catch {
    return LEGACY_GUEST_OWNER_ID;
  }
}

export function setOwnerId(ownerId: string) {
  localStorage.setItem(OWNER_KEY, ownerId);
}

export function getStoredProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function setStoredProfile(profile: UserProfile | null) {
  if (!profile) {
    localStorage.removeItem(PROFILE_KEY);
    return;
  }
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function getOwnerLabel(): string {
  const profile = getStoredProfile();
  if (profile?.name) return profile.name;
  const id = getOwnerId();
  if (id === LEGACY_GUEST_OWNER_ID) return 'Guest';
  if (id.startsWith('google:')) return profile?.email?.split('@')[0] || 'Google User';
  return id.startsWith('local:') ? 'You' : id.slice(0, 8);
}

export function isGoogleSignedIn(): boolean {
  return getOwnerId().startsWith('google:');
}

/** Anonymous reader id for classroom / shared quiz tracking. */
export function getReaderId(): string {
  try {
    let id = localStorage.getItem(READER_KEY);
    if (!id) {
      id = `reader:${crypto.randomUUID?.() || Date.now()}`;
      localStorage.setItem(READER_KEY, id);
    }
    return id;
  } catch {
    return `reader:${Date.now()}`;
  }
}

export function signOutToLocal() {
  const newId = createLocalOwnerId();
  setOwnerId(newId);
  setStoredProfile(null);
}

export function getGoogleClientId(): string {
  return (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env
    .VITE_GOOGLE_CLIENT_ID?.trim() || '';
}

export function isGoogleAuthConfigured(): boolean {
  return Boolean(getGoogleClientId());
}
