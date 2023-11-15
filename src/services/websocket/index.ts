import fastifyWebSocket, { SocketStream } from "@fastify/websocket";
import { WebsocketClient, WebsocketServer } from "@services/protobuf";
import { FastifyZodInstance, ICustomMethod } from "@types";
import fastifyPlugin from "fastify-plugin";
import { z } from "zod";
import { SocketManager } from "./core";

const socketManager = new SocketManager();

const params = z.object({
    game: z.string(),
    roomId: z.string(),
});

async function registerWebSocket(fastify: FastifyZodInstance) {
    await fastify.register(fastifyWebSocket);

    fastify.get(
        "/:game/:roomId",
        { websocket: true, schema: { params } },
        async (connection: SocketStream & ICustomMethod, req) => {
            const connectionCommand = socketManager
                .getCommands()
                .find(
                    (command) =>
                        command.game === req.params.game &&
                        command.name === "connection",
                );

            if (!connectionCommand) return connection.socket.close();

            connection.send = (msg: WebsocketServer[keyof WebsocketServer]) =>
                connection.socket.send(
                    WebsocketServer.toBinary({
                        [req.params.game]: msg,
                    }),
                );
            connection.vkId = +req.vkParams.vk_user_id;
            connection.roomId = req.params.roomId;

            await connectionCommand.handler(connection, null);

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

                await command.handler(
                    connection,
                    commandMsg[gameName][commandName],
                );
            });
        },
    );
}

socketManager.loadCommands();

export const websocketPlugin = fastifyPlugin(registerWebSocket, {
    name: "websocket-plugin",
});
