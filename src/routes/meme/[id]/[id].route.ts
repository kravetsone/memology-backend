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

            const meme = await prisma.meme.findUnique({
                where: { id },
                select: {
                    id: true,
                    description: true,
                    title: true,
                    image: true,
                    likesCount: true,
                    inFavorites: {
                        where: {
                            user: {
                                vkId: +req.vkParams.vk_user_id,
                            },
                        },
                    },
                    inLikes: {
                        where: {
                            user: {
                                vkId: +req.vkParams.vk_user_id,
                            },
                        },
                    },
                    inDislikes: {
                        where: {
                            user: {
                                vkId: +req.vkParams.vk_user_id,
                            },
                        },
                    },
                    _count: {
                        select: {
                            inFavorites: true,
                            inLikes: true,
                            inDislikes: true,
                        },
                    },
                },
            });
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
                    commentsCount: 0,
                    ownerId: 70267059,
                    mark: meme.inLikes.length
                        ? Mark.LIKE
                        : (meme.inDislikes.length
                        ? Mark.DISLIKE
                        : undefined),
                }),
            );
        },
    );
};
