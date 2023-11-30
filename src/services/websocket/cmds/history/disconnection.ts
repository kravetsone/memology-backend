import { prisma } from "@db";
import { historyGame, SocketCommand } from "@services";

export const disconnectionCommand = new SocketCommand({
    game: "history",
    name: "disconnection",
    handler: async (connection, _) => {
        const room = await prisma.gameRoom.findUnique({
            where: {
                id: connection.roomId,
            },
            include: {
                users: {
                    select: {
                        vkId: true,
                    },
                },
                owner: {
                    select: {
                        vkId: true,
                    },
                },
            },
        });
        if (!room) return connection.socket.close();

        if (Number(room.owner.vkId) === connection.vkId) {
            const nextUser = room.users
                .filter((x) => Number(x.vkId) !== connection.vkId)
                .at(0);
            if (!nextUser) {
                await prisma.gameRoom.delete({
                    where: {
                        id: connection.roomId,
                    },
                });
                return connection.socket.close();
            }

            await prisma.gameRoom.update({
                where: {
                    id: connection.roomId,
                },
                data: {
                    users: {
                        disconnect: {
                            vkId: connection.vkId,
                        },
                    },
                    owner: {
                        connect: {
                            vkId: nextUser.vkId,
                        },
                    },
                },
            });

            return historyGame.leaveUser(connection, Number(nextUser.vkId));
        }
        await prisma.gameRoom.update({
            where: {
                id: connection.roomId,
            },
            data: {
                users: {
                    disconnect: {
                        vkId: connection.vkId,
                    },
                },
            },
        });

        historyGame.leaveUser(connection);
    },
});
