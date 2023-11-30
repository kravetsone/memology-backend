import { prisma } from "@db";
import { APIError, ErrorCode } from "@services";
import { FastifyZodInstance } from "@types";
import { schema } from "./delete.schema";

export const get = async (fastify: FastifyZodInstance) => {
    fastify.get(
        "/",
        {
            schema,
        },
        async (req, res) => {
            const { commentId, id } = req.params;

            const comment = await prisma.comment.findFirst({
                where: {
                    id: commentId,
                    memeId: id,
                    user: {
                        vkId: +req.vkParams.vk_user_id,
                    },
                },
            });
            if (!comment)
                throw new APIError(
                    ErrorCode.NOT_EXISTS,
                    "Этого комментария не существует или он не принадлежит вам"
                );

            await prisma.comment.delete({
                where: {
                    id: comment.id,
                },
            });

            return res.header("content-type", "application/x-protobuf").send();
        }
    );
};
