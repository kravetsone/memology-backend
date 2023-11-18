import { prisma } from "@db";
import { historyGame } from "@services/games/history";
import { SocketCommand } from "@services/websocket/core";

export const connectionCommand = new SocketCommand({
    game: "history",
    name: "kickUser",
    handler: async (connection, { vkId }) => {
        const isRoomOwnerByUser = await prisma.gameRoom.findUnique({
            where: {
                id: connection.roomId,
                owner: {
                    vkId: connection.vkId,
                },
            },
        });
        if (!isRoomOwnerByUser) return;

        historyGame.kickUser(connection, vkId);
    },
});
