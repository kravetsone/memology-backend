import { prisma } from "@db";
import { APIError, ErrorCode } from "@services";
import { FastifyZodInstance } from "@types";
import { schema } from "./[listType].schema";

export const get = async (fastify: FastifyZodInstance) => {
    fastify.get(
        "/",
        {
            schema,
        },
        async (req, res) => {
            const { listType, id } = req.params;

            const vkId = +req.vkParams.vk_user_id;

            const meme = await prisma.meme.findUnique({
                where: { id },
                select: {
                    id: true,
                    likesCount: true,
                    inFavorites: {
                        where: {
                            user: {
                                vkId,
                            },
                        },
                    },
                    inLikes: {
                        where: {
                            user: {
                                vkId,
                            },
                        },
                    },
                    inDislikes: {
                        where: {
                            user: {
                                vkId,
                            },
                        },
                    },
                },
            });
            if (!meme)
                throw new APIError(
                    ErrorCode.NOT_EXISTS,
                    "Этого мема не существует"
                );

            await prisma.meme.addTo(listType, {
                vkId,
                memeId: meme.id,
                likesCount: meme.likesCount,
                inDislikes: meme.inDislikes.at(0),
                inLikes: meme.inLikes.at(0),
                inFavorites: meme.inFavorites.at(0),
            });

            return res.header("content-type", "application/x-protobuf").send();
        }
    );
};
