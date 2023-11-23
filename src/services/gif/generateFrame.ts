import { Canvas, loadImage } from "skia-canvas";
import { WebsocketServer_HistoryEvents_FinishGame_Msg } from "..";
import { clipper, fillTextMultiLine } from "./utils";

export async function generateFrame(
    msg: WebsocketServer_HistoryEvents_FinishGame_Msg,
) {
    if (!msg.owner) throw new Error("unreal");
    if (!msg.text) msg.text = "Чёт чел афкшил";
    const canvas = new Canvas(750, 500);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(
        await loadImage("/root/memology-backend/files/gif_frame_template.png"),
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

    const { width, fontBoundingBoxAscent } = ctx.measureText(msg.owner.name);
    ctx.fillText(msg.owner.name, 620 - width, 413 + fontBoundingBoxAscent);

    clipper(ctx, await loadImage(msg.owner.photo), 628, 375, 72, 72, 35);

    return ctx;
}
