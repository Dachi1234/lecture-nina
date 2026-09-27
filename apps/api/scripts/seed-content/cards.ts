import { brandUrl, illustrationUrl, renderPdf, renderPng } from "./media.js";

const esc = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const es = (value: string) => `<span lang="es">${esc(value)}</span>`;

const CARD_CSS = `
body{width:1080px;height:1920px;overflow:hidden}
.card{position:relative;width:1080px;height:1920px;padding:96px 88px 80px;display:flex;flex-direction:column;background:var(--paper)}
.card::before{content:"";position:absolute;inset:36px;border:3px solid var(--line);border-radius:56px;pointer-events:none}
.over{font-family:Montserrat;font-weight:700;font-size:30px;letter-spacing:.22em;color:var(--teal);text-transform:uppercase}
.foot{margin-top:auto;display:flex;align-items:center;justify-content:space-between;padding-top:40px}
.logo{width:150px;height:150px;border-radius:50%;background:var(--card);border:3px solid var(--line);display:flex;align-items:center;justify-content:center;overflow:hidden}
.logo img{width:124px}
.page{font-family:Montserrat;font-weight:600;font-size:30px;color:var(--muted)}
.art{border-radius:44px;background:var(--card);border:3px solid var(--line);overflow:hidden;display:flex;align-items:center;justify-content:center}
.art img{width:100%;height:100%;object-fit:cover;object-position:center 25%}
svg{flex:none}
.brush{display:inline-block;background:linear-gradient(transparent 58%,var(--mustard) 58%,var(--mustard) 88%,transparent 88%);padding:0 10px}
.el{color:var(--teal)}.la{color:var(--burgundy)}
.strip{border-radius:36px;background:var(--deep);padding:40px 48px}
`;

function foot(page?: string) {
  return `<div class="foot"><div class="logo"><img src="${brandUrl("brand/nina-logo.webp")}" alt=""></div>${page ? `<span class="page">${page}</span>` : ""}</div>`;
}

export type WordCardInput = { overline: string; image: string; article?: string; word: string; ka: string; exampleEs?: string; exampleKa?: string; page?: string };

export function wordCard(input: WordCardInput) {
  const article = input.article ? `<span class="${input.article.startsWith("l") ? "la" : "el"}">${esc(input.article)} </span>` : "";
  const body = `<div class="card">
    <p class="over">${esc(input.overline)}</p>
    <div class="art" style="margin-top:48px;height:820px"><img src="${illustrationUrl(input.image)}" alt=""></div>
    <p lang="es" style="margin-top:72px;font-family:Montserrat;font-weight:700;font-size:128px;line-height:1.05">${article}${esc(input.word)}</p>
    <p class="ka" style="margin-top:24px;font-size:64px;font-weight:600;color:var(--muted)">${esc(input.ka)}</p>
    ${input.exampleEs ? `<div class="strip" style="margin-top:56px"><p lang="es" style="font-family:Montserrat;font-size:44px;font-style:italic;font-weight:500">${esc(input.exampleEs)}</p>${input.exampleKa ? `<p class="ka" style="margin-top:12px;font-size:36px;color:var(--muted)">${esc(input.exampleKa)}</p>` : ""}</div>` : ""}
    ${foot(input.page)}
  </div>`;
  return renderPng(body, CARD_CSS, 1080, 1920);
}

export type CoverInput = { hand: string; titleKa: string; subtitleKa?: string; image: string; page?: string; round?: boolean };

export function coverCard(input: CoverInput) {
  const body = `<div class="card" style="text-align:center;align-items:center">
    <p class="hand" lang="es" style="margin-top:40px;font-size:190px;line-height:1;color:var(--burgundy)">${esc(input.hand)}</p>
    <p class="ka" style="margin-top:32px;font-size:72px;font-weight:700"><span class="brush">${esc(input.titleKa)}</span></p>
    ${input.subtitleKa ? `<p class="ka" style="margin-top:28px;font-size:42px;color:var(--muted);max-width:820px">${esc(input.subtitleKa)}</p>` : ""}
    <div class="art" style="margin-top:72px;width:860px;height:860px;${input.round ? "border-radius:50%" : ""}"><img src="${illustrationUrl(input.image)}" alt=""></div>
    ${foot(input.page)}
  </div>`;
  return renderPng(body, CARD_CSS, 1080, 1920);
}

