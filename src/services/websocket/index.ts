import fastifyWebSocket from "@fastify/websocket";
import {
    Command,
    WebsocketCommand,
    WebsocketErrorType,
    WebsocketEvent,
    WebsocketResponse,
} from "@services/protobuf";
import { FastifyZodInstance } from "@types";
import fastifyPlugin from "fastify-plugin";
import { SocketManager } from "./core";

const socketManager = new SocketManager();

async function registerWebSocket(fastify: FastifyZodInstance) {
    await fastify.register(fastifyWebSocket);

    fastify.get("/:game", { websocket: true }, (connection, req) => {
        const game = "phone";

        const connectionCommand = socketManager
            .getCommands()
            .find(
                (command) =>
                    command.game === game && command.name === Command.CONNECTION
            );

        if (!connectionCommand) {
            connection.socket.send(
                WebsocketResponse.toBinary({
                    error: {
                        type: WebsocketErrorType.NO_GAME,
                        message: "Этой игры не существует",
                    },
                    type: WebsocketEvent.ERROR,
                })
            );
            return connection.socket.close();
        }
        connection.socket.on("message", async (msg) => {
            if (!(msg instanceof ArrayBuffer)) return;
            const commandMsg = WebsocketCommand.fromBinary(new Uint8Array(msg));

            const command = socketManager
                .getCommands()
                .find(
                    (command) =>
                        command.game === game &&
                        command.name === commandMsg.command
                );
            if (!command)
                return connection.socket.send(
                    WebsocketResponse.toBinary({
                        error: {
                            type: WebsocketErrorType.NO_COMMAND,
                            message: "Этой команды не существует",
                        },
                        type: WebsocketEvent.ERROR,
                    })
                );

            await command.handler(connection, data, user);
        });
    });
}

socketManager.loadCommands();

export const websocketPlugin = fastifyPlugin(registerWebSocket, {
    name: "websocket-plugin",
});
