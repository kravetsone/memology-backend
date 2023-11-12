import fastifyWebSocket from "@fastify/websocket";
import { FastifyZodInstance } from "@types";
import fastifyPlugin from "fastify-plugin";

async function registerWebSocket(fastify: FastifyZodInstance) {
    await fastify.register(fastifyWebSocket);

    fastify.get("/", { websocket: true }, (connection, req) => {
        connection.socket.on("message", (msg) => {
            console.log("test");
            connection.socket.send(msg.toString());
        });
    });
}

export const websocketPlugin = fastifyPlugin(registerWebSocket, {
    name: "websocket-plugin",
});
