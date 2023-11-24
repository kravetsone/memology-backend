import { GifEncoder } from "@skyra/gifenc";
import { buffer } from "node:stream/consumers";
import { FontLibrary } from "skia-canvas";
import { vk, vkUser, WebsocketServer_HistoryEvents_FinishGame_Msg } from "..";
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

    const frames = await Promise.all(
        dialog.map(async (msg, index) => ({
            id: index,
            buffer: await generateFrame(msg, index, dialog.length),
        })),
    );
    frames.sort((a, b) => a.id - b.id);
    for (const frame of frames) {
        encoder.addFrame(frame.buffer);
    }
    encoder.finish();

    const data = await buffer(stream);

    const doc = await vkUser.upload
        .wallDocument({
            group_id: 223365328,
            title: "history.gif",
            source: {
                value: data,

                contentType: "image/gif",
            },
        })
        .then((x) => x.toString())
        .catch(() => null);
    console.log(doc);
    console.log("end gif encode", Date.now() - time);
    return [doc, data] as const;
}