export type PhraseRow = { es: string; ka: string; note?: string };
export type ListCardInput = { overline: string; titleEs: string; titleKa: string; rows: PhraseRow[]; image?: string; page?: string; tipKa?: string };

export function listCard(input: ListCardInput) {
  const rows = input.rows
    .map((row, index) => `<li style="display:flex;gap:32px;align-items:baseline;padding:30px 0;${index ? "border-top:3px solid var(--line)" : ""}">
      <span style="flex:none;width:18px;height:18px;border-radius:50%;background:var(--mustard);transform:translateY(-6px)"></span>
      <div><p lang="es" style="font-family:Montserrat;font-weight:700;font-size:58px;line-height:1.15">${esc(row.es)}</p>
      <p class="ka" style="margin-top:6px;font-size:38px;color:var(--muted)">${esc(row.ka)}${row.note ? ` <span style="color:var(--teal)">· ${esc(row.note)}</span>` : ""}</p></div></li>`)
    .join("");
  const body = `<div class="card">
    <p class="over">${esc(input.overline)}</p>
    <p lang="es" style="margin-top:28px;font-family:Montserrat;font-weight:700;font-size:92px;line-height:1.05">${esc(input.titleEs)}</p>
    <p class="ka" style="margin-top:14px;font-size:46px;color:var(--muted)">${esc(input.titleKa)}</p>
    ${input.image ? `<div class="art" style="margin-top:44px;height:430px"><img src="${illustrationUrl(input.image)}" alt=""></div>` : ""}
    <ul style="list-style:none;margin-top:36px">${rows}</ul>
    ${input.tipKa ? `<div class="strip" style="margin-top:24px;background:var(--mustard-soft)"><p class="ka" style="font-size:36px;color:#7A4A00">${esc(input.tipKa)}</p></div>` : ""}
    ${foot(input.page)}
  </div>`;
  return renderPng(body, CARD_CSS, 1080, 1920);
}

export function alphabetCard(letters: Array<{ letter: string; word: string }>, page: string, titleKa: string) {
  const cells = letters
    .map((item) => `<div style="background:var(--card);border:3px solid var(--line);border-radius:32px;padding:26px 10px 22px;text-align:center">
      <p lang="es" style="font-family:Montserrat;font-weight:700;font-size:76px;line-height:1">${esc(item.letter)}</p>
      <p lang="es" style="margin-top:12px;font-family:Montserrat;font-size:30px;color:var(--muted)">${esc(item.word)}</p></div>`)
    .join("");
  const body = `<div class="card">
    <p class="over">EL ALFABETO</p>
    <p class="ka" style="margin-top:22px;font-size:60px;font-weight:700">${esc(titleKa)}</p>
    <div style="margin-top:48px;display:grid;grid-template-columns:repeat(4,1fr);gap:22px">${cells}</div>
    ${foot(page)}
  </div>`;
  return renderPng(body, CARD_CSS, 1080, 1920);
}

function clockSvg(hour: number, minute: number, size: number) {
  const r = size / 2;
  const ticks = Array.from({ length: 12 }, (_, index) => {
    const angle = (index * 30 * Math.PI) / 180;
    const inner = index % 3 === 0 ? r * 0.72 : r * 0.78;
    return `<line x1="${r + Math.sin(angle) * inner}" y1="${r - Math.cos(angle) * inner}" x2="${r + Math.sin(angle) * r * 0.86}" y2="${r - Math.cos(angle) * r * 0.86}" stroke="#0A414F" stroke-width="${index % 3 === 0 ? 10 : 5}" stroke-linecap="round"/>`;
  }).join("");
  const minuteAngle = (minute * 6 * Math.PI) / 180;
  const hourAngle = (((hour % 12) * 30 + minute * 0.5) * Math.PI) / 180;
  const hand = (angle: number, length: number, width: number, color: string) =>
    `<line x1="${r}" y1="${r}" x2="${r + Math.sin(angle) * length}" y2="${r - Math.cos(angle) * length}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${r}" cy="${r}" r="${r - 12}" fill="#FFFCF3" stroke="#196166" stroke-width="24"/>${ticks}${hand(hourAngle, r * 0.46, 18, "#0A414F")}${hand(minuteAngle, r * 0.68, 11, "#841B22")}<circle cx="${r}" cy="${r}" r="16" fill="#F5B246"/></svg>`;
}

