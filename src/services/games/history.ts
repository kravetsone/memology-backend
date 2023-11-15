import { SocketStream } from "@fastify/websocket";
import { ICustomMethod } from "@types";

export class HistoryGame {
    rooms: Record<string, (SocketStream & ICustomMethod)[]>;

    joinUser(connection: SocketStream & ICustomMethod) {
        const room = this.rooms[connection.roomId];

        if (!room) {
            this.rooms[connection.roomId] = [connection];
            return;
        }

        this.broadcast(connection, { userJoined: { vkId: connection.vkId } });

        room.push(connection);
    }

    broadcast(
        connection: SocketStream & ICustomMethod,
        msg: Parameters<(SocketStream & ICustomMethod)["send"]>[0],
    ) {
        const room = this.rooms[connection.roomId];

        room.map((x) => x.send(msg));
    }
}

export const historyGame = new HistoryGame();
