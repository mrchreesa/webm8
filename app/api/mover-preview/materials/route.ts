import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { isUuid, verifyPreviewAccessToken } from "@/lib/previewAccess";
import { normalizeBusinessLink } from "@/lib/reviewRequest";
import {
  supabaseTableRequest,
  uploadPrivatePreviewAsset,
} from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_BYTES = 3 * 1024 * 1024;
const MAX_NOTE_LENGTH = 1200;
const MAX_LINKS = 8;

type StoredAsset = {
  kind: "logo" | "photo";
  name: string;
  path: string;
  mime: string;
  size: number;
};

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";

  try {
    if (contentType.includes("multipart/form-data")) {
      return await uploadAsset(request);
    }
    return await saveDetails(request);
  } catch (error) {
    console.error("mover-preview: materials request failed", error);
    return NextResponse.json(
      {
        ok: false,
        message:
          "We couldn't save those materials just now. Your call is still booked; try again or email them to info@webm8agency.com.",
      },
      { status: 502 },
    );
  }
}

async function uploadAsset(request: Request) {
  const form = await request.formData();
  const requestId = stringValue(form.get("requestId"));
  const token = stringValue(form.get("token"));
  const kindValue = stringValue(form.get("kind"));
  const upload = form.get("file");

  if (!authorized(requestId, token)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (kindValue !== "logo" && kindValue !== "photo") {
    return NextResponse.json(
      { ok: false, message: "Choose whether this is a logo or business photo." },
      { status: 400 },
    );
  }
  if (!(upload instanceof File) || upload.size === 0) {
    return NextResponse.json(
      { ok: false, message: "Choose an image to upload." },
      { status: 400 },
    );
  }
  if (upload.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { ok: false, message: "Each image must be 3 MB or smaller." },
      { status: 400 },
    );
  }

  const mime = await verifiedImageType(upload);
  if (!mime) {
    return NextResponse.json(
      { ok: false, message: "Use a PNG, JPG, or WebP image." },
      { status: 400 },
    );
  }

  const currentAssets = await getAssets(requestId);
  const sameKind = currentAssets.filter((asset) => asset.kind === kindValue);
  const limit = kindValue === "logo" ? 1 : 3;
  if (sameKind.length >= limit) {
    return NextResponse.json(
      {
        ok: false,
        message:
          kindValue === "logo"
            ? "A logo has already been uploaded for this preview."
            : "Up to three business photos can be uploaded.",
      },
      { status: 400 },
    );
  }

  const extension = mime === "image/jpeg" ? "jpg" : mime.split("/")[1];
  const objectPath = `${requestId}/${kindValue}-${randomUUID()}.${extension}`;
  await uploadPrivatePreviewAsset(objectPath, upload);

  const asset: StoredAsset = {
    kind: kindValue,
    name: safeFileName(upload.name),
    path: objectPath,
    mime,
    size: upload.size,
  };

  await supabaseTableRequest("agency_review_requests", {
    method: "PATCH",
    query: `id=eq.${requestId}`,
    prefer: "return=minimal",
    body: { assets: [...currentAssets, asset] },
  });

  return NextResponse.json({ ok: true });
}

async function saveDetails(request: Request) {
  const body = (await request.json()) as Record<string, unknown>;
  const requestId = typeof body.requestId === "string" ? body.requestId : "";
  const token = typeof body.token === "string" ? body.token : "";
  if (!authorized(requestId, token)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const note =
    typeof body.note === "string"
      ? body.note.trim().slice(0, MAX_NOTE_LENGTH) || null
      : null;
  const rawLinks = Array.isArray(body.additionalLinks)
    ? body.additionalLinks
    : [];
  const links: string[] = [];
  for (const item of rawLinks.slice(0, MAX_LINKS)) {
    if (typeof item !== "string" || !item.trim()) continue;
    const normalized = normalizeBusinessLink(item.trim());
    if (!normalized) {
      return NextResponse.json(
        {
          ok: false,
          message: `Check this additional link: ${item.slice(0, 80)}`,
        },
        { status: 400 },
      );
    }
    if (!links.includes(normalized)) links.push(normalized);
  }

  await supabaseTableRequest("agency_review_requests", {
    method: "PATCH",
    query: `id=eq.${requestId}`,
    prefer: "return=minimal",
    body: {
      additional_links: links,
      materials_note: note,
      materials_submitted_at: new Date().toISOString(),
    },
  });

  return NextResponse.json({ ok: true });
}

async function getAssets(requestId: string) {
  const rows = await supabaseTableRequest<Array<{ assets: unknown }>>(
    "agency_review_requests",
    { query: `select=assets&id=eq.${requestId}&limit=1` },
  );
  if (!rows[0]) throw new Error("Preview request was not found");
  return Array.isArray(rows[0].assets) ? (rows[0].assets as StoredAsset[]) : [];
}

function authorized(requestId: string, token: string) {
  return isUuid(requestId) && verifyPreviewAccessToken(requestId, token);
}

function stringValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

async function verifiedImageType(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}

function safeFileName(value: string) {
  return value.replace(/[^a-z0-9._ -]/gi, "_").slice(0, 160) || "image";
}
