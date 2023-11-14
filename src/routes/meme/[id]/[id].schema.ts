import { z } from "zod";

const params = z.object({
    id: z.preprocess(Number, z.number()),
});

export const schema = {
    description: "Получение мема",
    tags: ["meme"],
    params,
    security: [{ vkAuth: [] }],
};
