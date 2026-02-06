function jsonResponse(statusCode, payload) {
  return new Response(JSON.stringify(payload), {
    status: statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

function base64UrlFromBytes(bytes) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlFromString(value) {
  const encoder = new TextEncoder();
  return base64UrlFromBytes(encoder.encode(value));
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

  const apiKey = env.RESEND_API_KEY;
  const secret = env.OTP_SECRET;
  const fromEmail = env.FROM_EMAIL || "destek@VETKAPIMDAda.com";

  if (!apiKey || !secret) {
    return jsonResponse(500, { ok: false, error: "Missing server config" });
  }

  let payload = {};
  try {
    payload = await request.json();
  } catch (_) {
    return jsonResponse(400, { ok: false, error: "Invalid JSON" });
  }

  const email = String(payload.email || "").trim().toLowerCase();
  if (!email) {
    return jsonResponse(400, { ok: false, error: "Email required" });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const exp = Date.now() + 10 * 60 * 1000;
  const data = `${email}|${exp}`;
  const signature = await hmacHex(secret, `${data}|${code}`);
  const token = `${base64UrlFromString(data)}.${signature}`;

  const emailBody = `
    <div style="font-family: Arial, sans-serif; color: #1c1a2a;">
      <h2>VETKAPIMDA Onay Kodu</h2>
      <p>Kaydinizi tamamlamak icin asagidaki kodu girin:</p>
      <div style="font-size: 28px; font-weight: bold; margin: 16px 0;">${code}</div>
      <p>Kod 10 dakika boyunca gecerli.</p>
    </div>
  `;

  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `VETKAPIMDA <${fromEmail}>`,
      to: [email],
      subject: "VETKAPIMDA Onay Kodu",
      html: emailBody,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    return jsonResponse(500, { ok: false, error: text });
  }

  return jsonResponse(200, { ok: true, token, exp });
}

