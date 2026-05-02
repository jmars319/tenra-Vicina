import type { LatLng } from "@vicina/shared-types";

export function coarseLocation(point: LatLng, precision = 2): LatLng {
  return {
    lat: Number(point.lat.toFixed(precision)),
    lng: Number(point.lng.toFixed(precision))
  };
}
