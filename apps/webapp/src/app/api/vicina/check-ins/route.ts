import { NextResponse } from "next/server";
import {
  deleteCheckInRequestSchema,
  upsertCheckInRequestSchema
} from "@vicina/validation";
import { deleteCheckIn, upsertCheckIn } from "@/lib/vicina-store";

export async function POST(request: Request) {
  const parsed = upsertCheckInRequestSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid check-in request", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  return NextResponse.json(await upsertCheckIn(parsed.data), { status: 201 });
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const parsed = deleteCheckInRequestSchema.safeParse({
    userId: url.searchParams.get("userId")
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid delete check-in request", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  return NextResponse.json(await deleteCheckIn(parsed.data));
}
