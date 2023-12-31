import { GameStatus, prisma } from "@db";
import { historyGame, SocketCommand } from "@services";

export const connectionCommand = new SocketCommand({
    game: "history",
    name: "connection",
    handler: async (connection, _) => {
        const room = await prisma.gameRoom.findUnique({
            where: {
                id: connection.roomId,
                status: GameStatus.CREATED,
                users: {
                    none: {
                        vkId: connection.vkId,
                    },
                },
            },
            include: {
                owner: {
                    select: { vkId: true },
                },
            },
        });
        console.log(room);
        if (!room) return connection.socket.close();

        await prisma.gameRoom.update({
            where: {
                id: connection.roomId,
            },
            data: {
                users: {
                    connect: {
                        vkId: connection.vkId,
                    },
                },
            },
        });

        if (Number(room.owner.vkId) === connection.vkId)
            connection.isOwner = true;

        historyGame.joinUser(connection);
    },
});
