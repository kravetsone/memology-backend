import fastifyCors from "@fastify/cors";
import fastifyRedis from "@fastify/redis";
import { FastifyZodInstance } from "@types";
import fastifyMulter from "fastify-multer";
import fastifyPlugin from "fastify-plugin";

async function registerOthers(fastify: FastifyZodInstance) {
    await fastify.register(fastifyCors);
    await fastify.register(fastifyMulter.contentParser);
    await fastify.register(fastifyRedis);
}

export const othersPlugin = fastifyPlugin(registerOthers, {
    name: "others-import-plugin",
});
