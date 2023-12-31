import { prisma } from "@db";
import { MemeListResponse } from "@services";
import { FastifyZodInstance } from "@types";
import { schema } from "./list.schema";

export const get = async (fastify: FastifyZodInstance) => {
    fastify.get(
        "/",
        {
            schema,
        },
        async (req, res) => {
            const { page, pageSize, query } = req.query;

            const [memes, count] = await prisma.meme.getList(query, {
                page,
                pageSize,
                vkId: +req.vkParams.vk_user_id,
            });
            console.log(memes, count);
            return res.header("content-type", "application/x-protobuf").send(
                MemeListResponse.toBinary({
                    count,
                    items: memes.map((meme) => ({
                        id: meme.id,
                        title: meme.title,
                        description: meme.description ?? undefined,
                        image: meme.image,
                        favoritesCount: meme._count.inFavorites,
                        commentsCount: meme._count.comments,
                        isFavorites: !!meme.inFavorites.length,
                        likesCount: meme.likesCount,
                        isSuggest: meme.isSuggest,
                    })),
                }),
            );
        },
    );
};
