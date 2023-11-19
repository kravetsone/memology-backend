import { GameStatus, prisma } from "@db";
import { historyGame } from "@services/games/history";
import { SocketCommand } from "@services/websocket/core";

export const connectionCommand = new SocketCommand({
    game: "history",
    name: "startGame",
    handler: async (connection) => {
        const roomOwnerByUser = await prisma.gameRoom.findUnique({
            where: {
                id: connection.roomId,
                owner: {
                    vkId: connection.vkId,
                },
            },
            select: {
                _count: {
                    select: {
                        users: true,
                    },
                },
            },
        });
        if (!roomOwnerByUser) return;

        // if (roomOwnerByUser._count.users !== 2)
        //     return connection.send({
        //         showSnackbar: {
        //             message: "Игру можно начать только для 2 игроков!",
        //         },
        //     });

        await prisma.gameRoom.update({
            where: {
                id: connection.roomId,
            },
            data: {
                status: GameStatus.STARTED,
            },
        });

        return historyGame.startGame(connection);
    },
});
