export type MissionStatus = 'draft' | 'active' | 'complete';

export interface Waypoint {
  id: string;
  name: string;
  lng: number;
  lat: number;
}

/** Predefined route colors that are visible on the dark map */
export const ROUTE_COLORS = [
  { value: '#2FD8CF', label: 'Cyan' },
  { value: '#F4B73E', label: 'Amber' },
  { value: '#46C98A', label: 'Green' },
  { value: '#A78BFA', label: 'Violet' },
  { value: '#F472B6', label: 'Pink' },
  { value: '#60A5FA', label: 'Blue' },
  { value: '#FB923C', label: 'Orange' },
  { value: '#E0E0E0', label: 'White' },
] as const;

export type RouteColor = typeof ROUTE_COLORS[number]['value'];

export interface Mission {
  id: string;
  /** Display ID formatted as MSN-#### */
  code: string;
  name: string;
  status: MissionStatus;
  /** Route/marker color on the map */
  color: RouteColor;
  waypoints: Waypoint[];
  /** Epoch milliseconds of last update */
  updatedAt: number;
}
