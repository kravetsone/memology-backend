import { RatingType } from "@types";
import { z } from "zod";

const params = z.object({
    type: z.nativeEnum(RatingType),
});

const querystring = z.object({
    page: z.preprocess(Number, z.number()),
    pageSize: z.preprocess(Number, z.number()).default(20),
});

export const schema = {
    description: "Получение рейтинга мемов",
    tags: ["rating"],
    querystring,
    params,
    security: [{ vkAuth: [] }],
};
