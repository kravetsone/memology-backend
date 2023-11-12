import { prisma } from "@db";
import { UserResponse_UserItem } from "@services/protobuf/user";
import { FastifyZodInstance } from "@types";
import { schema } from "./user.schema";

export const get = async (fastify: FastifyZodInstance) => {
    fastify.get(
        "/",
        {
            schema,
        },
        async (req, res) => {
            const user = await prisma.user.signInOrUp(+req.vkParams.vk_user_id);

            return res.header("content-type", "application/x-protobuf").send(
                UserResponse_UserItem.toBinary({
                    id: user.id,
                    name: user.name,
                    likesCount: user._count.likes,
                    dislikesCount: user._count.dislikes,
                    favoritesCount: user._count.favorites,
                }),
            );
        },
    );
};