export type ClockRow = { hour: number; minute: number; es: string; ka: string };

export function clockCard(input: { title: string; rows: ClockRow[]; page: string }) {
  const rows = input.rows
    .map((row) => `<li style="display:flex;align-items:center;gap:40px;padding:22px 0">
      ${clockSvg(row.hour, row.minute, 250)}
      <div><p style="font-family:Montserrat;font-weight:700;font-size:40px;color:var(--teal)">${row.hour}:${String(row.minute).padStart(2, "0")}</p>
      <p lang="es" style="margin-top:6px;font-family:Montserrat;font-weight:700;font-size:52px;line-height:1.15">${esc(row.es)}</p>
      <p class="ka" style="margin-top:6px;font-size:34px;color:var(--muted)">${esc(row.ka)}</p></div></li>`)
    .join("");
  const body = `<div class="card">
    <p class="over">LA HORA</p>
    <p lang="es" style="margin-top:22px;font-family:Montserrat;font-weight:700;font-size:84px">${esc(input.title)}</p>
    <ul style="list-style:none;margin-top:30px">${rows}</ul>
    ${foot(input.page)}
  </div>`;
  return renderPng(body, CARD_CSS, 1080, 1920);
}

const ARROWS: Record<string, string> = {
  left: `<path d="M150 60 L60 150 L150 240 M60 150 H260" />`,
  right: `<path d="M150 60 L240 150 L150 240 M240 150 H40" />`,
  straight: `<path d="M60 150 L150 60 L240 150 M150 60 V260" />`,
  back: `<path d="M90 110 H200 A60 60 0 0 1 200 230 H110 M140 60 L90 110 L140 160" />`,
  corner: `<path d="M70 250 V120 A40 40 0 0 1 110 80 H240 M190 30 L240 80 L190 130" />`,
  opposite: `<circle cx="150" cy="150" r="90"/><path d="M150 60 V240 M60 150 H240" />`,
};

export function directionsCard(input: { rows: Array<{ arrow: keyof typeof ARROWS; es: string; ka: string }>; page: string; titleEs: string; titleKa: string }) {
  const rows = input.rows
    .map((row) => `<li style="display:flex;align-items:center;gap:44px;padding:26px 0;border-top:3px solid var(--line)">
      <div style="flex:none;width:190px;height:190px;border-radius:40px;background:var(--teal-soft);display:flex;align-items:center;justify-content:center">
        <svg width="150" height="150" viewBox="0 0 300 300" fill="none" stroke="#196166" stroke-width="26" stroke-linecap="round" stroke-linejoin="round">${ARROWS[row.arrow]}</svg></div>
      <div><p lang="es" style="font-family:Montserrat;font-weight:700;font-size:58px">${esc(row.es)}</p><p class="ka" style="margin-top:6px;font-size:38px;color:var(--muted)">${esc(row.ka)}</p></div></li>`)
    .join("");
  const body = `<div class="card">
    <p class="over">DIRECCIONES</p>
    <p lang="es" style="margin-top:22px;font-family:Montserrat;font-weight:700;font-size:84px">${esc(input.titleEs)}</p>
    <p class="ka" style="margin-top:10px;font-size:44px;color:var(--muted)">${esc(input.titleKa)}</p>
    <ul style="list-style:none;margin-top:40px">${rows}</ul>
    ${foot(input.page)}
  </div>`;
  return renderPng(body, CARD_CSS, 1080, 1920);
}

export type MenuSection = { name: string; items: Array<{ es: string; ka: string; price: string }> };

export function menuCard(input: { titleEs: string; subtitleKa: string; sections: MenuSection[]; page: string; image?: string }) {
  const sections = input.sections
    .map((section) => `<section style="margin-top:44px"><p class="over" style="color:var(--burgundy)">${esc(section.name)}</p>
      <ul style="list-style:none;margin-top:14px">${section.items
        .map((item) => `<li style="display:flex;align-items:baseline;gap:18px;padding:16px 0"><div style="flex:none"><p lang="es" style="font-family:Montserrat;font-weight:700;font-size:50px">${esc(item.es)}</p><p class="ka" style="font-size:32px;color:var(--muted)">${esc(item.ka)}</p></div>
        <span style="flex:1;border-bottom:4px dotted var(--sand);transform:translateY(-14px)"></span><span style="font-family:Montserrat;font-weight:700;font-size:48px;color:var(--teal)">${esc(item.price)}</span></li>`)
        .join("")}</ul></section>`)
    .join("");
  const body = `<div class="card">
    <p class="hand" lang="es" style="font-size:150px;line-height:1;color:var(--burgundy);text-align:center">${esc(input.titleEs)}</p>
    <p class="ka" style="margin-top:10px;font-size:42px;color:var(--muted);text-align:center">${esc(input.subtitleKa)}</p>
    ${input.image ? `<div class="art" style="margin:36px auto 0;width:380px;height:380px;border-radius:50%"><img src="${illustrationUrl(input.image)}" alt=""></div>` : ""}
    ${sections}
    ${foot(input.page)}
  </div>`;
  return renderPng(body, CARD_CSS, 1080, 1920);
}

