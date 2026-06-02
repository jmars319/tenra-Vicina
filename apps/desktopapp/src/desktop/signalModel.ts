import {
  DEFAULT_DISCOVERY_RADIUS_MILES,
  DEFAULT_SIGNAL_DURATION_HOURS,
  type SignalStatus,
  type VicinaProfile
} from "@vicina/domain";
import { areaOptions, defaultAreaId } from "./data";
import type { BrowseArea, LatLng, LocalProfileDraft, SignalFilters, SignalRecord, VicinaDesktopBoard } from "./types";

export function profileDraftFromProfile(profile: VicinaProfile): LocalProfileDraft {
  return {
    bio: profile.bio ?? "",
    displayName: profile.displayName
  };
}

export function parseBoardImport(input: unknown): VicinaDesktopBoard {
  if (!input || typeof input !== "object") {
    throw new Error("Vicina board JSON must be an object.");
  }

  const candidate = input as Partial<VicinaDesktopBoard>;
  const signals = Array.isArray(candidate.signals) ? candidate.signals : null;

  if (!signals || !signals.every(isSignalRecord)) {
    throw new Error("Vicina board JSON must contain signal records.");
  }

  const board: VicinaDesktopBoard = {
    blockedAuthorIds: Array.isArray(candidate.blockedAuthorIds)
      ? candidate.blockedAuthorIds.filter((id): id is string => typeof id === "string")
      : [],
    reportedSignalIds: Array.isArray(candidate.reportedSignalIds)
      ? candidate.reportedSignalIds.filter((id): id is string => typeof id === "string")
      : [],
    signals
  };

  if (isVicinaProfile(candidate.localProfile)) {
    board.localProfile = candidate.localProfile;
  }

  return board;
}

export function findArea(areaId: string): BrowseArea {
  const fallbackArea = areaOptions[0];
  if (!fallbackArea) {
    throw new Error("At least one Vicina browse area is required.");
  }

  return areaOptions.find((area) => area.id === areaId) ?? fallbackArea;
}

export function findClosestAreaId(coordinates: LatLng): string {
  return areaOptions
    .map((area) => ({
      area,
      distance: distanceMiles(area.coordinates, coordinates)
    }))
    .sort((a, b) => a.distance - b.distance)[0]?.area.id ?? defaultAreaId;
}

export function getMapPosition(signal: SignalRecord, origin: LatLng): { x: number; y: number } {
  const lngDelta = signal.coordinates.lng - origin.lng;
  const latDelta = signal.coordinates.lat - origin.lat;

  return {
    x: clamp(50 + lngDelta * 900, 8, 92),
    y: clamp(50 - latDelta * 1100, 8, 92)
  };
}

export function filterSignals(
  signals: SignalRecord[],
  filters: SignalFilters,
  origin: LatLng,
  nowMs = Date.now()
): SignalRecord[] {
  return signals
    .filter((signal) => signal.status === "active" && signal.contentStatus === "visible")
    .filter((signal) => signal.expiresAtMs > nowMs)
    .filter((signal) => filters.category === "all" || signal.category === filters.category)
    .filter((signal) => {
      const publicRadius = Math.min(filters.radiusMiles, signal.visibilityRadiusMiles);
      return distanceMiles(origin, signal.coordinates) <= publicRadius;
    })
    .filter((signal) => {
      if (filters.time === "all") {
        return true;
      }

      if (filters.time === "now") {
        return signal.startsAtMs <= nowMs;
      }

      return signal.startsAtMs <= nowMs + 12 * 60 * 60 * 1000;
    })
    .sort((a, b) => {
      if (filters.sort === "newest") {
        return b.createdAtMs - a.createdAtMs;
      }

      if (filters.sort === "soonest") {
        return a.startsAtMs - b.startsAtMs;
      }

      return distanceMiles(origin, a.coordinates) - distanceMiles(origin, b.coordinates);
    });
}

