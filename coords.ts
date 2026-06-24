/**
 * Convert a decimal-degree value to Degrees-Decimal-Minutes (DDM) format.
 *
 * Example: 34.04 → "34°02.4′"
 *
 * @param decimalDegrees - The coordinate in decimal degrees
 * @returns A string like "34°02.4′"
 */
function toDDM(decimalDegrees: number): string {
  const absolute = Math.abs(decimalDegrees);
  const degrees = Math.floor(absolute);

  // The fractional part of the degree, converted to minutes (0–60)
  const decimalMinutes = (absolute - degrees) * 60;

  // Pad degrees to at least 1 digit, minutes to 2 digits with 1 decimal
  const minutesFormatted = decimalMinutes.toFixed(1).padStart(4, '0');

  return `${degrees}°${minutesFormatted}′`;
}

/**
 * Format a latitude value as DDM with N/S hemisphere suffix.
 *
 * Example: 34.04 → "34°02.4′N"
 */
export function formatLat(lat: number): string {
  const hemisphere = lat >= 0 ? 'N' : 'S';
  return `${toDDM(lat)}${hemisphere}`;
}

/**
 * Format a longitude value as DDM with E/W hemisphere suffix.
 *
 * Example: -119.458333 → "119°27.5′W"
 */
export function formatLng(lng: number): string {
  const hemisphere = lng >= 0 ? 'E' : 'W';
  return `${toDDM(lng)}${hemisphere}`;
}

/**
 * Format a coordinate pair as a single DDM string.
 *
 * Example: (34.04, -119.458333) → "34°02.4′N 119°27.5′W"
 */
export function formatCoords(lat: number, lng: number): string {
  return `${formatLat(lat)} ${formatLng(lng)}`;
}
