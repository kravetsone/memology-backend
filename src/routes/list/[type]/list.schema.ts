import { z } from "zod";

const params = z.object({
    type: z.union([
        z.literal("favorite"),
        z.literal("like"),
        z.literal("dislike"),
        z.literal("my"),
    ]),
});

const querystring = z.object({
    query: z.string().default(""),
    page: z.preprocess(Number, z.number()),
    pageSize: z.preprocess(Number, z.number()).default(20),
});

export const schema = {
    description:
        "Получение списка мемов которые находятся в списках у пользователя",
    tags: ["list"],
    params,
    querystring,
    security: [{ vkAuth: [] }],
};
