import type {
  CheckInIntent,
  PilotVenue,
  VicinaCheckIn,
  VenueMessage,
  VisibilityMode
} from "@vicina/domain";
import type { Id, LatLng, TimestampMs } from "@vicina/shared-types";

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

export interface VicinaVenueState extends PilotVenue {
  activeCheckIns: VicinaCheckIn[];
  messages: VenueMessage[];
}

export interface VicinaStateResponse {
  serverNowMs: TimestampMs;
  venues: VicinaVenueState[];
}

export interface UpsertCheckInRequest {
  venueId: Id;
  userId: Id;
  displayName: string;
  note?: string;
  intent: CheckInIntent;
}

export interface UpsertCheckInResponse {
  checkIn: VicinaCheckIn;
}

export interface DeleteCheckInRequest {
  userId: Id;
}

export interface DeleteCheckInResponse {
  removed: boolean;
}

export interface CreateVenueMessageRequest {
  venueId: Id;
  userId: Id;
  displayName: string;
  body: string;
}

export interface CreateVenueMessageResponse {
  message: VenueMessage;
}
