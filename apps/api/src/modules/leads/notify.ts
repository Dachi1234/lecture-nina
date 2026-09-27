const channels = {
  PHONE: "ტელეფონი",
  WHATSAPP: "WhatsApp",
  TELEGRAM: "Telegram",
  EMAIL: "ელ-ფოსტა",
} as const;

const goals = {
  TRAVEL: "მოგზაურობა",
  STUDY: "სწავლა",
  RELOCATION: "გადასვლა",
  FUN: "გართობისთვის",
  OTHER: "სხვა",
} as const;

const days = {
  MON: "ორშ",
  TUE: "სამ",
  WED: "ოთხ",
  THU: "ხუთ",
  FRI: "პარ",
  SAT: "შაბ",
  SUN: "კვ",
} as const;

const times = {
  MORNING: "დილა",
  DAY: "დღე",
  EVENING: "საღამო",
} as const;

export type LeadNoticeInput = {
  name: string;
  phone: string;
  email: string | null;
  channel: keyof typeof channels;
  goal: keyof typeof goals | null;
  days: string[];
  timeOfDay: keyof typeof times | null;
  note: string | null;
  source: string | null;
};

export function leadNotice(lead: LeadNoticeInput) {
  const phone = lead.phone.replace(/\D/g, "");
  const lines = [
    `სახელი: ${lead.name}`,
    `ტელეფონი: +${phone}`,
    lead.email ? `ელ-ფოსტა: ${lead.email}` : null,
    `არხი: ${channels[lead.channel]}`,
    lead.goal ? `მიზანი: ${goals[lead.goal]}` : null,
    lead.days.length > 0 ? `დღეები: ${lead.days.map((day) => days[day as keyof typeof days] ?? day).join(", ")}` : null,
    lead.timeOfDay ? `დრო: ${times[lead.timeOfDay]}` : null,
    lead.note ? `შენიშვნა: ${lead.note}` : null,
    lead.source ? `წყარო: ${lead.source}` : null,
    "",
    `დარეკვა: tel:+${phone}`,
    `WhatsApp: https://wa.me/${phone}`,
    lead.email ? `წერილი: mailto:${lead.email}` : null,
  ].filter((line): line is string => line !== null);

  const text = ["ახალი საცდელი გაკვეთილის ჯავშანი", "", ...lines].join("\n");
  const html = `<div style="background:#FCF7E6;color:#0A414F;font-family:sans-serif;padding:24px">
    <p style="margin:0 0 8px;color:#196166;font-size:14px">Nina – Tu Profe de Español</p>
    <h1 style="margin:0 0 16px;font-size:22px">ახალი საცდელი გაკვეთილის ჯავშანი</h1>
    ${lines
      .filter((line) => line.length > 0)
      .map((line) => `<p style="margin:0 0 8px;font-size:16px;line-height:1.5">${escapeHtml(line)}</p>`)
      .join("")}
  </div>`;

  return {
    subject: `ახალი ჯავშანი — ${lead.name}`,
    text,
    html,
  };
}

export async function deliverLeadNotice(lead: LeadNoticeInput) {
  const notice = leadNotice(lead);
  const emailTo = process.env.LEAD_NOTIFY_EMAIL;
  const resendKey = process.env.RESEND_API_KEY;
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChat = process.env.TELEGRAM_CHAT_ID;
  const emailReady = Boolean(emailTo && resendKey);

  if (!emailReady) {
    console.info(`lead notify (email not configured)\n${notice.text}`);
  } else {
    await sendEmail({
      apiKey: resendKey!,
      from: process.env.MAIL_FROM ?? "Nina – Tu Profe de Español <hola@localhost>",
      to: emailTo!,
      subject: notice.subject,
      text: notice.text,
      html: notice.html,
    });
  }

  if (!telegramToken || !telegramChat) return;

  try {
    await sendTelegram(telegramToken, telegramChat, notice.text);
  } catch (error) {
    console.error("lead telegram notify failed");
    if (!emailReady) throw error;
  }
}

async function sendEmail(input: { apiKey: string; from: string; to: string; subject: string; text: string; html: string }) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: input.from,
      to: [input.to],
      subject: input.subject,
      text: input.text,
      html: input.html,
    }),
  });
  if (!response.ok) throw new Error(`lead email failed: ${response.status}`);
}

async function sendTelegram(token: string, chatId: string, text: string) {
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  if (!response.ok) throw new Error(`lead telegram failed: ${response.status}`);
}

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
