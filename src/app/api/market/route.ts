import { NextResponse } from "next/server";
import marketData from "../../../../data/processed/benchmark.json";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json({
    metadata: marketData.metadata,
    latest: marketData.latest,
    periods: marketData.periods,
    quality: marketData.quality,
  });
}
