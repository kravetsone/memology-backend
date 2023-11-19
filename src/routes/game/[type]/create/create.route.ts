import { GameType, prisma } from "@db";
import { FastifyZodInstance } from "@types";
import { createHash } from "node:crypto";
import { schema } from "./create.schema";

export const get = async (fastify: FastifyZodInstance) => {
    fastify.get(
        "/",
        {
            schema,
        },
        async (req, res) => {
            const roomId = createHash("sha1")
                .update(Date.now() + "" + req.vkParams.vk_user_id)
                .digest("hex")
                .slice(0, 16);

            await prisma.gameRoom.create({
                data: {
                    id: roomId,
                    type: GameType.HISTORY,
                    owner: {
                        connect: {
                            vkId: Number(req.vkParams.vk_user_id),
                        },
                    },
                },
            });

            return res.header("content-type", "application/text").send(roomId);
        },
    );
};
