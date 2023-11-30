import { prisma } from "@db";
import { historyGame, SocketCommand } from "@services";

export const sendTextCommand = new SocketCommand({
    game: "history",
    name: "setCallData",
    handler: async (connection, { link }) => {
        const roomOwnerByUser = await prisma.gameRoom.findUnique({
            where: {
                id: connection.roomId,
                owner: {
                    vkId: connection.vkId,
                },
            },
        });
        if (!roomOwnerByUser) return;
        return historyGame.startCall(connection, link);
    },
});
