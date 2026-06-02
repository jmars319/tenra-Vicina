import {
  DEFAULT_DISCOVERY_RADIUS_MILES,
  DEFAULT_SIGNAL_DURATION_HOURS,
  SIGNAL_CATEGORIES,
  SIGNAL_CATEGORY_LABELS,
  type VicinaProfile
} from "@vicina/domain";
import type { BrowseArea, CategoryFilter, DraftSignal, SignalFilters, SignalSort, TimeFilter } from "./types";

export const defaultLocalProfile: VicinaProfile = {
  id: "desktop-user-local",
  displayName: "Local operator",
  bio: "Local Vicina desktop profile.",
  createdAtMs: 0,
  updatedAtMs: 0
};

export const areaOptions: BrowseArea[] = [
  {
    id: "downtown-winston-salem",
    label: "Downtown Winston-Salem",
    approximateLocationLabel: "near Downtown Winston-Salem",
    coordinates: { lat: 36.1, lng: -80.24 }
  },
  {
    id: "innovation-quarter",
    label: "Innovation Quarter",
    approximateLocationLabel: "near the Innovation Quarter",
    coordinates: { lat: 36.102, lng: -80.246 }
  },
  {
    id: "west-end",
    label: "West End",
    approximateLocationLabel: "near West End",
    coordinates: { lat: 36.095, lng: -80.255 }
  },
  {
    id: "downtown-greensboro",
    label: "Downtown Greensboro",
    approximateLocationLabel: "near Downtown Greensboro",
    coordinates: { lat: 36.0726, lng: -79.792 }
  },
  {
    id: "downtown-raleigh",
    label: "Downtown Raleigh",
    approximateLocationLabel: "near Downtown Raleigh",
    coordinates: { lat: 35.7796, lng: -78.6382 }
  }
];

export const defaultAreaId = "downtown-winston-salem";
export const legacySignalStorageKey = "vicina.desktop.signals.v1";
export const storageKey = "vicina.desktop.board.v2";

export const categoryOptions: Array<{ label: string; value: CategoryFilter }> = [
  { label: "All", value: "all" },
  ...SIGNAL_CATEGORIES.map((category) => ({
    label: SIGNAL_CATEGORY_LABELS[category],
    value: category
  }))
];

export const timeOptions: Array<{ label: string; value: TimeFilter }> = [
  { label: "Now", value: "now" },
  { label: "Today", value: "today" },
  { label: "Any active", value: "all" }
];

export const sortOptions: Array<{ label: string; value: SignalSort }> = [
  { label: "Nearest", value: "nearest" },
  { label: "Soonest", value: "soonest" },
  { label: "Newest", value: "newest" }
];

export const defaultFilters: SignalFilters = {
  areaId: defaultAreaId,
  category: "all",
  radiusMiles: DEFAULT_DISCOVERY_RADIUS_MILES,
  sort: "nearest",
  time: "now"
};

export const defaultDraft: DraftSignal = {
  areaId: defaultAreaId,
  category: "food-coffee",
  description: "",
  durationHours: String(DEFAULT_SIGNAL_DURATION_HOURS),
  radiusMiles: DEFAULT_DISCOVERY_RADIUS_MILES,
  title: ""
};
