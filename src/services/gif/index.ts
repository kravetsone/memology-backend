import { IUserRound } from "@services/games/history";
import { Gif } from "make-a-gif-commonjs";
import { Canvas, FontLibrary, Image, loadImage } from "skia-canvas";
import { UsersGetResponse } from "vk-io/lib/api/schemas/responses";
import { vk } from "..";

FontLibrary.use({
    Inter: ["/root/memology-backend/files/Inter-VariableFont_slnt,wght.ttf"],
});

function clipper(
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

export async function generateFrame(text: string, vkData: UsersGetResponse) {
    const canvas = new Canvas(750, 500);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(
        await loadImage("/root/memology-backend/files/gif_frame_tempate.png"),
        0,
        0,
    );
    ctx.fillStyle = "#000000";
    ctx.font = "bold 20pt Inter";

    ctx.fillText(text, 276, 238);

    ctx.fillStyle = "#ffffff";
    //@ts-expect-error
    ctx.fillText(vkData.first_name + " " + vkData.last_name, 372, 418);
    //@ts-expect-error
    clipper(ctx, await loadImage(vkData.photo_200), 628, 375, 72, 72, 180);
    return canvas.toBuffer("jpg", { quality: 1 });
}

export async function createGIF(
    round: IUserRound[][],
    roundIndex: number,
    usersCount: number,
    vkDatas: Awaited<ReturnType<typeof vk.api.users.get>>[],
) {
    const gif = new Gif(750, 500, 30);
    const chat: IUserRound[] = [];
    let index = roundIndex;
    for (const [i, element] of round.entries()) {
        console.log(i, index);
        chat.push(element.at((index + 1) % usersCount)!);
        index++;
    }
    await Promise.all(
        chat.map(async (chat) => {
            console.log(chat);
            await gif.addFrame({
                src: await generateFrame(
                    chat.text,
                    //@ts-expect-error VK-IO types is bad
                    vkDatas.find((x) => x.id === chat.vkId)!,
                ),
                duration: 1000,
            });
        }),
    );

    //[INFO] On first generation gif not play. TODO: fix that
    await gif.encode();
    return gif.encode();
}
