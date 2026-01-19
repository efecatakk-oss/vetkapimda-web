function jsonResponse(statusCode, payload) {
  return new Response(JSON.stringify(payload), {
    status: statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

function base64UrlToString(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (padded.length % 4)) % 4;
  const base64 = padded + "=".repeat(padLength);
  const binary = atob(base64);
  let result = "";
  for (let i = 0; i < binary.length; i += 1) {
    result += String.fromCharCode(binary.charCodeAt(i));
  }
  return result;
}

async function hmacHex(secret, message) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === "OPTIONS") {
    return new Response("", {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (request.method !== "POST") {
    return jsonResponse(405, { ok: false, error: "Method not allowed" });
  }

  const secret = env.OTP_SECRET;
  if (!secret) {
    return jsonResponse(500, { ok: false, error: "Missing server config" });
  }

  let payload = {};
  try {
    payload = await request.json();
  } catch (_) {
    return jsonResponse(400, { ok: false, error: "Invalid JSON" });
  }

  const email = String(payload.email || "").trim();
  const code = String(payload.code || "").trim();
  const token = String(payload.token || "").trim();
  if (!email || !code || !token) {
    return jsonResponse(400, { ok: false, error: "Missing fields" });
  }

  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) {
    return jsonResponse(400, { ok: false, error: "Invalid token" });
  }

  let data = "";
  try {
    data = base64UrlToString(encoded);
  } catch (_) {
    return jsonResponse(400, { ok: false, error: "Invalid token data" });
  }

  const [tokenEmail, expRaw] = data.split("|");
  const exp = Number(expRaw || 0);
  if (tokenEmail !== email) {
    return jsonResponse(400, { ok: false, error: "Email mismatch" });
  }
  if (!exp || Date.now() > exp) {
    return jsonResponse(400, { ok: false, error: "Token expired" });
  }

  const expected = await hmacHex(secret, `${data}|${code}`);
  if (expected !== signature) {
    return jsonResponse(400, { ok: false, error: "Code mismatch" });
  }

  return jsonResponse(200, { ok: true });
}
