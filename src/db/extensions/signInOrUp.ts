import { prisma } from "@db/prisma";
import { Prisma, User } from "@prisma/client";
import { vk } from "@services/vk-io";

export const signInOrUpExtension = {
    model: {
        user: {
            async signInOrUp(vkId: number) {
                const user = await prisma.user.findFirst({
                    where: {
                        vkId,
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
                    });

                    return newUser;
                }

                return user;
            },
        },
    },
};
