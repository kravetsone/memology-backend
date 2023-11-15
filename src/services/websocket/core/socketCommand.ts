import { SocketStream } from "@fastify/websocket";
import { WebsocketClient } from "@services/protobuf";
import { ICustomMethod } from "@types";

export type TSocketHandler<D> = (
    connection: SocketStream & ICustomMethod,
    message: D,
    vkId: number,
) => unknown;

export class SocketCommand<
    T extends keyof WebsocketClient,
    K extends keyof NonNullable<WebsocketClient[T]>,
> {
    game: T;
    name: K | "connection";
    handler: TSocketHandler<NonNullable<NonNullable<WebsocketClient[T]>[K]>>;

    constructor(data: {
        game: T;
        name: K | "connection";
        handler: TSocketHandler<
            NonNullable<NonNullable<WebsocketClient[T]>[K]>
        >;
    }) {
        this.name = data.name;
        this.handler = (connection, message, user) => {
            data.handler(connection, message, user);
        };
    }
}
