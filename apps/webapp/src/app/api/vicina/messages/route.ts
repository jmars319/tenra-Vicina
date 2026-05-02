import { NextResponse } from "next/server";
import { createVenueMessageRequestSchema } from "@vicina/validation";
import { createVenueMessage } from "@/lib/vicina-store";

export async function POST(request: Request) {
  const parsed = createVenueMessageRequestSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid message request", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  return NextResponse.json(await createVenueMessage(parsed.data), { status: 201 });
}
