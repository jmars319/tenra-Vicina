import type { MeetupStatus } from "@rally/domain";
import type { Id, TimestampMs } from "@rally/shared-types";

export interface MeetupEvent {
  meetupId: Id;
  type: "meetup-created" | "presence-updated" | "status-changed";
  status: MeetupStatus;
  emittedAtMs: TimestampMs;
}