export function mapCard(input: { cities: Array<{ es: string; ka: string }>; page: string }) {
  const cities = input.cities
    .map((city) => `<li style="background:var(--card);border:3px solid var(--line);border-radius:30px;padding:24px 30px"><p lang="es" style="font-family:Montserrat;font-weight:700;font-size:46px">${esc(city.es)}</p><p class="ka" style="margin-top:4px;font-size:32px;color:var(--muted)">${esc(city.ka)}</p></li>`)
    .join("");
  const body = `<div class="card">
    <p class="over">ESPAÑA</p>
    <p lang="es" style="margin-top:22px;font-family:Montserrat;font-weight:700;font-size:84px">¿De dónde eres?</p>
    <p class="ka" style="margin-top:10px;font-size:44px;color:var(--muted)">ესპანეთის დიდი ქალაქები</p>
    <div class="art" style="margin-top:44px;height:680px;background:var(--paper)"><img src="${illustrationUrl("mapa-espana")}" alt="" style="object-fit:contain"></div>
    <ul style="list-style:none;margin-top:40px;display:grid;grid-template-columns:1fr 1fr;gap:22px">${cities}</ul>
    ${foot(input.page)}
  </div>`;
  return renderPng(body, CARD_CSS, 1080, 1920);
}

export function introduceCard(input: { lines: Array<{ es: string; ka: string }>; page: string; image: string }) {
  const lines = input.lines
    .map((line) => `<li style="padding:24px 0;border-top:3px solid var(--line)"><p lang="es" style="font-family:Montserrat;font-weight:700;font-size:56px">${line.es.replace(/…/g, `<span style="display:inline-block;width:230px;border-bottom:5px solid var(--sand);margin-left:12px"></span>`)}</p><p class="ka" style="margin-top:6px;font-size:36px;color:var(--muted)">${esc(line.ka)}</p></li>`)
    .join("");
  const body = `<div class="card">
    <p class="over">ME PRESENTO</p>
    <p class="hand" lang="es" style="margin-top:12px;font-size:150px;line-height:1;color:var(--burgundy)">¡Hola!</p>
    <div class="art" style="margin-top:36px;height:560px"><img src="${illustrationUrl(input.image)}" alt=""></div>
    <ul style="list-style:none;margin-top:36px">${lines}</ul>
    ${foot(input.page)}
  </div>`;
  return renderPng(body, CARD_CSS, 1080, 1920);
}

const SLIDE_CSS = `body{width:1280px;height:720px;overflow:hidden}
.slide{position:relative;width:1280px;height:720px;background:var(--navy)}
.slide>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.band{position:absolute;left:48px;right:48px;bottom:40px;background:rgba(252,247,230,.95);border-radius:28px;padding:22px 34px;display:flex;gap:24px;align-items:center;box-shadow:0 8px 30px rgba(10,65,79,.25)}
.who{flex:none;width:72px;height:72px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:Montserrat;font-weight:700;font-size:32px}`;

const TONE_BG: Record<string, [string, string]> = {
  burgundy: ["#F3DCD9", "#841B22"],
  teal: ["#DCEBE8", "#196166"],
  sage: ["#DDE9E3", "#34605A"],
  mustard: ["#FBE7C2", "#7A4A00"],
  navy: ["#D5E1E4", "#0A414F"],
};

