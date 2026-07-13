import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { requireAdmin } from "@/lib/auth/require-role";

export async function GET(request: NextRequest) {
  try {
    // 1. Confirm user has authorized admin role
    await requireAdmin();

    const url = new URL(request.url);
    const folder = url.searchParams.get("folder") || "obidi-cosmetics/general";

    // Configure Cloudinary using the CLOUDINARY_URL env var
    // Cloudinary automatically picks up process.env.CLOUDINARY_URL if available
    
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    // Generate signature for secure client-side upload
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
      },
      process.env.CLOUDINARY_API_SECRET || cloudinary.config().api_secret as string
    );

    return NextResponse.json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || cloudinary.config().cloud_name as string,
      apiKey: process.env.CLOUDINARY_API_KEY || cloudinary.config().api_key as string,
    });
  } catch (error: any) {
    console.error("Cloudinary Signature Error:", error);
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
