import { z } from "zod";

enum GAMES {
    HISTORY = "history",
}

export const params = z.object({
    type: z.nativeEnum(GAMES),
});

export const schema = {
    description: "Создание лобби для игры",
    tags: ["game"],
    params,
    security: [{ vkAuth: [] }],
};
