import { User } from "@db";
import { SocketStream } from "@fastify/websocket";
import { Command, WebsocketResponse } from "@services/protobuf";

export type TSocketHandler<T> = (
    connection: SocketStream & T,
    message: Record<string, unknown>,
    user: User
) => unknown;
export interface ICustomMethod {
    send: (data: WebsocketResponse) => void;
}

export class SocketCommand {
    game: string;
    name: Command;
    handler: TSocketHandler<{}>;

    constructor(data: {
        name: Command;
        handler: TSocketHandler<ICustomMethod>;
    }) {
        this.name = data.name;
        this.handler = (connection, message, user) => {
            //@ts-ignore
            connection.send = (msg: WebsocketResponse) =>
                connection.socket.send(WebsocketResponse.toBinary(msg));

            data.handler(
                //@ts-ignore
                connection as unknown as TSocketHandler<ICustomMethod>,
                message,
                user
            );
        };
    }
}
