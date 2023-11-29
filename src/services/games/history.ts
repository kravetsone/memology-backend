import { prisma } from "@db";
import { GameStatus } from "@prisma/client";
import { createGIF } from "@services/gif";
import { TCustomConnection } from "@types";
import {
    vk,
    WebsocketClient,
    WebsocketServer_HistoryEvents_FinishGame_Msg,
} from "..";

export interface IUserRound {
    vkId: number;
    text: string;
    isReady: boolean;
}

export interface IVKUserData {
    id: number;
    photo_200: string;
    first_name: string;
    last_name: string;
    can_access_closed: boolean;
    is_closed: boolean;
}

interface IPlayer {
    vkId: number;
}

interface IRoomData {
    status: GameStatus;
    connections: TCustomConnection[];
    players: IPlayer[];
    time: number;
    timerId?: ReturnType<typeof setInterval>;
    rounds: IUserRound[][];
    callLink?: string;
    settings: ISettings;
}

interface ISettings {
    roundTime: number;
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
                connections: [connection],
                status: GameStatus.CREATED,
                players: [{ vkId: connection.vkId }],
                time: 0,
                rounds: [],
                settings: {
                    roundTime: 15,
                },
            };
            room = this.rooms[connection.roomId];
        } else {
            room.connections.push(connection);
            if (!room.players.find((x) => x.vkId === connection.vkId))
                room.players.push({ vkId: connection.vkId });
        }

        connection.send({
            lobbyInfo: {
                users: room.connections.map((user) => ({
                    vkId: user.vkId,
                    isOwner: user.isOwner,
                })),
                callLink: room.callLink,
                settings: room.settings,
            },
        });

        this.broadcast(connection, {
            userJoined: { vkId: connection.vkId, isOwner: connection.isOwner },
        });
    }

    leaveUser(connection: TCustomConnection, newOwnerVkId?: number) {
        const room = this.rooms[connection.roomId];
        if (!room) return;

        const index = room.connections.findIndex(
            (x) => x.vkId === connection.vkId,
        );
        if (index === -1) return;

        if (room.status !== GameStatus.STARTED)
            room.connections.splice(index, 1);

        this.broadcast(connection, {
            userLeaved: { vkId: connection.vkId, newOwnerVkId },
        });
    }

    kickUser(connection: TCustomConnection, vkId: number) {
        const room = this.rooms[connection.roomId];
        if (!room) return;

        const index = room.connections.findIndex((x) => x.vkId === vkId);
        if (index === -1) return;

        this.broadcastAll(connection, {
            userLeaved: { vkId },
        });

        const [user] = room.connections.splice(index, 1);

        user.socket.close();
    }

    broadcast(
        connection: TCustomConnection,
        msg: Parameters<TCustomConnection["send"]>[0],
    ) {
        const room = this.rooms[connection.roomId];

        room.connections
            .filter((c) => c.vkId !== connection.vkId)
            .map((x) => x.send(msg));
    }

    broadcastAll(
        connection: TCustomConnection,
        msg: Parameters<TCustomConnection["send"]>[0],
    ) {
        const room = this.rooms[connection.roomId];

        room.connections.map((x) => x.send(msg));
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
        if (room.rounds.length >= room.connections.length)
            return this.finishGame(connection);
        if (room.rounds.length) {
            room.players.forEach((player) => {
                const round = room.rounds.at(-1)!;
                const index = round.findIndex(
                    (user) => user.vkId === player.vkId,
                );
                if (index === -1) return;

                const msgOfAnotherUser = round.at(
                    (index - 1) % room.players.length,
                );
                if (!msgOfAnotherUser)
                    return console.error(round, index, room.rounds);

                const conn = room.connections.find(
                    (x) => x.vkId === player.vkId,
                );
                if (!conn) return;

                conn.send({
                    nextStep: {
                        previousContext: msgOfAnotherUser.text,
                    },
                });
            });
        }
        room.rounds.push(
            room.players.map((x) => ({
                vkId: x.vkId,
                text: "",
                isReady: false,
            })),
        );
        this.startTimer(connection);
    }

    startTimer(connection: TCustomConnection) {
        const room = this.rooms[connection.roomId];
        if (room.time) return;
        room.time = room.settings.roundTime;

        room.timerId = setInterval(() => {
            room.time -= 1;

            if (room.time <= 0) {
                room.time = 0;
                clearInterval(room.timerId);
                this.nextStep(connection);
            } else
                this.broadcastAll(connection, {
                    timerTick: {
                        time: room.time,
                    },
                });
        }, 1000);
    }

    setSettings(
        connection: TCustomConnection,
        settings: NonNullable<
            NonNullable<WebsocketClient["history"]>["changeSettings"]
        >,
    ) {
        const room = this.rooms[connection.roomId];
        room.settings.roundTime = settings.roundTime;

        this.broadcastAll(connection, {
            settingsUpdate: room.settings,
        });
    }

    handleReady(connection: TCustomConnection, text: string) {
        const room = this.rooms[connection.roomId];
        if (!room.time) return;
        const round = room.rounds.at(-1)!;

        const roundUser = round.find((x) => x.vkId === connection.vkId)!;
        roundUser.isReady = !roundUser.isReady;
        roundUser.text = text;
        this.broadcastAll(connection, {
            readyCounter: round.filter((x) => x.isReady).length,
        });
        if (round.every((x) => x.isReady)) {
            room.time = 0;
            clearInterval(room.timerId);
            return this.nextStep(connection);
        }
    }

    handleText(connection: TCustomConnection, text: string) {
        const room = this.rooms[connection.roomId];
        if (!room.time) return;
        const round = room.rounds.at(-1)!;

        const roundUser = round.find((x) => x.vkId === connection.vkId)!;
        roundUser.text = text;
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
        room.time = 0;

        const vkProfiles = (await vk.api.users.get({
            user_ids: room.players.map((x) => x.vkId),
            fields: ["photo_200"],
        })) as unknown as IVKUserData[];
        console.log(room.rounds);
        const dialogs = room.rounds.map((_, index) =>
            this.getDialogForIndex(room.rounds, index, room.players.length).map(
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
        await prisma.gameRoom.update({
            where: {
                id: connection.roomId,
            },
            data: {
                status: GameStatus.FINISHED,
            },
        });
        await Promise.all(
            dialogs.map(async (dialog, index) => {
                const [vkDoc, gif] = await createGIF(dialog);
                console.log(vkDoc);
                this.broadcastAll(connection, {
                    gameGif: {
                        dialogId: index,
                        buffer: gif,
                        vkAttachment: vkDoc || "",
                    },
                });
            }),
        );
    }

    async startNewGame(connection: TCustomConnection) {
        const room = this.rooms[connection.roomId];

        room.status = GameStatus.CREATED;
        room.rounds = [];
        clearInterval(room.timerId);
        delete room.timerId;
        room.time = 0;
        await prisma.gameRoom.update({
            where: {
                id: connection.roomId,
            },
            data: {
                status: GameStatus.CREATED,
            },
        });

        this.broadcastAll(connection, {
            newGame: {},
        });
    }

    startCall(connection: TCustomConnection, link?: string) {
        const room = this.rooms[connection.roomId];
        room.callLink = link;

        this.broadcast(connection, {
            callData: {
                link,
            },
        });
    }
}

export const historyGame = new HistoryGame();
