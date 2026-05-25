import { NextResponse } from "next/server";
import { del } from "@vercel/blob";

import { getSession, isAdminConfigured } from "@/lib/admin-auth";
import { isDbConfigured } from "@/lib/db";
import { getLeadById, updateLead, updateLeadTranscript } from "@/lib/lead-store";
import { transcribeAudio } from "@/lib/transcribe";

export const dynamic = "force-dynamic";

function normalizeName(name: string | undefined | null): string {
  return (name ?? "").trim().toLowerCase();
}
function firstWord(name: string | undefined | null): string {
  return normalizeName(name).split(/\s+/)[0] ?? "";
}

type TranscribeBody = {
  id?: string;
  source?: "url" | "blob";
  url?: string;
  blob_url?: string;
};

// POST /api/admin/leads/transcribe
//   { id, source: "url", url }      -> fetch audio from URL, transcribe, save
//   { id, source: "blob", blob_url } -> fetch audio from Vercel Blob, transcribe,
//                                       save, then delete the blob
//
// We never persist the audio. Only the transcript is stored in Postgres.
export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "Admin auth is not configured on this server." },
      { status: 503 },
    );
  }
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: "Database not configured. Set POSTGRES_URL." },
      { status: 503 },
    );
  }

  let body: TranscribeBody;
  try {
    body = (await request.json()) as TranscribeBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const id = body.id?.trim();
  if (!id) {
    return NextResponse.json({ error: "Missing lead id." }, { status: 400 });
  }

  const lead = await getLeadById(id);
  if (!lead) {
    return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  }

  // Per-CM scoping: same rule as the leads list and the brief route.
  if (session.role === "cm") {
    const cm = normalizeName(lead.care_manager);
    const mineFull = normalizeName(session.name);
    const mineFirst = firstWord(session.name);
    const isMine =
      !cm ||
      cm === "unassigned" ||
      cm === mineFull ||
      cm === mineFirst ||
      firstWord(cm) === mineFirst;
    if (!isMine) {
      return NextResponse.json(
        { error: "This lead is assigned to another care manager." },
        { status: 403 },
      );
    }
  }

  // Resolve the audio source.
  let audioUrl: string;
  const isBlob = body.source === "blob";
  if (isBlob) {
    if (!body.blob_url || typeof body.blob_url !== "string") {
      return NextResponse.json(
        { error: "blob_url is required when source is 'blob'." },
        { status: 400 },
      );
    }
    audioUrl = body.blob_url;
  } else {
    const url = body.url || lead.call_recording_url;
    if (!url) {
      return NextResponse.json(
        { error: "No recording URL provided and none saved on this lead." },
        { status: 400 },
      );
    }
    audioUrl = url;
  }

  // Run the transcription. If it fails, do not delete the blob (so the CM
  // can retry without losing the upload).
  let transcript: string;
  try {
    transcript = await transcribeAudio({ type: "url", url: audioUrl });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[leads/transcribe] failed", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Transcription failed. Please try again.",
      },
      { status: 502 },
    );
  }

  // Save the transcript. For URL-based recordings, also persist the URL so the
  // CM can replay later from the dashboard.
  await updateLeadTranscript(id, transcript);
  if (!isBlob && body.url && body.url !== lead.call_recording_url) {
    await updateLead({
      id,
      call_recording_url: body.url,
      updated_by: session.email,
    });
  }

  // Now that transcription succeeded, delete the uploaded blob. We never
  // keep the audio bytes on our side. If the delete fails we log it and
  // move on (the transcript still saved successfully).
  if (isBlob) {
    try {
      await del(audioUrl);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("[leads/transcribe] failed to delete blob", err);
    }
  }

  return NextResponse.json({
    ok: true,
    transcript,
    transcript_at: new Date().toISOString(),
  });
}
