import type { Id } from "@vicina/shared-types";

export interface SessionUser {
  id: Id;
  displayName: string;
  homeRegion?: string;
}
