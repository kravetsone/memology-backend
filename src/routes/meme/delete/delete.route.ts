import { prisma } from "@db";
import { APIError, ErrorCode } from "@services";
import { FastifyZodInstance } from "@types";
import { schema } from "./delete.schema";

export const deleteMeme = async (fastify: FastifyZodInstance) => {
    fastify.delete(
        "/",
        {
            schema,
        },
        async (req, res) => {
            const { id } = req.params;

            const meme = await prisma.meme.findFirst({
                where: {
                    id,
                },
                include: {
                    owner: {
                        select: {
                            vkId: true,
                        },
                    },
                },
            });
            if (!meme)
                throw new APIError(
                    ErrorCode.NOT_EXISTS,
                    "Этот мем не существует",
                );
            if (Number(meme.owner.vkId) !== +req.vkParams.vk_user_id)
                throw new APIError(
                    ErrorCode.NOT_OWNER,
                    "Вы не владелец этого мема",
                );

            await prisma.meme.delete({
                where: {
                    id,
                },
            });

            return res.header("content-type", "application/x-protobuf").send();
        },
    );
};
