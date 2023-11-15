import fastifyWebSocket, { SocketStream } from "@fastify/websocket";
import { WebsocketClient, WebsocketServer } from "@services/protobuf";
import { FastifyZodInstance, ICustomMethod } from "@types";
import fastifyPlugin from "fastify-plugin";
import { SocketManager } from "./core";

const socketManager = new SocketManager();

async function registerWebSocket(fastify: FastifyZodInstance) {
    await fastify.register(fastifyWebSocket);

    fastify.get(
        "/:game",
        { websocket: true },
        async (connection: SocketStream & ICustomMethod, req) => {
            const game = "phone";

            const connectionCommand = socketManager
                .getCommands()
                .find(
                    (command) =>
                        command.game === game && command.name === "connection",
                );

            if (!connectionCommand) return connection.socket.close();
            await connectionCommand.handler(
                connection,
                null,
                +req.vkParams.vk_user_id,
            );

            connection.socket.on("message", async (msg) => {
                if (!(msg instanceof ArrayBuffer)) return;
                const commandMsg = WebsocketClient.fromBinary(
                    new Uint8Array(msg),
                );

                const gameName = Object.keys(commandMsg).at(0)!;
                const commandName = Object.keys(commandMsg[gameName]).at(0)!;

                const command = socketManager
                    .getCommands()
                    .find(
                        (command) =>
                            command.game === gameName &&
                            command.name === commandName,
                    );
                if (!command) return connection.socket.close();

                connection.send = (
                    msg: WebsocketServer[keyof WebsocketServer],
                ) =>
                    connection.socket.send(
                        WebsocketServer.toBinary({
                            [gameName]: msg,
                        }),
                    );

                await command.handler(
                    connection,
                    commandMsg[gameName][commandName],
                    +req.vkParams.vk_user_id,
                );
            });
        },
    );
}

socketManager.loadCommands();

export const websocketPlugin = fastifyPlugin(registerWebSocket, {
    name: "websocket-plugin",
});
