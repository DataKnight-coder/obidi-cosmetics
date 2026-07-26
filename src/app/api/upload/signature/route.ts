import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { error: "This upload method has been replaced. Refresh the product form and try again." },
    { status: 410 },
  );
}
