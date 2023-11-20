import fastifyWebSocket from "@fastify/websocket";
import { WebsocketClient, WebsocketServer } from "@services/protobuf";
import { FastifyZodInstance, TCustomConnection } from "@types";
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
        async (connection: TCustomConnection, req) => {
            connection.socket.on("close", async () => {
                console.log("disconnection");
                const disconnectionCommand = socketManager.getCommand(
                    "history",
                    "disconnection",
                );
                if (!disconnectionCommand) return connection.socket.close();

                await disconnectionCommand.handler(connection, null);
            });

            connection.socket.on("message", async (msg) => {
                const commandMsg = WebsocketClient.fromBinary(
                    new Uint8Array(msg as ArrayBuffer),
                );
                console.log(commandMsg);
                const gameName = Object.keys(commandMsg).at(0)!;
                const commandName = Object.keys(commandMsg[gameName]).at(0)!;

                const command = socketManager.getCommand(gameName, commandName);
                if (!command) return;

                await command.handler(
                    connection,
                    commandMsg[gameName][commandName],
                );
            });
            const connectionCommand = socketManager.getCommand(
                req.params.game,
                "connection",
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
        },
    );
}

socketManager.loadCommands();

export const websocketPlugin = fastifyPlugin(registerWebSocket, {
    name: "websocket-plugin",
});
