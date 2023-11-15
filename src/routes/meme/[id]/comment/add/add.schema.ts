import { z } from "zod";

const params = z.object({
    id: z.preprocess(Number, z.number()),
});

const body = z
    .string()
    .min(5, "Текст комментария не может содержать менее 5 символов")
    .max(150, "Текст комментария не может содержать более 150 символов");

export const schema = {
    description: "Добавление комментария к мему",
    tags: ["meme"],
    params,
    body,
    security: [{ vkAuth: [] }],
};
