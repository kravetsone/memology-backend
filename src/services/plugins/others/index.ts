import fastifyCors from "@fastify/cors";
import fastifyMultipart from "@fastify/multipart";
import fastifyRedis from "@fastify/redis";
import { FastifyZodInstance } from "@types";
import fastifyPlugin from "fastify-plugin";

async function registerOthers(fastify: FastifyZodInstance) {
    await fastify.register(fastifyMultipart, {
        limits: {
            fileSize: 5000000,
        },
    });
    await fastify.register(fastifyCors);
    await fastify.register(fastifyRedis);
}

export const othersPlugin = fastifyPlugin(registerOthers, {
    name: "others-import-plugin",
});
