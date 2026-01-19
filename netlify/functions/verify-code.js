const crypto = require("crypto");

function jsonResponse(statusCode, payload) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(payload),
  };
}

function base64UrlDecode(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4 === 0 ? "" : "=".repeat(4 - (base64.length % 4));
  return Buffer.from(base64 + pad, "base64").toString("utf8");
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { ok: false, error: "Method not allowed" });
  }

  const secret = process.env.OTP_SECRET;
  if (!secret) {
    return jsonResponse(500, { ok: false, error: "Missing server config" });
  }

  let payload = {};
  try {
    payload = JSON.parse(event.body || "{}");
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

  const decoded = base64UrlDecode(encoded);
  const [tokenEmail, exp] = decoded.split("|");
  if (tokenEmail !== email) {
    return jsonResponse(401, { ok: false, error: "Email mismatch" });
  }
  if (!exp || Number.isNaN(Number(exp))) {
    return jsonResponse(400, { ok: false, error: "Invalid token data" });
  }
  if (Date.now() > Number(exp)) {
    return jsonResponse(410, { ok: false, error: "Code expired" });
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${email}|${exp}|${code}`)
    .digest("hex");

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return jsonResponse(401, { ok: false, error: "Invalid code" });
  }

  return jsonResponse(200, { ok: true });
};
