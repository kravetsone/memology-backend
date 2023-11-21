import { GAMES } from "@types";
import { z } from "zod";

export const params = z.object({
    roomId: z.string(),
    type: z.nativeEnum(GAMES),
});

export const schema = {
    description: "Получение информации о лобби",
    tags: ["game"],
    params,
    security: [{ vkAuth: [] }],
};
