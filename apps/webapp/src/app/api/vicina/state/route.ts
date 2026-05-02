import { NextResponse } from "next/server";
import { getVicinaState } from "@/lib/vicina-store";

export async function GET() {
  return NextResponse.json(await getVicinaState());
}
