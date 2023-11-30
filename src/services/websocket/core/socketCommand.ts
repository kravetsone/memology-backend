import { WebsocketClient } from "@services";
import { TCustomConnection } from "@types";

export type TSocketHandler<D> = (
    connection: TCustomConnection,
    message: D
) => unknown;

export class SocketCommand<
    T extends keyof WebsocketClient,
    K extends keyof NonNullable<WebsocketClient[T]>,
> {
    game: T;
    name: K | "connection" | "disconnection";
    handler: TSocketHandler<NonNullable<NonNullable<WebsocketClient[T]>[K]>>;

    constructor(data: {
        game: T;
        name: K | "connection" | "disconnection";
        handler: TSocketHandler<
            NonNullable<NonNullable<WebsocketClient[T]>[K]>
        >;
    }) {
        this.game = data.game;
        this.name = data.name;
        this.handler = data.handler;
    }
}
