import type { Mission } from './types';

const STORAGE_KEY = 'mission-planner:missions';

/**
 * Safely read missions from localStorage.
 * Returns an empty array if the data is missing, corrupt, or unparseable.
 */
export function loadMissions(): Mission[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);

    // Basic validation: must be an array
    if (!Array.isArray(parsed)) return [];

    // Backfill color for missions saved before the color feature was added
    const missions = (parsed as Mission[]).map(m => ({
      ...m,
      color: m.color ?? '#2FD8CF',
    }));

    return missions;
  } catch {
    console.warn('Failed to parse missions from localStorage — returning empty list.');
    return [];
  }
}

/**
 * Write the full missions array to localStorage.
 */
export function saveMissions(missions: Mission[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(missions));
  } catch (error) {
    console.error('Failed to save missions to localStorage:', error);
  }
}

/**
 * Generate a mission code like MSN-4471 (random 4-digit number).
 */
export function generateMissionCode(): string {
  const number = Math.floor(1000 + Math.random() * 9000);
  return `MSN-${number}`;
}
