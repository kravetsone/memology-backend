import { TCustomConnection } from "@types";

export class HistoryGame {
    rooms: Record<string, TCustomConnection[]>;

    joinUser(connection: TCustomConnection) {
        const room = this.rooms[connection.roomId];

        if (!room) {
            this.rooms[connection.roomId] = [connection];
            return;
        }

        this.broadcast(connection, { userJoined: { vkId: connection.vkId } });

        room.push(connection);
    }

    leaveUser(connection: TCustomConnection) {
        const room = this.rooms[connection.roomId];
        if (!room) return;

        const index = room.findIndex((x) => x.vkId === connection.vkId);
        if (index === -1) return;

        room.splice(index, 1);
    }

    broadcast(
        connection: TCustomConnection,
        msg: Parameters<TCustomConnection["send"]>[0],
    ) {
        const room = this.rooms[connection.roomId];

        room.map((x) => x.send(msg));
    }
}

export const historyGame = new HistoryGame();
