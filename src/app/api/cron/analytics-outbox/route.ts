import { NextResponse } from "next/server";
import { processAnalyticsOutbox } from "@/lib/analytics/measurement-protocol";

// To be called via a cron job (e.g. Vercel Cron, Cloudflare Scheduled Workers)
export async function GET(request: Request) {
  // Add authentication check for cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === "production") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const result = await processAnalyticsOutbox();

  return NextResponse.json(result);
}
