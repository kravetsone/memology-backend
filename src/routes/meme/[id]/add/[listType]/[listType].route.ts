import { prisma } from "@db";
import { APIError, ErrorCode } from "@services/errors";
import { Mark, MemeItem, MemeResponse } from "@services/protobuf/meme";
import { FastifyZodInstance, ListType } from "@types";
import { schema } from "./[listType].schema";

export const get = async (fastify: FastifyZodInstance) => {
    fastify.get(
        "/",
        {
            schema,
        },
        async (req, res) => {
            const { listType, id } = req.params;

            const user = await prisma.user.findUniqueOrThrow({
                where: {
                    vkId: +req.vkParams.vk_user_id,
                },
            });

            const meme = await prisma.meme.findUnique({
                where: { id },
                select: {
                    id: true,
                    inFavorites: {
                        where: {
                            user: {
                                vkId: user.vkId,
                            },
                        },
                    },
                    inLikes: {
                        where: {
                            user: {
                                vkId: user.vkId,
                            },
                        },
                    },
                    inDislikes: {
                        where: {
                            user: {
                                vkId: user.vkId,
                            },
                        },
                    },
                },
            });
            if (!meme)
                throw new APIError(
                    ErrorCode.NOT_EXISTS,
                    "Этого мема не существует",
                );

            await prisma.meme.addTo(listType, {
                user,
                memeId: meme.id,
                inDislikes: meme.inDislikes.at(0),
                inLikes: meme.inLikes.at(0),
                inFavorites: meme.inFavorites.at(0),
            });

            return res.header("content-type", "application/x-protobuf").send();
        },
    );
};
