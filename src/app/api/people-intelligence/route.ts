import { NextResponse } from "next/server";
import peopleIntelligence from "../../../../data/processed/people-intelligence.json";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(peopleIntelligence);
}
