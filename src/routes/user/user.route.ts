import { prisma } from "@db";
import { UserResponse_UserItem } from "@services/protobuf/user";
import { vk } from "@services/vk-io";
import { FastifyZodInstance } from "@types";
import { schema } from "./user.schema";

export const get = async (fastify: FastifyZodInstance) => {
    fastify.get(
        "/",
        {
            schema,
        },
        async (req, res) => {
            const user = await prisma.user.findFirst({
                where: {
                    vkId: +req.vkParams.vk_user_id,
                },
            });
            //TODO: implement findOrCreate
            if (!user) {
                const [vkUser] = await vk.api.users.get({
                    user_ids: [req.vkParams.vk_user_id],
                });
                const newUser = await prisma.user.create({
                    data: {
                        vkId: +req.vkParams.vk_user_id,
                        name: `${vkUser.first_name} ${vkUser.last_name}`,
                    },
                });

                return res
                    .header("content-type", "application/x-protobuf")
                    .send(
                        UserResponse_UserItem.toBinary({
                            id: newUser.id,
                            name: newUser.name,
                        }),
                    );
            }

            return res.header("content-type", "application/x-protobuf").send(
                UserResponse_UserItem.toBinary({
                    id: user.id,
                    name: user.name,
                }),
            );
        },
    );
};
