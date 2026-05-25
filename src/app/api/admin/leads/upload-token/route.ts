import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { getSession, isAdminConfigured } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// POST /api/admin/leads/upload-token
//
// Issues a short-lived Vercel Blob upload token so the client can stream an
// audio file directly to Blob storage (bypassing the 4.5 MB Next.js API body
// limit). The blob is treated as temporary: the /transcribe route deletes it
// the moment Gemini returns a transcript.
//
// Authentication: any signed-in admin/CM session can request a token. The
// token grants permission to upload one audio file; nothing else.
export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "Admin auth is not configured on this server." },
      { status: 503 },
    );
  }
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [
          "audio/mpeg",
          "audio/mp3",
          "audio/wav",
          "audio/x-wav",
          "audio/webm",
          "audio/ogg",
          "audio/mp4",
          "audio/aac",
          "audio/m4a",
          "audio/x-m4a",
        ],
        // 50 MB cap. Larger uploads would need the Gemini Files API, which we
        // haven't wired in yet; we'd rather reject fast than have transcription
        // fail later.
        maximumSizeInBytes: 50 * 1024 * 1024,
      }),
      onUploadCompleted: async () => {
        // Nothing to do server-side. The client calls /transcribe next with
        // the blob URL.
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed." },
      { status: 400 },
    );
  }
}
