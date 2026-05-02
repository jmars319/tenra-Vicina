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

export const SIGNAL_CATEGORIES = [
  "food-coffee",
  "music-nightlife",
  "outdoors",
  "study-work",
  "games",
  "help-favors",
  "general"
] as const;
export type SignalCategory = (typeof SIGNAL_CATEGORIES)[number];

export const SIGNAL_CATEGORY_LABELS: Record<SignalCategory, string> = {
  "food-coffee": "Food / coffee",
  "music-nightlife": "Music / nightlife",
  outdoors: "Outdoors",
  "study-work": "Study / work",
  games: "Games",
  "help-favors": "Help / favors",
  general: "General"
};

export const SIGNAL_STATUSES = ["active", "expired", "cancelled"] as const;
export type SignalStatus = (typeof SIGNAL_STATUSES)[number];

export const CONTENT_STATUSES = ["visible", "hidden", "reported"] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export const DISCOVERY_RADIUS_MILES = [1, 3, 5, 10] as const;
export type DiscoveryRadiusMiles = (typeof DISCOVERY_RADIUS_MILES)[number];

export const DEFAULT_DISCOVERY_RADIUS_MILES: DiscoveryRadiusMiles = 3;
export const DEFAULT_SIGNAL_DURATION_HOURS = 4;
export const MAX_SIGNAL_DURATION_HOURS = 24;
export const MAX_SIGNAL_DURATION_MS = MAX_SIGNAL_DURATION_HOURS * 60 * 60 * 1000;

export interface VicinaProfile {
  id: Id;
  displayName: string;
  bio?: string;
  createdAtMs: TimestampMs;
  updatedAtMs: TimestampMs;
}

export interface VicinaSignal {
  id: Id;
  authorId: Id;
  authorDisplayName: string;
  title: string;
  description: string;
  category: SignalCategory;
  approximateLocationLabel: string;
  coordinates: LatLng;
  startsAtMs: TimestampMs;
  expiresAtMs: TimestampMs;
  visibilityRadiusMiles: DiscoveryRadiusMiles;
  status: SignalStatus;
  contentStatus: ContentStatus;
  createdAtMs: TimestampMs;
  updatedAtMs: TimestampMs;
}

export interface SignalInterest {
  id: Id;
  signalId: Id;
  userId: Id;
  createdAtMs: TimestampMs;
}

export interface SignalComment {
  id: Id;
  signalId: Id;
  authorId: Id;
  authorDisplayName: string;
  body: string;
  contentStatus: ContentStatus;
  createdAtMs: TimestampMs;
  updatedAtMs: TimestampMs;
}

export interface UserBlock {
  blockerId: Id;
  blockedUserId: Id;
  createdAtMs: TimestampMs;
}

export interface SignalReport {
  id: Id;
  reporterId: Id;
  signalId?: Id;
  commentId?: Id;
  reportedUserId?: Id;
  reason: string;
  details?: string;
  status: "open" | "reviewed" | "closed";
  createdAtMs: TimestampMs;
}

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
