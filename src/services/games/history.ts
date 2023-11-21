import { GameStatus } from "@prisma/client";
import { createGIF } from "@services/gif";
import { TCustomConnection } from "@types";
import { loadImage } from "skia-canvas";
import { vk, WebsocketServer_HistoryEvents_FinishGame_Msg } from "..";

export interface IUserRound {
    vkId: number;
    text: string;
}

export interface IVKUserData {
    id: number;
    photo_200: string;
    first_name: string;
    last_name: string;
    can_access_closed: boolean;
    is_closed: boolean;
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
        if (room.status === GameStatus.FINISHED) return;

        console.log(room.rounds);
        //TODO: not on connections. use players count
        if (room.rounds.length === room.users.length)
            return this.finishGame(connection);
        if (room.rounds.length) {
            room.users.forEach((conn) => {
                const round = room.rounds.at(-1)!;
                const index = round.findIndex(
                    (user) => user.vkId === conn.vkId,
                );
                if (index === -1) return;

                const msgOfAnotherUser = round.at(
                    (index + 1) % room.users.length,
                );
                if (!msgOfAnotherUser)
                    return console.error(round, index, room.rounds);

                conn.send({
                    nextStep: {
                        previousContext: msgOfAnotherUser.text,
                    },
                });
            });
        }
        room.rounds.push(room.users.map((x) => ({ vkId: x.vkId, text: "" })));
        this.startTimer(connection);
    }

    startTimer(connection: TCustomConnection) {
        const room = this.rooms[connection.roomId];

        room.time = 15;

        room.timerId = setInterval(() => {
            if (!room.timerId) return clearInterval(room.timerId);
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
        if (!room.timerId) return;
        const round = room.rounds.at(-1)!;

        const roundUser = round.find((x) => x.vkId === connection.vkId)!;
        roundUser.text = text;
        if (
            room.rounds.length === room.users.length &&
            round.every((x) => x.text)
        ) {
            room.time = 0;
            clearInterval(room.timerId);
            return this.nextStep(connection);
        }
    }

    getDialogForIndex(
        rounds: IUserRound[][],
        roundIndex: number,
        usersCount: number,
    ) {
        const dialog: IUserRound[] = [];
        let index = roundIndex;
        for (const [i, element] of rounds.entries()) {
            console.log(i, index);
            dialog.push(element.at((index + 1) % usersCount)!);
            index++;
        }
        return dialog;
    }

    async finishGame(connection: TCustomConnection) {
        const room = this.rooms[connection.roomId];
        room.status = GameStatus.FINISHED;
        clearInterval(room.timerId);

        const vkProfiles = (await vk.api.users.get({
            user_ids: room.users.map((x) => x.vkId),
            fields: ["photo_200"],
        })) as unknown as IVKUserData[];
        console.log(room.rounds);
        const dialogs = room.rounds.map((_, index) =>
            this.getDialogForIndex(room.rounds, index, room.users.length).map(
                (msg) => {
                    const owner = vkProfiles.find((x) => x.id === msg.vkId)!;
                    return {
                        text: msg.text,
                        owner: {
                            id: owner.id,
                            photo: owner.photo_200,
                            name: owner.first_name + " " + owner.last_name,
                        },
                    };
                },
            ),
        ) as WebsocketServer_HistoryEvents_FinishGame_Msg[][];

        this.broadcastAll(connection, {
            finishGame: {
                dialogs: dialogs.map((x, index) => ({
                    id: index,
                    msgs: x,
                })),
            },
        });

        dialogs.forEach(async (dialog) => {
            const gif = await createGIF(dialog);

            this.broadcastAll(connection, {
                gameGif: {
                    buffer: gif,
                },
            });
        });
    }
}

export const historyGame = new HistoryGame();
