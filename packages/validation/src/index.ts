import { VISIBILITY_MODES } from "@rally/domain";
import { z } from "zod";

export const latLngSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180)
});

export const createMeetupRequestSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().max(500).optional(),
  venueId: z.string().trim().min(1).optional(),
  anchorLocation: latLngSchema.optional(),
  visibility: z.enum(VISIBILITY_MODES),
  scheduledForMs: z.number().int().nonnegative()
});

export type ParsedCreateMeetupRequest = z.infer<typeof createMeetupRequestSchema>;

export function parseCreateMeetupRequest(input: unknown): ParsedCreateMeetupRequest {
  return createMeetupRequestSchema.parse(input);
}
