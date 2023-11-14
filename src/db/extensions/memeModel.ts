import { Prisma, prisma, User } from "@db/prisma";
import { ListType } from "@types";

export interface IListItem {
    id: number;
    createdAt: Date;
    memeId: number;
    userId: number;
}

export const memeModelExtension = {
    model: {
        meme: {
            //TODO: REWRITE
            async addTo(
                type: ListType,
                {
                    user,
                    memeId,
                    inLikes,
                    inDislikes,
                    inFavorites,
                }: {
                    user: User;
                    memeId: number;
                    inLikes?: IListItem;
                    inDislikes?: IListItem;
                    inFavorites?: IListItem;
                },
            ) {
                const data: Parameters<typeof prisma.like.create>[0] = {
                    data: {
                        user: {
                            connect: {
                                id: user.id,
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
                    }
                    if (inLikes) {
                        return prisma.like.delete({
                            where: {
                                id: inLikes.id,
                            },
                        });
                    }
                    return prisma.like.create(data);
                }
                if (type === ListType.DISLIKE) {
                    if (inDislikes) {
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
                    }
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
                                inLikes: true,
                                inDislikes: true,
                            },
                        },
                    },
                });
            },
        },
    },
};
