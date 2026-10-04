// Sharing helpers: a canvas-drawn badge image, plus plain text/link sharing.

const FONT = '"Poppins","Noto Sans Devanagari","Noto Sans JP","Segoe UI",sans-serif';

function wrapLines(ctx, text, maxWidth) {
  const tokens = text.includes(" ") ? text.split(" ") : [...text];
  const glue = text.includes(" ") ? " " : "";
  const lines = [];
  let line = "";
  for (const token of tokens) {
    const attempt = line ? line + glue + token : token;
    if (ctx.measureText(attempt).width > maxWidth && line) {
      lines.push(line);
      line = token;
    } else {
      line = attempt;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// Draws a 1080x1080 badge card and returns it as a PNG Blob.
export async function renderBadgeCard({ earnedText, badgeLabel, onText }) {
  if (document.fonts?.ready) await document.fonts.ready;

  const size = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  const bg = ctx.createLinearGradient(0, 0, size, size);
  bg.addColorStop(0, "#2F8F5B");
  bg.addColorStop(1, "#226B44");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  // White card
  const pad = 90;
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.roundRect(pad, pad, size - pad * 2, size - pad * 2, 56);
  ctx.fill();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.font = `200px ${FONT}`;
  ctx.fillStyle = "#E8A33D";
  ctx.fillText("🏅", size / 2, 340);

  ctx.font = `600 44px ${FONT}`;
  ctx.fillStyle = "#5B665F";
  ctx.fillText(earnedText, size / 2, 520);

  ctx.font = `700 76px ${FONT}`;
  ctx.fillStyle = "#226B44";
  const lines = wrapLines(ctx, badgeLabel, size - pad * 2 - 120);
  const lineHeight = 96;
  const startY = 625 + (lines.length === 1 ? 0 : -((lines.length - 1) * lineHeight) / 2 + 20);
  lines.forEach((line, i) => ctx.fillText(line, size / 2, startY + i * lineHeight));

  ctx.font = `600 48px ${FONT}`;
  ctx.fillStyle = "#1C2321";
  ctx.fillText(onText, size / 2, 800);

  ctx.font = `600 34px ${FONT}`;
  ctx.fillStyle = "#5B665F";
  ctx.fillText("aayut1111.github.io/bin-it", size / 2, 880);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))), "image/png");
  });
}

function appUrl() {
  return window.location.href.split(/[?#]/)[0];
}

// Shares the badge picture if the device allows it (phones: WhatsApp,
// Instagram, etc.); otherwise downloads the PNG.
// Returns "shared" | "downloaded" | "cancelled".
export async function shareBadge({ earnedText, badgeLabel, onText, shareText }) {
  const blob = await renderBadgeCard({ earnedText, badgeLabel, onText });
  const file = new File([blob], "bin-it-badge.png", { type: "image/png" });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text: `${shareText} ${appUrl()}` });
      return "shared";
    } catch (err) {
      if (err && err.name === "AbortError") return "cancelled";
      // otherwise fall through to download
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "bin-it-badge.png";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return "downloaded";
}

// Shares plain text + link. Falls back to a WhatsApp link on desktop.
export async function shareLink(text) {
  const url = appUrl();
  if (navigator.share) {
    try {
      await navigator.share({ text, url });
      return "shared";
    } catch (err) {
      if (err && err.name === "AbortError") return "cancelled";
    }
  }
  window.open(
    `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
    "_blank",
    "noopener"
  );
  return "opened";
}