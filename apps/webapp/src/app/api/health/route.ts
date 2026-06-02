import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    app: "Vicina by Tenra",
    ok: true
  });
}
