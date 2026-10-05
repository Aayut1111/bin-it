import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import { blurFaces } from "../utils/faceBlur";
import { pixelate } from "../utils/pixelate";

const BRUSH = 56; // brush size in photo pixels
const MAX_UNDO = 12;

export default function PhotoPrivacyEditor({ src, onDone, onCancel }) {
  const { t } = useLanguage();
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const lastPoint = useRef(null);
  const history = useRef([]);
  const [status, setStatus] = useState({ kind: "scanning" }); // scanning | found | none | failed
  const [canUndo, setCanUndo] = useState(false);

  // Draw the photo, then look for faces and blur them.
  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.onload = async () => {
      const canvas = canvasRef.current;
      if (!canvas || cancelled) return;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext("2d").drawImage(img, 0, 0);
      try {
        const n = await blurFaces(canvas);
        if (!cancelled) setStatus(n > 0 ? { kind: "found", n } : { kind: "none" });
      } catch {
        if (!cancelled) setStatus({ kind: "failed" });
      }
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  const scanning = status.kind === "scanning";

  function toCanvasPoint(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) * canvas.width) / rect.width,
      y: ((e.clientY - rect.top) * canvas.height) / rect.height,
    };
  }

  function stamp(point) {
    const ctx = canvasRef.current.getContext("2d");
    pixelate(ctx, point.x - BRUSH / 2, point.y - BRUSH / 2, BRUSH, BRUSH, 14);
  }

  function handlePointerDown(e) {
    if (scanning) return;
    const canvas = canvasRef.current;
    canvas.setPointerCapture(e.pointerId);
    history.current.push(canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height));
    if (history.current.length > MAX_UNDO) history.current.shift();
    setCanUndo(true);
    drawing.current = true;
    const p = toCanvasPoint(e);
    lastPoint.current = p;
    stamp(p);
  }

  function handlePointerMove(e) {
    if (!drawing.current) return;
    const p = toCanvasPoint(e);
    const last = lastPoint.current;
    const dist = Math.hypot(p.x - last.x, p.y - last.y);
    const steps = Math.max(1, Math.ceil(dist / (BRUSH / 3)));
    for (let i = 1; i <= steps; i++) {
      stamp({ x: last.x + ((p.x - last.x) * i) / steps, y: last.y + ((p.y - last.y) * i) / steps });
    }
    lastPoint.current = p;
  }

  function handlePointerUp() {
    drawing.current = false;
  }

  function undo() {
    const snapshot = history.current.pop();
    if (snapshot) canvasRef.current.getContext("2d").putImageData(snapshot, 0, 0);
    setCanUndo(history.current.length > 0);
  }

  function use() {
    onDone(canvasRef.current.toDataURL("image/jpeg", 0.7));
  }

  let message = t("photo.scanning");
  if (status.kind === "found") message = t("photo.faces", { n: status.n });
  if (status.kind === "none") message = t("photo.noFaces");
  if (status.kind === "failed") message = t("photo.scanFailed");

  return (
    <div className="photo-editor-backdrop" role="dialog" aria-modal="true">
      <div className="photo-editor">
        <h3 className="photo-editor-title">🛡️ {t("photo.title")}</h3>
        <p className="photo-editor-help">{t("photo.help")}</p>

        <canvas
          ref={canvasRef}
          className="photo-editor-canvas"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />

        <p className={`photo-editor-status ${status.kind}`}>{message}</p>

        <div className="photo-editor-actions">
          <button type="button" className="photo-editor-secondary" onClick={onCancel}>
            {t("photo.cancel")}
          </button>
          <button
            type="button"
            className="photo-editor-secondary"
            onClick={undo}
            disabled={!canUndo}
          >
            {t("photo.undo")}
          </button>
          <button type="button" className="photo-editor-primary" onClick={use} disabled={scanning}>
            {t("photo.use")}
          </button>
        </div>
      </div>
    </div>
  );
}