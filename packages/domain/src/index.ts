import type { Id } from "@rally/shared-types";

export const MEETUP_STATUSES = ["draft", "scheduled", "live", "ended"] as const;
export type MeetupStatus = (typeof MEETUP_STATUSES)[number];

export const VISIBILITY_MODES = [
  "invite-only",
  "local-area",
  "public"
] as const;
export type VisibilityMode = (typeof VISIBILITY_MODES)[number];

export interface PilotVenue {
  id: Id;
  name: string;
  address: string;
  type: string;
  neighborhood: string;
}

export const PILOT_VENUES: PilotVenue[] = [
  {
    id: "krankies-factory",
    name: "Krankies Coffee",
    address: "211 E 3rd St (Factory)",
    type: "Coffee Shop",
    neighborhood: "Innovation Quarter"
  },
  {
    id: "footnote",
    name: "Footnote",
    address: "416 N Spruce St",
    type: "Bar",
    neighborhood: "Innovation Quarter"
  },
  {
    id: "camino-bakery",
    name: "Camino Bakery",
    address: "1314 N Patterson Ave",
    type: "Bakery / Coffee",
    neighborhood: "Innovation Quarter"
  },
  {
    id: "incendiary",
    name: "Incendiary Brewing",
    address: "560 N Patterson Ave",
    type: "Brewery",
    neighborhood: "Innovation Quarter"
  },
  {
    id: "innovation-quarter-park",
    name: "Innovation Quarter Park",
    address: "Corner of N Patterson & 5th St",
    type: "Outdoor Space",
    neighborhood: "Innovation Quarter"
  }
];

export function isCheckInEligible(status: MeetupStatus): boolean {
  return status === "scheduled" || status === "live";
}
