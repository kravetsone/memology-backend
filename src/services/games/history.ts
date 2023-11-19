import { TCustomConnection } from "@types";

export class HistoryGame {
    rooms: Record<string, TCustomConnection[]>;

    constructor() {
        this.rooms = {};
    }

    joinUser(connection: TCustomConnection) {
        let room = this.rooms[connection.roomId];

        if (!room) {
            this.rooms[connection.roomId] = [connection];
            room = this.rooms[connection.roomId];
        } else room.push(connection);
        console.log(room);

        connection.send({
            lobbyInfo: {
                users: room.map((user) => ({
                    vkId: user.vkId,
                    isOwner: user.isOwner,
                })),
            },
        });
        this.broadcast(connection, {
            userJoined: { vkId: connection.vkId, isOwner: connection.isOwner },
        });
    }

    leaveUser(connection: TCustomConnection, newOwnerVkId?: number) {
        const room = this.rooms[connection.roomId];
        if (!room) return;

        const index = room.findIndex((x) => x.vkId === connection.vkId);
        if (index === -1) return;

        room.splice(index, 1);

        this.broadcast(connection, {
            userLeaved: { vkId: connection.vkId, newOwnerVkId },
        });
    }

    kickUser(connection: TCustomConnection, vkId: number) {
        const room = this.rooms[connection.roomId];
        if (!room) return;

        const index = room.findIndex((x) => x.vkId === vkId);
        if (index === -1) return;

        room.splice(index, 1);

        this.broadcastAll(connection, {
            userLeaved: { vkId },
        });
    }

    broadcast(
        connection: TCustomConnection,
        msg: Parameters<TCustomConnection["send"]>[0],
    ) {
        const room = this.rooms[connection.roomId];

        room.filter((c) => c.vkId !== connection.vkId).map((x) => x.send(msg));
    }

    broadcastAll(
        connection: TCustomConnection,
        msg: Parameters<TCustomConnection["send"]>[0],
    ) {
        const room = this.rooms[connection.roomId];

        room.map((x) => x.send(msg));
    }
}

export const historyGame = new HistoryGame();
