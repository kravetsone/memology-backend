import { prisma } from "@db";
import { Mark, MemeRatingResponse } from "@services";
import { FastifyZodInstance, RatingType } from "@types";
import { DateTime } from "luxon";
import { schema } from "./type.schema";

export const get = async (fastify: FastifyZodInstance) => {
    fastify.get(
        "/",
        {
            schema,
        },
        async (req, res) => {
            const { page, pageSize } = req.query;

            const [memes, count] = await prisma.meme.findManyAndCount({
                where: {
                    isSuggest: false,
                    ...(req.params.type === RatingType.WEEKLY
                        ? {
                              createdAt: {
                                  gt: DateTime.now()
                                      .minus({ week: 1 })
                                      .startOf("day")
                                      .toJSDate(),
                              },
                          }
                        : {}),
                },
                orderBy: [
                    {
                        likesCount: "desc",
                    },
                    {
                        id: "desc",
                    },
                ],
                skip: (+page - 1) * +pageSize,
                take: pageSize,
                select: {
                    id: true,
                    title: true,
                    description: true,
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
                            comments: true,
                        },
                    },
                },
            });

            return res.header("content-type", "application/x-protobuf").send(
                MemeRatingResponse.toBinary({
                    count,
                    items: memes.map((meme, index) => ({
                        id: meme.id,
                        place: index + 1,
                        title: meme.title,
                        description: meme.description ?? undefined,
                        image: meme.image,
                        favoritesCount: meme._count.inFavorites,
                        isFavorites: !!meme.inFavorites.length,
                        likesCount: meme.likesCount,
                        commentsCount: meme._count.comments,
                        mark: meme.inLikes.length
                            ? Mark.LIKE
                            : (meme.inDislikes.length
                              ? Mark.DISLIKE
                              : undefined),
                    })),
                }),
            );
        },
    );
};
