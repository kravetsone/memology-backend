import { z } from "zod";

const params = z.object({
    id: z.preprocess(Number, z.number()),
});

const querystring = z.object({
    page: z.preprocess(Number, z.number()),
    pageSize: z.preprocess(Number, z.number()).default(20),
});

export const schema = {
    description: "Получение списка комментариев у мема",
    tags: ["meme"],
    querystring,
    params,
    security: [{ vkAuth: [] }],
};
