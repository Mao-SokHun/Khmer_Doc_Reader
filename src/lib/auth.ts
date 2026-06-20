/** Free app — no login. Each browser keeps a private workspace id in localStorage. */
const OWNER_KEY = 'khmer-lesson-doc-owner-id';

export const LEGACY_GUEST_OWNER_ID = 'guest';

function createLocalOwnerId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `local:${crypto.randomUUID()}`;
  }
  return `local:${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/** Stable owner id for this browser — lessons + version history stay tied to this device. */
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

/** Short label for version history UI (no login email available). */
export function getOwnerLabel(): string {
  const id = getOwnerId();
  if (id === LEGACY_GUEST_OWNER_ID) return 'Guest';
  return id.startsWith('local:') ? 'You' : id.slice(0, 8);
}
