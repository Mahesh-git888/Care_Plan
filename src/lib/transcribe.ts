// Call recording transcription via Gemini Flash.
//
// Gemini handles audio natively (multimodal), so there is no separate
// transcription service. We hand it the audio bytes and ask for a clean
// transcript with speaker labels. The audio itself is never persisted by
// us; only the resulting transcript is saved to Postgres.
//
// Server-side only. Reads GEMINI_API_KEY (same key as the pre-call brief).

import { GoogleGenAI } from "@google/genai";

const MODEL = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";

// Hard cap to keep things simple in v1. Most MP3 recordings of 30 to 60
// minute calls fit under 20 MB at reasonable bitrates. For larger files we
// can switch to the Gemini Files API later.
const MAX_AUDIO_BYTES = 19 * 1024 * 1024;

const TRANSCRIPTION_PROMPT = `You are transcribing a phone call between a Portea care manager (CM) and a family member of an elderly patient. The CM is a junior medically-trained clinician. The family member could be the spouse, son, daughter, or another relative.

Output a clean, readable transcript with speaker labels.
- Format each turn as "CM:" or "Family:" followed by what they said.
- Preserve Hindi and English exactly as spoken. Do not translate.
- Include only what is actually said. No commentary, no summary, no preamble.
- If a segment is unclear or noisy, write [inaudible] for that span.
- Do not invent content. If you cannot understand a segment, mark it [inaudible].

Return only the transcript text. No markdown, no extra wrapping.`;

function geminiKey(): string {
  return process.env.GEMINI_API_KEY?.trim() || "";
}

export function isTranscriptionLive(): boolean {
  return geminiKey().length > 0;
}

// Fetch audio bytes from a URL. Times out after two minutes so a hung remote
// host does not block the API route forever.
async function fetchAudioFromUrl(
  url: string,
): Promise<{ data: Buffer; mimeType: string }> {
  let res: Response;
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(120_000) });
  } catch (err) {
    throw new Error(
      `Could not reach the recording URL: ${
        err instanceof Error ? err.message : "network error"
      }`,
    );
  }
  if (!res.ok) {
    throw new Error(
      `The recording link returned HTTP ${res.status}. Please check it is accessible without a login.`,
    );
  }
  const mimeType = res.headers.get("content-type") || "audio/mpeg";
  const arrayBuffer = await res.arrayBuffer();
  return { data: Buffer.from(arrayBuffer), mimeType };
}

// Run Gemini on the audio bytes and return the transcript text.
async function transcribeBytes(
  data: Buffer,
  mimeType: string,
): Promise<string> {
  if (!isTranscriptionLive()) {
    throw new Error("Transcription is not configured (GEMINI_API_KEY missing).");
  }
  if (data.length > MAX_AUDIO_BYTES) {
    const sizeMb = (data.length / 1024 / 1024).toFixed(1);
    throw new Error(
      `The audio is ${sizeMb} MB. Files larger than ${Math.floor(
        MAX_AUDIO_BYTES / 1024 / 1024,
      )} MB are not supported yet. Please share the link to the recording instead, or compress the MP3 to a lower bitrate.`,
    );
  }

  const ai = new GoogleGenAI({ apiKey: geminiKey() });
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: "user",
        parts: [
          { text: TRANSCRIPTION_PROMPT },
          {
            inlineData: {
              mimeType: mimeType || "audio/mpeg",
              data: data.toString("base64"),
            },
          },
        ],
      },
    ],
    config: {
      temperature: 0.2,
      maxOutputTokens: 16384,
    },
  });

  const text = (response.text ?? "").trim();
  if (!text) {
    throw new Error("Gemini returned an empty transcript. Please retry.");
  }
  return text;
}

// Transcribe a recording. Source can be either a URL (we fetch it) or a
// raw Buffer (e.g., from a Vercel Blob we just downloaded server-side).
// The audio bytes are processed entirely in memory and never written to
// disk on our side.
export async function transcribeAudio(
  source:
    | { type: "url"; url: string }
    | { type: "buffer"; data: Buffer; mimeType: string },
): Promise<string> {
  if (source.type === "url") {
    const { data, mimeType } = await fetchAudioFromUrl(source.url);
    return transcribeBytes(data, mimeType);
  }
  return transcribeBytes(source.data, source.mimeType);
}
