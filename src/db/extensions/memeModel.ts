import { Prisma, prisma } from "@db/prisma";
import { ListType } from "@types";

export interface IListItem {
    id: number;
    createdAt: Date;
    memeId: number;
    userId: number;
}

async function setLikes(memeId: number, likesCount: number) {
    return prisma.meme.update({
        where: {
            id: memeId,
        },
        data: {
            likesCount,
        },
    });
}

export const memeModelExtension = {
    model: {
        meme: {
            //TODO: REWRITE
            async addTo(
                type: ListType,
                {
                    vkId,
                    memeId,
                    likesCount,
                    inLikes,
                    inDislikes,
                    inFavorites,
                }: {
                    vkId: number;
                    memeId: number;
                    likesCount: number;
                    inLikes?: IListItem;
                    inDislikes?: IListItem;
                    inFavorites?: IListItem;
                },
            ) {
                console.log(type);

                //@ts-expect-error TODO: check this
                const data: Parameters<typeof prisma.like.create>[0] = {
                    data: {
                        user: {
                            connect: {
                                vkId,
                            },
                        },
                        meme: {
                            connect: {
                                id: memeId,
                            },
                        },
                    },
                };
                if (type === ListType.LIKE) {
                    if (inDislikes) {
                        await prisma.dislike.delete({
                            where: {
                                id: inDislikes.id,
                            },
                        });
                        await setLikes(memeId, likesCount + 2);
                        return prisma.like.create(data);
                    }
                    if (inLikes) {
                        await setLikes(memeId, likesCount - 1);
                        return prisma.like.delete({
                            where: {
                                id: inLikes.id,
                            },
                        });
                    }

                    await setLikes(memeId, likesCount + 1);
                    return prisma.like.create(data);
                }
                if (type === ListType.DISLIKE) {
                    if (inDislikes) {
                        await setLikes(memeId, likesCount + 1);
                        return prisma.dislike.delete({
                            where: {
                                id: inDislikes.id,
                            },
                        });
                    }
                    if (inLikes) {
                        await prisma.like.delete({
                            where: {
                                id: inLikes.id,
                            },
                        });
                        await setLikes(memeId, likesCount - 2);
                        return prisma.dislike.create(data);
                    }

                    await setLikes(memeId, likesCount - 1);
                    return prisma.dislike.create(data);
                }

                if (inFavorites)
                    return prisma.favorite.delete({
                        where: {
                            id: inFavorites.id,
                        },
                    });
                return prisma.favorite.create(data);
            },

            async get(id: number, vkId: number) {
                return prisma.meme.findUnique({
                    where: { id },
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
                                    vkId,
                                },
                            },
                        },
                        owner: {
                            select: {
                                vkId: true,
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
                        positionInRating: {
                            select: { index: true, type: true },
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
            },

            async getList(
                query: string,
                {
                    page,
                    pageSize,
                    vkId,
                }: {
                    page: number;
                    pageSize: number;
                    vkId: number;
                },
            ) {
                const context = Prisma.getExtensionContext(
                    this,
                ) as typeof prisma.meme;

                return context.findManyAndCount({
                    skip: (+page - 1) * +pageSize,
                    take: pageSize,
                    where: {
                        isSuggest: false,
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
                        updatedAt: "asc",
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
                                    vkId,
                                },
                            },
                        },
                        _count: {
                            select: {
                                inFavorites: true,
                            },
                        },
                    },
                });
            },
        },
    },
};
