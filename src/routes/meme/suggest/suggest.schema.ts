import { z } from "zod";

export const bodySchema = z.object({
    title: z
        .string()
        .min(5, "Минимальная длина названия - 5 символов")
        .max(50, "Максимальная длина названия - 50 символов"),
    description: z.string().optional(),
});

export const schema = {
    hide: true,
    description: "Предложить мем",
    tags: ["meme"],
    consumes: ["multipart/form-data"],
    body: {
        type: "object",
        required: ["myField"],
        properties: {
            myField: { isFile: true },
        },
        additionalProperties: true,
    },
    security: [{ vkAuth: [] }],
};
