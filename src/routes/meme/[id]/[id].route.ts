import { prisma } from "@db";
import { APIError, ErrorCode } from "@services/errors";
import { Mark, MemeResponse } from "@services/protobuf/meme";
import { FastifyZodInstance } from "@types";
import { schema } from "./[id].schema";

export const get = async (fastify: FastifyZodInstance) => {
    fastify.get(
        "/",
        {
            schema,
        },
        async (req, res) => {
            const { id } = req.params;

            const meme = await prisma.meme.get(id, +req.vkParams.vk_user_id);
            if (!meme)
                throw new APIError(
                    ErrorCode.NOT_EXISTS,
                    "Этого мема не существует",
                );
            console.log(meme);

            return res.header("content-type", "application/x-protobuf").send(
                MemeResponse.toBinary({
                    id: meme.id,
                    title: meme.title,
                    image: meme.image,
                    description: meme.description ?? undefined,
                    favoritesCount: meme._count.inFavorites,
                    isFavorites: !!meme.inFavorites.length,
                    likesCount: meme.likesCount,
                    commentsCount: meme._count.comments,
                    ownerId: Number(meme.owner.vkId),
                    mark: meme.inLikes.length
                        ? Mark.LIKE
                        : meme.inDislikes.length
                          ? Mark.DISLIKE
                          : undefined,
                }),
            );
        },
    );
};
