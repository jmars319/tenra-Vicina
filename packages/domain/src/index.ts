import type { Id, LatLng, TimestampMs } from "@vicina/shared-types";

export const MEETUP_STATUSES = ["draft", "scheduled", "live", "ended"] as const;
export type MeetupStatus = (typeof MEETUP_STATUSES)[number];

export const VISIBILITY_MODES = [
  "invite-only",
  "local-area",
  "public"
] as const;
export type VisibilityMode = (typeof VISIBILITY_MODES)[number];

export const CHECK_IN_INTENTS = [
  "available",
  "open-to-chat",
  "looking-for-group"
] as const;
export type CheckInIntent = (typeof CHECK_IN_INTENTS)[number];

export const CHECK_IN_DURATION_MINUTES = 90;
export const CHECK_IN_DURATION_MS = CHECK_IN_DURATION_MINUTES * 60 * 1000;

export interface PilotVenue {
  id: Id;
  name: string;
  address: string;
  type: string;
  neighborhood: string;
  coordinates: LatLng;
  summary: string;
}

export const PILOT_VENUES: PilotVenue[] = [
  {
    id: "krankies-factory",
    name: "Krankies Coffee",
    address: "211 E 3rd St (Factory)",
    type: "Coffee Shop",
    neighborhood: "Innovation Quarter",
    coordinates: { lat: 36.0985, lng: -80.2408 },
    summary: "Reliable daytime anchor for low-friction coffee meetups."
  },
  {
    id: "footnote",
    name: "Footnote",
    address: "416 N Spruce St",
    type: "Bar",
    neighborhood: "Innovation Quarter",
    coordinates: { lat: 36.1004, lng: -80.2477 },
    summary: "Good evening landing spot with casual tables and a steady crowd."
  },
  {
    id: "camino-bakery",
    name: "Camino Bakery",
    address: "1314 N Patterson Ave",
    type: "Bakery / Coffee",
    neighborhood: "Innovation Quarter",
    coordinates: { lat: 36.111, lng: -80.2414 },
    summary: "Easy daytime option for quick chats, pastries, and remote work."
  },
  {
    id: "incendiary",
    name: "Incendiary Brewing",
    address: "560 N Patterson Ave",
    type: "Brewery",
    neighborhood: "Innovation Quarter",
    coordinates: { lat: 36.1024, lng: -80.2417 },
    summary: "Large-format meetup venue for after-work groups and loose plans."
  },
  {
    id: "innovation-quarter-park",
    name: "Innovation Quarter Park",
    address: "Corner of N Patterson & 5th St",
    type: "Outdoor Space",
    neighborhood: "Innovation Quarter",
    coordinates: { lat: 36.1019, lng: -80.2398 },
    summary: "Open-air fallback for walks, quick hellos, and casual hangs."
  }
];

export interface VicinaCheckIn {
  id: Id;
  venueId: Id;
  userId: Id;
  displayName: string;
  note?: string;
  intent: CheckInIntent;
  createdAtMs: TimestampMs;
  expiresAtMs: TimestampMs;
}

export interface VenueMessage {
  id: Id;
  venueId: Id;
  userId: Id;
  displayName: string;
  body: string;
  createdAtMs: TimestampMs;
}

export function createCheckInExpiry(nowMs: TimestampMs): TimestampMs {
  return nowMs + CHECK_IN_DURATION_MS;
}

export function isCheckInActive(
  checkIn: Pick<VicinaCheckIn, "expiresAtMs">,
  nowMs: TimestampMs
): boolean {
  return checkIn.expiresAtMs > nowMs;
}

export function findPilotVenue(venueId: Id): PilotVenue | undefined {
  return PILOT_VENUES.find((venue) => venue.id === venueId);
}

export function isCheckInEligible(status: MeetupStatus): boolean {
  return status === "scheduled" || status === "live";
}
