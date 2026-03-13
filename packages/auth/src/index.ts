import type { Id } from "@rally/shared-types";

export interface SessionUser {
  id: Id;
  displayName: string;
  homeRegion?: string;
}
