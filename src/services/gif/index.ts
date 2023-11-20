import { Gif } from "make-a-gif-commonjs";
import { Canvas } from "skia-canvas";

export async function createGIF() {
    const gif = new Gif(500, 500);
    const canvas = new Canvas(500, 500);
    const ctx = canvas.getContext("2d");

    // red rectangle
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(0, 0, 500, 500);

    gif.addFrame({
        src: await canvas.toBuffer("jpg"),
        duration: 100,
    });

    // blue rectangle
    ctx.fillStyle = "#0000ff";
    ctx.fillRect(0, 0, 500, 500);

    gif.addFrame({
        src: await canvas.toBuffer("jpg"),
        duration: 100,
    });
    //[INFO] On first generation gif not play. TODO: fix that
    await gif.encode();
    return gif.encode();
}
