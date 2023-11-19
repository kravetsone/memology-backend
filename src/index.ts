import "./types/index";
import { prisma } from "@db";
import { ajvFilePlugin } from "@fastify/multipart";
import { PORT } from "config";
import Fastify from "fastify";
import { registerPlugin } from "services/plugins";

const fastify = Fastify({
    logger: {
        level: "warn",
    },
    ajv: {
        plugins: [ajvFilePlugin],
    },
});

fastify.addContentTypeParser(
    "application/x-protobuf",
    {
        parseAs: "buffer",
    },
    (req, body, done) => {
        done(null, body);
    },
);

fastify.register(registerPlugin);

prisma.$connect().then(async () => {
    console.log("[DATABASE] database was connected!");

    const host = await fastify.listen({
        port: PORT,
    });
    console.log(`[SERVER] Server has been started at ${host}`);
});
