import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { tags } = await req.json();
    if (tags && Array.isArray(tags)) {
      for (const tag of tags) {
        revalidateTag(tag);
      }
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 400 },
    );
  }
}
