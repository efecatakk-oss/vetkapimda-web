function jsonResponse(statusCode, payload) {
  return new Response(JSON.stringify(payload), {
    status: statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
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
  const toEmail = env.BOOKING_EMAIL || "VETKAPIMDA@gmail.com";
  const fromEmail = env.FROM_EMAIL || "destek@VETKAPIMDAda.com";

  if (!apiKey) {
    return jsonResponse(500, { ok: false, error: "Missing server config" });
  }

  const text = await request.text();
  const data = new URLSearchParams(text);

  const name = data.get("name") || "";
  const phone = data.get("phone") || "";
  const address = data.get("address") || "";
  const datetime = data.get("datetime") || "";
  const notes = data.get("notes") || "";
  const paymentMethod = data.get("paymentMethod") || "";
  const services = data.get("selectedServices") || "";
  const total = data.get("totalPrice") || "";
  const serviceNote = data.get("serviceNote") || "";
  const userEmail = data.get("userEmail") || "";

  const emailBody = `
    <div style="font-family: Arial, sans-serif; color: #1c1a2a;">
      <h2>VETKAPIMDA Randevu Talebi</h2>
      <p><strong>Ad Soyad:</strong> ${escapeHtml(name)}</p>
      <p><strong>Telefon:</strong> ${escapeHtml(phone)}</p>
      <p><strong>E-posta:</strong> ${escapeHtml(userEmail)}</p>
      <p><strong>Adres:</strong> ${escapeHtml(address)}</p>
      <p><strong>Tarih/Saat:</strong> ${escapeHtml(datetime)}</p>
      <p><strong>Ödeme:</strong> ${escapeHtml(paymentMethod)}</p>
      <p><strong>Hizmetler:</strong> ${escapeHtml(services)}</p>
      <p><strong>Toplam:</strong> ${escapeHtml(total)}</p>
      <p><strong>Not:</strong> ${escapeHtml(notes)}</p>
      <p><strong>Hizmet Notu:</strong> ${escapeHtml(serviceNote)}</p>
    </div>
  `;

  const adminResp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `VETKAPIMDA <${fromEmail}>`,
      to: [toEmail],
      subject: "VETKAPIMDA Randevu Talebi",
      html: emailBody,
    }),
  });

  if (!adminResp.ok) {
    const message = await adminResp.text();
    return jsonResponse(500, { ok: false, error: message });
  }

  if (userEmail) {
    const userBody = `
      <div style="font-family: Arial, sans-serif; color: #1c1a2a;">
        <h2>Randevunuz Olusturuldu</h2>
        <p>Talebiniz alindi. Bilgileriniz:</p>
        <p><strong>Ad Soyad:</strong> ${escapeHtml(name)}</p>
        <p><strong>Telefon:</strong> ${escapeHtml(phone)}</p>
        <p><strong>Adres:</strong> ${escapeHtml(address)}</p>
        <p><strong>Tarih/Saat:</strong> ${escapeHtml(datetime)}</p>
        <p><strong>Ödeme:</strong> ${escapeHtml(paymentMethod)}</p>
        <p><strong>Hizmetler:</strong> ${escapeHtml(services)}</p>
        <p><strong>Toplam:</strong> ${escapeHtml(total)}</p>
        <p><strong>Not:</strong> ${escapeHtml(notes)}</p>
      </div>
    `;

    const userResp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `VETKAPIMDA <${fromEmail}>`,
        to: [userEmail],
        subject: "VETKAPIMDA Randevu Onayi",
        html: userBody,
      }),
    });

    if (!userResp.ok) {
      const message = await userResp.text();
      return jsonResponse(500, { ok: false, error: message });
    }
  }

  return jsonResponse(200, { ok: true });
}

