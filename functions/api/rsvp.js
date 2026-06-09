export async function onRequestPost(context) {
  const { env, request } = context;
  const token = env.TELEGRAM_BOT_TOKEN;
  const chatIdsRaw = env.TELEGRAM_CHAT_IDS || "";

  if (!token || !chatIdsRaw) {
    return json({ ok: false, error: "not_configured" }, 503);
  }

  let data;
  try {
    data = await request.json();
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  const name = String(data.name || "").trim();
  const answer = String(data.answer || "");
  const guests = Math.max(1, Math.min(20, parseInt(data.guests, 10) || 1));

  if (!name || name.length > 100) {
    return json({ ok: false, error: "invalid_name" }, 400);
  }

  if (answer !== "yes" && answer !== "no") {
    return json({ ok: false, error: "invalid_answer" }, 400);
  }

  const answerText = answer === "yes" ? "Буду! 🎉" : "Не смогу 😔";
  const guestsText = answer === "yes" ? `\nГостей: ${guests}` : "";
  const time = new Date().toLocaleString("ru-RU", {
    timeZone: "Europe/Moscow",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const message = [
    "🎂 RSVP · Мирон 1 годик",
    "",
    `Имя: ${name}`,
    `Ответ: ${answerText}${guestsText}`,
    `Время: ${time}`,
  ].join("\n");

  const chatIds = chatIdsRaw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  const errors = [];
  let sent = 0;

  for (const chatId of chatIds) {
    const result = await sendTelegram(token, chatId, message);
    if (result.ok) sent++;
    else errors.push(result.error || "unknown");
  }

  if (sent === 0) {
    return json({ ok: false, error: "telegram_send_failed", details: errors }, 502);
  }

  return json({ ok: true, sent });
}

async function sendTelegram(token, chatId, message) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: message }),
    });
    const data = await res.json();
    if (!data.ok) {
      return { ok: false, error: data.description || "telegram_error" };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "network_error" };
  }
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
