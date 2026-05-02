import { CHECK_IN_INTENTS, PILOT_VENUES, VISIBILITY_MODES } from "@vicina/domain";
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

const venueIds = PILOT_VENUES.map((venue) => venue.id);

const userIdentitySchema = z.object({
  userId: z.string().trim().min(3).max(120),
  displayName: z.string().trim().min(1).max(60)
});

export const upsertCheckInRequestSchema = userIdentitySchema.extend({
  venueId: z.string().trim().refine((value) => venueIds.includes(value), {
    message: "Unknown venueId"
  }),
  note: z.string().trim().max(140).optional(),
  intent: z.enum(CHECK_IN_INTENTS)
});

export const deleteCheckInRequestSchema = z.object({
  userId: z.string().trim().min(3).max(120)
});

export const createVenueMessageRequestSchema = userIdentitySchema.extend({
  venueId: z.string().trim().refine((value) => venueIds.includes(value), {
    message: "Unknown venueId"
  }),
  body: z.string().trim().min(1).max(280)
});

export type ParsedUpsertCheckInRequest = z.infer<typeof upsertCheckInRequestSchema>;
export type ParsedDeleteCheckInRequest = z.infer<typeof deleteCheckInRequestSchema>;
export type ParsedCreateVenueMessageRequest = z.infer<
  typeof createVenueMessageRequestSchema
>;
