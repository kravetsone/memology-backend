import { Canvas, loadImage } from "skia-canvas";
import { WebsocketServer_HistoryEvents_FinishGame_Msg } from "..";
import { clipper, fillTextMultiLine } from "./utils";

const margin = 10;
const cornerRadius = 10;
const rectHeight = 10;

export async function generateFrame(
    msg: WebsocketServer_HistoryEvents_FinishGame_Msg,
    index: number,
    msgsCount: number,
) {
    if (!msg.owner) throw new Error("unreal");
    if (!msg.text) msg.text = "Чёт чел афкшил";
    const canvas = new Canvas(750, 500);
    const { width, height } = canvas;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(
        await loadImage(process.cwd() + "/files/static/gif_frame_template.png"),
        0,
        0,
    );
    ctx.fillStyle = "#000000";
    ctx.font = "normal 20pt Inter";
    const lines = msg.text.match(/.{1,29}/g)!;
    console.log(lines);
    const lineMetrics = ctx.measureText(lines.at(0)!);
    fillTextMultiLine(
        ctx,
        lines,
        canvas,
        161 +
            lineMetrics.fontBoundingBoxAscent +
            lineMetrics.fontBoundingBoxDescent,
        428 + 10,
        315 +
            lineMetrics.fontBoundingBoxAscent +
            lineMetrics.fontBoundingBoxDescent,
    );

    ctx.fillStyle = "#ffffff";

    const metrics = ctx.measureText(msg.owner.name);
    ctx.fillText(
        msg.owner.name,
        620 - metrics.width,
        413 + metrics.fontBoundingBoxAscent,
    );

    clipper(ctx, await loadImage(msg.owner.photo), 628, 375, 72, 72, 35);

    const rectWidth = (width - margin * (msgsCount + 1)) / msgsCount;

    let x = margin;
    const y = height - rectHeight - margin;

    for (let i = 0; i < msgsCount; i++) {
        ctx.beginPath();
        ctx.moveTo(x + cornerRadius, y);
        ctx.lineTo(x + rectWidth - cornerRadius, y);
        ctx.quadraticCurveTo(x + rectWidth, y, x + rectWidth, y + cornerRadius);
        ctx.lineTo(x + rectWidth, y + rectHeight - cornerRadius);
        ctx.quadraticCurveTo(
            x + rectWidth,
            y + rectHeight,
            x + rectWidth - cornerRadius,
            y + rectHeight,
        );
        ctx.lineTo(x + cornerRadius, y + rectHeight);
        ctx.quadraticCurveTo(
            x,
            y + rectHeight,
            x,
            y + rectHeight - cornerRadius,
        );
        ctx.lineTo(x, y + cornerRadius);
        ctx.quadraticCurveTo(x, y, x + cornerRadius, y);
        ctx.closePath();
        ctx.fillStyle = `rgba(255, 255, 255, ${i === index ? 1 : 0.5})`;
        ctx.fill();
        x += rectWidth + margin;
    }

    return ctx;
}
