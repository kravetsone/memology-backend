import { prisma } from "@db/prisma";
import { vk } from "@services/vk-io";

export const signInOrUpExtension = {
    model: {
        user: {
            async signInOrUp(vkId: number) {
                const user = await prisma.user.findFirst({
                    where: {
                        vkId,
                    },
                    select: {
                        id: true,
                        name: true,
                        vkId: true,
                        _count: {
                            select: {
                                likes: true,
                                dislikes: true,
                                favorites: true,
                                memes: {
                                    where: {
                                        owner: {
                                            vkId,
                                        },
                                    },
                                },
                            },
                        },
                    },
                });

                if (!user) {
                    const [vkUser] = await vk.api.users.get({
                        user_ids: [vkId],
                    });

                    const newUser = await prisma.user.create({
                        data: {
                            vkId,
                            name: `${vkUser.first_name} ${vkUser.last_name}`,
                        },
                        select: {
                            id: true,
                            name: true,
                            vkId: true,
                            _count: {
                                select: {
                                    likes: true,
                                    dislikes: true,
                                    favorites: true,
                                    memes: {
                                        where: {
                                            owner: {
                                                vkId,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    });

                    return newUser;
                }

                return user;
            },
        },
    },
};