export function seedSignals(nowMs: number): SignalRecord[] {
  const baseStartMs = nowMs - 18 * 60 * 1000;
  const baseExpiresMs = baseStartMs + DEFAULT_SIGNAL_DURATION_HOURS * 60 * 60 * 1000;

  return [
    makeSignal({
      id: "seed-coffee",
      authorDisplayName: "Ana",
      title: "Coffee and a quick reset",
      description: "Open table for a short chat or co-working hour before the next block.",
      category: "food-coffee",
      approximateLocationLabel: "near Downtown Winston-Salem",
      coordinates: { lat: 36.1, lng: -80.24 },
      startsAtMs: baseStartMs,
      expiresAtMs: baseExpiresMs,
      interestedUserIds: ["seed-marco", "seed-jules"],
      comments: [
        {
          id: "comment-coffee-1",
          signalId: "seed-coffee",
          authorId: "seed-marco",
          authorDisplayName: "Marco",
          body: "I can stop by for 20 minutes.",
          contentStatus: "visible",
          createdAtMs: nowMs - 7 * 60 * 1000,
          updatedAtMs: nowMs - 7 * 60 * 1000
        }
      ]
    }),
    makeSignal({
      id: "seed-games",
      authorDisplayName: "Marco",
      title: "Casual board games tonight",
      description: "Bringing two lightweight games. Drop in if you want a low-key table.",
      category: "games",
      approximateLocationLabel: "near the Innovation Quarter",
      coordinates: { lat: 36.102, lng: -80.246 },
      startsAtMs: nowMs + 42 * 60 * 1000,
      expiresAtMs: nowMs + 5 * 60 * 60 * 1000,
      visibilityRadiusMiles: 5,
      interestedUserIds: ["seed-ana"]
    }),
    makeSignal({
      id: "seed-walk",
      authorDisplayName: "Jules",
      title: "Walk before the next work block",
      description: "Relaxed loop outside. Good for a quick screen break.",
      category: "outdoors",
      approximateLocationLabel: "near Bailey Park",
      coordinates: { lat: 36.099, lng: -80.238 },
      startsAtMs: nowMs + 24 * 60 * 1000,
      expiresAtMs: nowMs + 2 * 60 * 60 * 1000,
      visibilityRadiusMiles: 3
    }),
    makeSignal({
      id: "seed-study",
      authorDisplayName: "Nina",
      title: "Quiet study block",
      description: "A focused hour with room for one or two people.",
      category: "study-work",
      approximateLocationLabel: "near West End",
      coordinates: { lat: 36.095, lng: -80.255 },
      startsAtMs: nowMs + 90 * 60 * 1000,
      expiresAtMs: nowMs + 4 * 60 * 60 * 1000,
      visibilityRadiusMiles: 5
    }),
    makeSignal({
      id: "seed-greensboro",
      authorDisplayName: "Sam",
      title: "Lunch walk downtown",
      description: "Grabbing something quick and walking a few blocks if anyone wants company.",
      category: "food-coffee",
      approximateLocationLabel: "near Downtown Greensboro",
      coordinates: { lat: 36.0726, lng: -79.792 },
      startsAtMs: nowMs + 35 * 60 * 1000,
      expiresAtMs: nowMs + 3 * 60 * 60 * 1000,
      visibilityRadiusMiles: 3
    }),
    makeSignal({
      id: "seed-raleigh",
      authorDisplayName: "Mika",
      title: "Low-key live set",
      description: "Heading over early and open to meeting before the first act starts.",
      category: "music-nightlife",
      approximateLocationLabel: "near Downtown Raleigh",
      coordinates: { lat: 35.7796, lng: -78.6382 },
      startsAtMs: nowMs + 2 * 60 * 60 * 1000,
      expiresAtMs: nowMs + 6 * 60 * 60 * 1000,
      visibilityRadiusMiles: 5
    })
  ];
}

export function makeSignal(
  input: Partial<SignalRecord> &
    Pick<
      SignalRecord,
      | "approximateLocationLabel"
      | "authorDisplayName"
      | "category"
      | "coordinates"
      | "description"
      | "expiresAtMs"
      | "id"
      | "startsAtMs"
      | "title"
    >
): SignalRecord {
  const createdAtMs = input.createdAtMs ?? input.startsAtMs - 15 * 60 * 1000;

  return {
    authorId: input.authorId ?? `profile-${input.authorDisplayName.toLowerCase()}`,
    authorDisplayName: input.authorDisplayName,
    category: input.category,
    comments: input.comments ?? [],
    contentStatus: input.contentStatus ?? "visible",
    coordinates: input.coordinates,
    createdAtMs,
    description: input.description,
    expiresAtMs: input.expiresAtMs,
    id: input.id,
    interestedUserIds: input.interestedUserIds ?? [],
    status: (input.status ?? "active") as SignalStatus,
    title: input.title,
    approximateLocationLabel: input.approximateLocationLabel,
    startsAtMs: input.startsAtMs,
    updatedAtMs: input.updatedAtMs ?? createdAtMs,
    visibilityRadiusMiles: input.visibilityRadiusMiles ?? DEFAULT_DISCOVERY_RADIUS_MILES
  };
}

export function replaceSignal(signals: SignalRecord[], nextSignal: SignalRecord): SignalRecord[] {
  return signals.map((signal) => (signal.id === nextSignal.id ? nextSignal : signal));
}

export function expireSignal(signal: SignalRecord, nowMs: number): SignalRecord {
  if (signal.expiresAtMs > nowMs || signal.status !== "active") {
    return signal;
  }

  return { ...signal, status: "expired" };
}

export function getDistanceLabel(signal: SignalRecord, origin: LatLng): string {
  const miles = distanceMiles(origin, signal.coordinates);
  if (miles < 0.5) {
    return "within 1 mile";
  }

  const roundedMiles = Math.max(1, Math.round(miles));
  return `within ${roundedMiles} ${roundedMiles === 1 ? "mile" : "miles"}`;
}

export function formatRelativeStart(startsAtMs: number, nowMs = Date.now()): string {
  const deltaMinutes = Math.round((startsAtMs - nowMs) / 60000);

  if (deltaMinutes <= -5) {
    return "live";
  }

  if (deltaMinutes <= 5) {
    return "starting now";
  }

  if (deltaMinutes < 60) {
    return `in ${deltaMinutes} min`;
  }

  const hours = Math.round(deltaMinutes / 60);
  return `in ${hours} hr`;
}

export function formatSignalWindow(startsAtMs: number, expiresAtMs: number): string {
  const starts = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit"
  }).format(startsAtMs);
  const expires = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit"
  }).format(expiresAtMs);

  return `${starts} to ${expires}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function isSignalRecord(value: unknown): value is SignalRecord {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<SignalRecord>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.authorId === "string" &&
    typeof candidate.authorDisplayName === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.description === "string" &&
    Array.isArray(candidate.comments) &&
    Array.isArray(candidate.interestedUserIds)
  );
}

function isVicinaProfile(value: unknown): value is VicinaProfile {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<VicinaProfile>;

  return typeof candidate.id === "string" && typeof candidate.displayName === "string";
}

function distanceMiles(from: LatLng, to: LatLng): number {
  const earthRadiusMiles = 3958.8;
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);
  const deltaLat = toRadians(to.lat - from.lat);
  const deltaLng = toRadians(to.lng - from.lng);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusMiles * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
