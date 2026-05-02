import {
  DEFAULT_SIGNAL_DURATION_HOURS,
  type SignalComment,
  type SignalInterest,
  type VicinaProfile,
  type VicinaSignal
} from "@vicina/domain";

export const SEED_PROFILES: VicinaProfile[] = [
  {
    id: "seed-profile-ana",
    displayName: "Ana",
    bio: "Coffee, walks, and low-pressure local plans.",
    createdAtMs: 0,
    updatedAtMs: 0
  },
  {
    id: "seed-profile-marco",
    displayName: "Marco",
    bio: "Usually around downtown with a board game in my bag.",
    createdAtMs: 0,
    updatedAtMs: 0
  },
  {
    id: "seed-profile-jules",
    displayName: "Jules",
    bio: "Study sessions and outdoor breaks.",
    createdAtMs: 0,
    updatedAtMs: 0
  }
];

export function createSeedSignals(nowMs = Date.now()): VicinaSignal[] {
  const baseStartMs = nowMs - 20 * 60 * 1000;
  const expiresAtMs = baseStartMs + DEFAULT_SIGNAL_DURATION_HOURS * 60 * 60 * 1000;

  return [
    {
      id: "seed-signal-coffee",
      authorId: "seed-profile-ana",
      authorDisplayName: "Ana",
      title: "Coffee and a quick reset",
      description: "Heading to grab coffee. Open to a short chat or co-working hour.",
      category: "food-coffee",
      approximateLocationLabel: "near Downtown",
      coordinates: { lat: 36.1, lng: -80.24 },
      startsAtMs: baseStartMs,
      expiresAtMs,
      visibilityRadiusMiles: 3,
      status: "active",
      contentStatus: "visible",
      createdAtMs: baseStartMs,
      updatedAtMs: baseStartMs
    },
    {
      id: "seed-signal-games",
      authorId: "seed-profile-marco",
      authorDisplayName: "Marco",
      title: "Casual board games tonight",
      description: "Bringing a few lightweight games. Drop in if you want a table.",
      category: "games",
      approximateLocationLabel: "near the Innovation Quarter",
      coordinates: { lat: 36.1, lng: -80.25 },
      startsAtMs: nowMs + 45 * 60 * 1000,
      expiresAtMs: nowMs + 5 * 60 * 60 * 1000,
      visibilityRadiusMiles: 5,
      status: "active",
      contentStatus: "visible",
      createdAtMs: nowMs - 10 * 60 * 1000,
      updatedAtMs: nowMs - 10 * 60 * 1000
    },
    {
      id: "seed-signal-outdoors",
      authorId: "seed-profile-jules",
      authorDisplayName: "Jules",
      title: "Walk before the next work block",
      description: "Planning a relaxed loop outside. Good for a screen break.",
      category: "outdoors",
      approximateLocationLabel: "near Bailey Park",
      coordinates: { lat: 36.1, lng: -80.24 },
      startsAtMs: nowMs + 20 * 60 * 1000,
      expiresAtMs: nowMs + 2 * 60 * 60 * 1000,
      visibilityRadiusMiles: 1,
      status: "active",
      contentStatus: "visible",
      createdAtMs: nowMs - 4 * 60 * 1000,
      updatedAtMs: nowMs - 4 * 60 * 1000
    }
  ];
}

export function createSeedInterests(nowMs = Date.now()): SignalInterest[] {
  return [
    {
      id: "seed-interest-1",
      signalId: "seed-signal-coffee",
      userId: "seed-profile-marco",
      createdAtMs: nowMs - 8 * 60 * 1000
    },
    {
      id: "seed-interest-2",
      signalId: "seed-signal-games",
      userId: "seed-profile-ana",
      createdAtMs: nowMs - 3 * 60 * 1000
    }
  ];
}

export function createSeedComments(nowMs = Date.now()): SignalComment[] {
  return [
    {
      id: "seed-comment-1",
      signalId: "seed-signal-coffee",
      authorId: "seed-profile-marco",
      authorDisplayName: "Marco",
      body: "I can swing by for 20 minutes.",
      contentStatus: "visible",
      createdAtMs: nowMs - 6 * 60 * 1000,
      updatedAtMs: nowMs - 6 * 60 * 1000
    }
  ];
}
