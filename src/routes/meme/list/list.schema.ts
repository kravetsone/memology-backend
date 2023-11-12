import { z } from "zod";

const querystring = z.object({
    query: z.string().default(""),
    page: z.preprocess(Number, z.number()),
    pageSize: z.preprocess(Number, z.number()).default(20),
});

export const schema = {
    description: "Получение списка мемов",
    tags: ["app"],
    querystring,
};
