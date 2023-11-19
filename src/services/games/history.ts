import { GameStatus } from "@prisma/client";
import { TCustomConnection } from "@types";

interface IUserRound {
    vkId: number;
    text: string;
}

interface IRoomData {
    status: GameStatus;
    users: TCustomConnection[];
    time: number;
    timerId?: ReturnType<typeof setInterval>;
    rounds: IUserRound[][];
}

export class HistoryGame {
    rooms: Record<string, IRoomData>;

    constructor() {
        this.rooms = {};
    }

    joinUser(connection: TCustomConnection) {
        let room = this.rooms[connection.roomId];

        if (!room) {
            this.rooms[connection.roomId] = {
                users: [connection],
                status: GameStatus.CREATED,
                time: 15,
                rounds: [],
            };
            room = this.rooms[connection.roomId];
        } else room.users.push(connection);

        connection.send({
            lobbyInfo: {
                users: room.users.map((user) => ({
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

        const index = room.users.findIndex((x) => x.vkId === connection.vkId);
        if (index === -1) return;

        room.users.splice(index, 1);

        this.broadcast(connection, {
            userLeaved: { vkId: connection.vkId, newOwnerVkId },
        });
    }

    kickUser(connection: TCustomConnection, vkId: number) {
        const room = this.rooms[connection.roomId];
        if (!room) return;

        const index = room.users.findIndex((x) => x.vkId === vkId);
        if (index === -1) return;

        room.users.splice(index, 1);

        this.broadcastAll(connection, {
            userLeaved: { vkId },
        });
    }

    broadcast(
        connection: TCustomConnection,
        msg: Parameters<TCustomConnection["send"]>[0],
    ) {
        const room = this.rooms[connection.roomId];

        room.users
            .filter((c) => c.vkId !== connection.vkId)
            .map((x) => x.send(msg));
    }

    broadcastAll(
        connection: TCustomConnection,
        msg: Parameters<TCustomConnection["send"]>[0],
    ) {
        const room = this.rooms[connection.roomId];

        room.users.map((x) => x.send(msg));
    }

    startGame(connection: TCustomConnection) {
        const room = this.rooms[connection.roomId];

        room.status = GameStatus.STARTED;
        this.nextStep(connection);
        this.broadcastAll(connection, {
            startLobby: {},
        });
    }

    nextStep(connection: TCustomConnection) {
        const room = this.rooms[connection.roomId];
        console.log(room.rounds);
        //TODO: not on connections. use players count
        if (room.rounds.length === room.users.length)
            return this.broadcastAll(connection, {
                finishGame: {},
            });
        if (room.rounds.length)
            this.broadcastAll(connection, {
                nextStep: {},
            });
        room.rounds.push([]);
        this.startTimer(connection);
    }

    startTimer(connection: TCustomConnection) {
        const room = this.rooms[connection.roomId];

        room.time = 15;

        room.timerId = setInterval(() => {
            if (!room.timerId) return;
            room.time -= 1;

            if (room.time <= 0) {
                room.time = 0;
                this.nextStep(connection);
                clearInterval(room.timerId);
            } else
                this.broadcastAll(connection, {
                    timerTick: {
                        time: room.time,
                    },
                });
        }, 1000);
    }

    handleText(connection: TCustomConnection, text: string) {
        const room = this.rooms[connection.roomId];
        const round = room.rounds.at(-1)!;

        const roundUser = round.find((x) => x.vkId === connection.vkId);
        if (!roundUser) {
            round.push({ vkId: connection.vkId, text });
        } else roundUser.text = text;
        if (
            room.rounds.length === room.users.length &&
            round.length === room.users.length
        ) {
            room.time = 0;
            clearInterval(room.timerId);
            return this.nextStep(connection);
        }
    }
}

export const historyGame = new HistoryGame();