export function titleSlide(input: { image: string; hand: string; titleKa: string }) {
  const body = `<div class="slide"><img src="${illustrationUrl(input.image)}" alt="">
    <div style="position:absolute;inset:0;background:rgba(10,65,79,.42)"></div>
    <div style="position:absolute;left:0;right:0;top:210px;text-align:center">
      <p class="hand" lang="es" style="font-size:132px;color:#FCF7E6;line-height:1">${esc(input.hand)}</p>
      <p class="ka" style="margin-top:22px;display:inline-block;background:#FCF7E6;color:var(--navy);font-size:40px;font-weight:700;padding:10px 30px;border-radius:18px">${esc(input.titleKa)}</p>
    </div></div>`;
  return renderPng(body, SLIDE_CSS, 1280, 720);
}

export function lineSlide(input: { image: string; name: string; initial: string; tone: string; es: string; en?: string }) {
  const [bg, fg] = TONE_BG[input.tone] ?? TONE_BG.teal!;
  const body = `<div class="slide"><img src="${illustrationUrl(input.image)}" alt="">
    <div class="band"><span class="who" style="background:${bg};color:${fg}">${esc(input.initial)}</span>
      <div><p style="font-family:Montserrat;font-weight:600;font-size:22px;color:var(--muted)">${esc(input.name)}</p>
      <p lang="es" style="font-family:Montserrat;font-weight:700;font-size:40px;line-height:1.2">${esc(input.es)}</p>
      ${input.en ? `<p lang="en" style="font-family:Montserrat;font-size:24px;color:var(--muted);margin-top:4px">${esc(input.en)}</p>` : ""}</div></div></div>`;
  return renderPng(body, SLIDE_CSS, 1280, 720);
}

export function bigTextSlide(input: { overline: string; big: string; ka: string }) {
  const body = `<div class="slide" style="background:var(--paper);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">
    <p class="over" style="font-family:Montserrat;font-weight:700;font-size:24px;letter-spacing:.22em;color:var(--teal)">${esc(input.overline)}</p>
    <p lang="es" style="margin-top:18px;font-family:Montserrat;font-weight:700;font-size:150px;line-height:1;color:var(--navy)">${esc(input.big)}</p>
    <p class="ka" style="margin-top:22px;font-size:46px;color:var(--muted)">${esc(input.ka)}</p></div>`;
  return renderPng(body, SLIDE_CSS, 1280, 720);
}

const PDF_CSS = `@page{size:A4;margin:0}
body{width:210mm}
.sheet{width:210mm;height:297mm;padding:18mm 18mm 16mm;position:relative;display:flex;flex-direction:column;page-break-after:always;background:var(--paper)}
.sheet:last-child{page-break-after:auto}
.over{font-family:Montserrat;font-weight:700;font-size:10pt;letter-spacing:.2em;color:var(--teal);text-transform:uppercase}
h1{font-family:Montserrat;font-weight:700;font-size:30pt;line-height:1.1;margin-top:4mm}
h2{font-family:Montserrat;font-weight:700;font-size:15pt;margin-top:8mm;color:var(--teal)}
.ka{line-height:1.6}.muted{color:var(--muted)}
.box{background:var(--card);border:1.2pt solid var(--line);border-radius:5mm;padding:6mm 7mm;margin-top:6mm}
.foot{margin-top:auto;display:flex;align-items:center;justify-content:space-between;font-family:Montserrat;font-size:9pt;color:var(--muted);border-top:1pt solid var(--line);padding-top:4mm}
.foot img{height:12mm}
table{width:100%;border-collapse:collapse;margin-top:4mm;font-size:12pt}
td,th{padding:2.6mm 3mm;border-bottom:1pt solid var(--line);text-align:left;vertical-align:top}
th{font-size:9pt;color:var(--muted);font-weight:600}
.line{display:inline-block;min-width:45mm;border-bottom:1.2pt solid var(--sand);height:6mm;vertical-align:bottom}
.hand{font-family:Caveat;font-weight:600}`;

export type PdfPage = { overline: string; title: string; html: string };

export function pdfDoc(pages: PdfPage[], footer: string) {
  const body = pages
    .map((page, index) => `<section class="sheet"><p class="over">${esc(page.overline)}</p><h1 lang="es">${esc(page.title)}</h1>${page.html}
      <div class="foot"><img src="${brandUrl("brand/nina-logo.webp")}" alt=""><span>${esc(footer)} · ${index + 1} / ${pages.length}</span></div></section>`)
    .join("");
  return renderPdf(body, PDF_CSS);
}

export { esc, es };
