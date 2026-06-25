import type { Waypoint } from './types';

const EARTH_RADIUS_NM = 3440.065;

/** Great-circle distance between two points in nautical miles (haversine). */
export function haversineNm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const toRad = (deg: number) => deg * (Math.PI / 180);
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h = sinLat * sinLat + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng;
  return 2 * EARTH_RADIUS_NM * Math.asin(Math.sqrt(h));
}

/** Total distance along the ordered waypoints in nautical miles. Returns 0 for < 2 waypoints. */
export function routeDistanceNm(waypoints: Waypoint[]): number {
  let total = 0;
  for (let i = 1; i < waypoints.length; i++) {
    total += haversineNm(waypoints[i - 1], waypoints[i]);
  }
  return total;
}

/** Format a distance as e.g. "47.2 nm" (one decimal place). */
export function formatNm(nm: number): string {
  return `${nm.toFixed(1)} nm`;
}
