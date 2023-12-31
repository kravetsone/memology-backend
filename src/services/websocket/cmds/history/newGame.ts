import { prisma } from "@db";
import { historyGame, SocketCommand } from "@services";

export const newGameCommand = new SocketCommand({
    game: "history",
    name: "newGame",
    handler: async (connection) => {
        const roomOwnerByUser = await prisma.gameRoom.findUnique({
            where: {
                id: connection.roomId,
                owner: {
                    vkId: connection.vkId,
                },
            },
        });
        if (!roomOwnerByUser) return;

        return historyGame.startNewGame(connection);
    },
});
