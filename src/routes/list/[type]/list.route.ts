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
            if (req.params.type === "my") {
                const [memes, count] = await prisma.meme.findManyAndCount({
                    skip: (+page - 1) * +pageSize,
                    take: pageSize,
                    where: {
                        isSuggest: true,
                        owner: {
                            vkId: +req.vkParams.vk_user_id,
                        },
                        OR: [
                            {
                                title: {
                                    contains: query,
                                    mode: "insensitive",
                                },
                            },
                            {
                                description: {
                                    contains: query,
                                    mode: "insensitive",
                                },
                            },
                        ],
                    },
                    orderBy: {
                        createdAt: "asc",
                    },
                    select: {
                        id: true,
                        description: true,
                        title: true,
                        image: true,
                        likesCount: true,
                        isSuggest: true,
                        inFavorites: {
                            where: {
                                user: {
                                    vkId: +req.vkParams.vk_user_id,
                                },
                            },
                        },
                        _count: {
                            select: {
                                inFavorites: true,
                                comments: true,
                            },
                        },
                    },
                });
                console.log(memes);
                return res
                    .header("content-type", "application/x-protobuf")
                    .send(
                        MemeListResponse.toBinary({
                            count,
                            items: memes.map((meme) => ({
                                id: meme.id,
                                title: meme.title,
                                description: meme.description ?? undefined,
                                image: meme.image,
                                favoritesCount: meme._count.inFavorites,
                                isFavorites: !!meme.inFavorites,
                                likesCount: meme.likesCount,
                                commentsCount: meme._count.comments,
                                isSuggest: meme.isSuggest,
                            })),
                        }),
                    );
            }
            const [memes, count] =
                await //[INFO]: Some hack. Type params already validated
                (
                    prisma[req.params.type] as typeof prisma.favorite
                ).findManyAndCount({
                    skip: (+page - 1) * +pageSize,
                    take: pageSize,
                    where: {
                        user: {
                            vkId: +req.vkParams.vk_user_id,
                        },
                        meme: {
                            OR: [
                                {
                                    title: {
                                        contains: query,
                                        mode: "insensitive",
                                    },
                                },
                                {
                                    description: {
                                        contains: query,
                                        mode: "insensitive",
                                    },
                                },
                            ],
                        },
                    },
                    orderBy: {
                        createdAt: "asc",
                    },
                    select: {
                        meme: {
                            select: {
                                id: true,
                                description: true,
                                title: true,
                                image: true,
                                likesCount: true,
                                isSuggest: true,
                                inFavorites: {
                                    where: {
                                        user: {
                                            vkId: +req.vkParams.vk_user_id,
                                        },
                                    },
                                },
                                _count: {
                                    select: {
                                        inFavorites: true,
                                        comments: true,
                                    },
                                },
                            },
                        },
                    },
                });
            console.log(memes, count);
            return res.header("content-type", "application/x-protobuf").send(
                MemeListResponse.toBinary({
                    count,
                    items: memes.map(({ meme }) => ({
                        id: meme.id,
                        title: meme.title,
                        description: meme.description ?? undefined,
                        image: meme.image,
                        favoritesCount: meme._count.inFavorites,
                        commentsCount: meme._count.comments,
                        isFavorites: !!meme.inFavorites,
                        likesCount: meme.likesCount,
                        isSuggest: meme.isSuggest,
                    })),
                }),
            );
        },
    );
};
