import { prisma } from "@db";
import { APIError, ErrorCode } from "@services/errors";
import { FastifyZodInstance } from "@types";
import { schema } from "./add.schema";

export const get = async (fastify: FastifyZodInstance) => {
    fastify.post(
        "/",
        {
            schema,
        },
        async (req, res) => {
            const { id } = req.params;

            const meme = await prisma.meme.findUnique({
                where: { id },
            });
            if (!meme)
                throw new APIError(
                    ErrorCode.NOT_EXISTS,
                    "Этого мема не существует"
                );

            await prisma.comment.create({
                data: {
                    text: req.body,
                    user: {
                        connect: {
                            vkId: +req.vkParams.vk_user_id,
                        },
                    },
                    meme: {
                        connect: {
                            id: meme.id,
                        },
                    },
                },
            });

            return res.header("content-type", "application/x-protobuf").send();
        }
    );
};
