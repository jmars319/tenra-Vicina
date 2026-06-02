import type {
  DiscoveryRadiusMiles,
  SignalCategory,
  SignalComment,
  VicinaProfile,
  VicinaSignal
} from "@vicina/domain";

export type CategoryFilter = SignalCategory | "all";
export type SignalSort = "nearest" | "soonest" | "newest";
export type TimeFilter = "now" | "today" | "all";
export type SignalViewMode = "list" | "map";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface BrowseArea {
  id: string;
  label: string;
  approximateLocationLabel: string;
  coordinates: LatLng;
}

export interface SignalRecord extends VicinaSignal {
  comments: SignalComment[];
  interestedUserIds: string[];
}

export interface SignalFilters {
  areaId: string;
  category: CategoryFilter;
  radiusMiles: DiscoveryRadiusMiles;
  sort: SignalSort;
  time: TimeFilter;
}

export interface DraftSignal {
  areaId: string;
  category: SignalCategory;
  description: string;
  durationHours: string;
  radiusMiles: DiscoveryRadiusMiles;
  title: string;
}

export interface LocalProfileDraft {
  bio: string;
  displayName: string;
}

export interface VicinaDesktopBoard {
  blockedAuthorIds: string[];
  localProfile?: VicinaProfile;
  reportedSignalIds: string[];
  signals: SignalRecord[];
}

export interface VicinaBoardExport extends VicinaDesktopBoard {
  exportedAtMs: number;
  schema: "vicina-desktop-board:v1";
}
