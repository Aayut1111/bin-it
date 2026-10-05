// Replaces a rectangle of a canvas with a coarse, unreadable mosaic.
// Used for both the automatic face blur and the finger-painted blur.
export function pixelate(ctx, x, y, w, h, blockSize = 12) {
  const cw = ctx.canvas.width;
  const ch = ctx.canvas.height;
  const sx = Math.max(0, Math.floor(x));
  const sy = Math.max(0, Math.floor(y));
  const sw = Math.min(cw - sx, Math.ceil(w));
  const sh = Math.min(ch - sy, Math.ceil(h));
  if (sw <= 0 || sh <= 0) return;

  const tiny = document.createElement("canvas");
  tiny.width = Math.max(1, Math.round(sw / blockSize));
  tiny.height = Math.max(1, Math.round(sh / blockSize));
  tiny.getContext("2d").drawImage(ctx.canvas, sx, sy, sw, sh, 0, 0, tiny.width, tiny.height);

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(tiny, 0, 0, tiny.width, tiny.height, sx, sy, sw, sh);
  ctx.restore();
}