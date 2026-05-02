import type { LatLng } from "@vicina/shared-types";

export const DEFAULT_COORDINATES: LatLng = {
  lat: 36.1,
  lng: -80.24
};

export function approximateCoordinates(coordinates: LatLng): LatLng {
  return {
    lat: roundToHundredth(coordinates.lat),
    lng: roundToHundredth(coordinates.lng)
  };
}

export function distanceMiles(from: LatLng, to: LatLng): number {
  const earthRadiusMiles = 3958.8;
  const dLat = degreesToRadians(to.lat - from.lat);
  const dLng = degreesToRadians(to.lng - from.lng);
  const lat1 = degreesToRadians(from.lat);
  const lat2 = degreesToRadians(to.lat);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusMiles * c;
}

export function isWithinRadius(
  signalCoordinates: LatLng,
  userCoordinates: LatLng | null,
  radiusMiles: number
): boolean {
  if (!userCoordinates) {
    return true;
  }

  return distanceMiles(signalCoordinates, userCoordinates) <= radiusMiles;
}

function degreesToRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function roundToHundredth(value: number): number {
  return Math.round(value * 100) / 100;
}
