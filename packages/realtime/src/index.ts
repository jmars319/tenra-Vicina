import type { MeetupStatus } from "@vicina/domain";
import type { Id, TimestampMs } from "@vicina/shared-types";

export interface MeetupEvent {
  meetupId: Id;
  type: "meetup-created" | "presence-updated" | "status-changed";
  status: MeetupStatus;
  emittedAtMs: TimestampMs;
}
