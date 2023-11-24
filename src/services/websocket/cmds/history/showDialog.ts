import { prisma } from "@db";
import { historyGame } from "@services/games/history";
import { SocketCommand } from "@services/websocket/core";

export const sendTextCommand = new SocketCommand({
    game: "history",
    name: "showDialog",
    handler: async (connection, { dialogId }) => {
        const roomOwnerByUser = await prisma.gameRoom.findUnique({
            where: {
                id: connection.roomId,
                owner: {
                    vkId: connection.vkId,
                },
            },
        });
        if (!roomOwnerByUser) return;

        return historyGame.broadcastAll(connection, {
            showDialog: {
                dialogId,
            },
        });
    },
});
