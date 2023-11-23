import { GifEncoder } from "@skyra/gifenc";
import { buffer } from "node:stream/consumers";
import { FontLibrary } from "skia-canvas";
import { WebsocketServer_HistoryEvents_FinishGame_Msg } from "..";
import { generateFrame } from "./generateFrame";

FontLibrary.use([
    "/root/memology-backend/files/Inter-VariableFont_slnt,wght.ttf",
]);

export async function createGIF(
    dialog: WebsocketServer_HistoryEvents_FinishGame_Msg[],
) {
    const time = Date.now();
    console.log("start gif encode");
    const encoder = new GifEncoder(750, 500);
    const stream = encoder.createReadStream();
    encoder.setRepeat(0).setDelay(1000).setQuality(1).start();

    const frames = await Promise.all(dialog.map(generateFrame));

    for (const frame of frames) {
        encoder.addFrame(frame);
    }
    encoder.finish();

    const data = await buffer(stream);
    console.log("end gif encode", Date.now() - time);
    return data;
}
