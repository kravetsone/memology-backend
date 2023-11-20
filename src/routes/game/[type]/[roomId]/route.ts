import { GameStatus, prisma } from "@db";
import { APIError, ErrorCode } from "@services/errors";
import { GetRoomInfoResponse } from "@services/protobuf";
import { FastifyZodInstance } from "@types";
import { schema } from "./schema";

export const get = async (fastify: FastifyZodInstance) => {
    fastify.get(
        "/",
        {
            schema,
        },
        async (req, res) => {
            const { roomId } = req.params;

            const room = await prisma.gameRoom.findUnique({
                where: {
                    id: roomId,
                },
                include: {
                    owner: {
                        select: {
                            vkId: true,
                        },
                    },
                },
            });
            if (!room)
                throw new APIError(
                    ErrorCode.NOT_EXISTS,
                    "Это лобби не существует",
                );
            if (room.status !== GameStatus.CREATED)
                throw new APIError(ErrorCode.GAME_STARTED);

            return res.header("content-type", "application/text").send(
                GetRoomInfoResponse.toBinary({
                    roomId: room.id,
                    ownerVkId: Number(room.owner.vkId),
                }),
            );
        },
    );
};
