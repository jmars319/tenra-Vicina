import type { VisibilityMode } from "@rally/domain";
import type { Id, LatLng, TimestampMs } from "@rally/shared-types";

export interface CreateMeetupRequest {
  title: string;
  description?: string;
  venueId?: Id;
  anchorLocation?: LatLng;
  visibility: VisibilityMode;
  scheduledForMs: TimestampMs;
}

export interface CreateMeetupResponse {
  meetupId: Id;
  status: "accepted";
}
