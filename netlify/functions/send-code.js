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

function base64Url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
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

  const apiKey = process.env.RESEND_API_KEY;
  const secret = process.env.OTP_SECRET;
  const fromEmail = process.env.FROM_EMAIL || "destek@vetkapimda.com";

  if (!apiKey || !secret) {
    return jsonResponse(500, { ok: false, error: "Missing server config" });
  }

  let payload = {};
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (_) {
    return jsonResponse(400, { ok: false, error: "Invalid JSON" });
  }

  const email = String(payload.email || "").trim();
  if (!email) {
    return jsonResponse(400, { ok: false, error: "Email required" });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const exp = Date.now() + 10 * 60 * 1000;
  const data = `${email}|${exp}`;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${data}|${code}`)
    .digest("hex");
  const token = `${base64Url(data)}.${signature}`;

  const emailBody = `
    <div style="font-family: Arial, sans-serif; color: #1c1a2a;">
      <h2>VetKapim Onay Kodu</h2>
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
      from: `VetKapim <${fromEmail}>`,
      to: [email],
      subject: "VetKapim Onay Kodu",
      html: emailBody,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    return jsonResponse(500, { ok: false, error: text });
  }

  return jsonResponse(200, { ok: true, token, exp });
};
