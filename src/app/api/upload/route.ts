import { NextResponse } from "next/server";

export async function POST() {
  // TODO Week 2: handle multipart upload to GCS media bucket with auth guard.
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
