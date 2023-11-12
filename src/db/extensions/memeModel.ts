import { Prisma, prisma } from "@db/prisma";

export const memeModelExtension = {
    model: {
        meme: {
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
