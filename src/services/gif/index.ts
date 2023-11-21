import { Gif } from "make-a-gif-commonjs";
import { FontLibrary } from "skia-canvas";
import { WebsocketServer_HistoryEvents_FinishGame_Msg } from "..";
import { generateFrame } from "./generateFrame";

FontLibrary.use([
    "/root/memology-backend/files/Inter-VariableFont_slnt,wght.ttf",
]);

export async function createGIF(
    dialog: WebsocketServer_HistoryEvents_FinishGame_Msg[],
) {
    const gif = new Gif(750, 500, 15);
    await Promise.all(
        dialog.map(async (msg) => {
            console.log(msg);
            await gif.addFrame({
                src: await generateFrame(msg),
                duration: 1000,
            });
        }),
    );

    return gif.encode();
}
