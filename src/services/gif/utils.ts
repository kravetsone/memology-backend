import { Canvas, CanvasRenderingContext2D, Image } from "skia-canvas";

export function clipper(
    ctx: CanvasRenderingContext2D,
    img: Image,
    x: number,
    y: number,
    w: number,
    h: number,
    rad: number,
) {
    ctx.beginPath();
    ctx.arc(x + rad, y + rad, rad, Math.PI, Math.PI + Math.PI / 2, false);
    ctx.lineTo(x + w - rad, y);
    ctx.arc(
        x + w - rad,
        y + rad,
        rad,
        Math.PI + Math.PI / 2,
        Math.PI * 2,
        false,
    );
    ctx.lineTo(x + w, y + h - rad);
    ctx.arc(x + w - rad, y + h - rad, rad, Math.PI * 2, Math.PI / 2, false);
    ctx.lineTo(x + rad, y + h);
    ctx.arc(x + rad, y + h - rad, rad, Math.PI / 2, Math.PI, false);
    ctx.closePath();
    ctx.save();
    ctx.clip();
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();
}

export function fillTextMultiLine(
    ctx: CanvasRenderingContext2D,
    lines: string[],
    canvas: Canvas,
    y: number,
    maxWidth: number,
    maxHeight: number,
) {
    let height = y;
    const lineHeight = ctx.measureText("M").width * 1.2;
    if (lines.length >= 3) height -= 10;
    const lineMetrics = ctx.measureText(lines.at(0)!);
    for (const line of lines) {
        const x = canvas.width / 2 - lineMetrics.width / 2;

        ctx.fillText(line, x < 161 ? 161 : x, height, maxWidth);
        height += lineHeight;

        if (maxHeight < height) break;
    }
    return height;
}
