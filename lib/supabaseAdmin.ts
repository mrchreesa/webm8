type SupabaseRequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  query?: string;
  body?: unknown;
  prefer?: string;
};

function credentials() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) throw new Error("Supabase admin access is not configured");
  return { url, key };
}

export async function supabaseTableRequest<T>(
  table: string,
  { method = "GET", query = "", body, prefer }: SupabaseRequestOptions = {},
) {
  const { url, key } = credentials();
  const response = await fetch(
    `${url}/rest/v1/${table}${query ? `?${query}` : ""}`,
    {
      method,
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        ...(prefer ? { Prefer: prefer } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Supabase ${table} request failed with ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export async function uploadPrivatePreviewAsset(
  objectPath: string,
  file: File,
) {
  const { url, key } = credentials();
  const response = await fetch(
    `${url}/storage/v1/object/mover-preview-assets/${encodePath(objectPath)}`,
    {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": file.type,
        "x-upsert": "false",
      },
      body: Buffer.from(await file.arrayBuffer()),
    },
  );

  if (!response.ok) {
    throw new Error(`Supabase Storage upload failed with ${response.status}`);
  }
}

function encodePath(path: string) {
  return path.split("/").map(encodeURIComponent).join("/");
}
