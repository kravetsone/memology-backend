import { config } from "@config";
import { APIError } from "@services/errors";
import { FastifyZodInstance, IVKParams } from "@types";
import { FastifyRequest } from "fastify";
import fastifyPlugin from "fastify-plugin";
import {
    serializerCompiler,
    validatorCompiler,
} from "fastify-type-provider-zod";
import crypto from "node:crypto";
import querystring from "node:querystring";
import { ErrorCode } from "..";
import { autoroutesPlugin } from "./autoroutes";
import { errorHandlerPlugin } from "./errorHandler";
import { othersPlugin } from "./others";
import { swaggerPlugin } from "./swagger";

async function registerPlugins(fastify: FastifyZodInstance) {
    fastify.setValidatorCompiler(validatorCompiler);
    fastify.setSerializerCompiler(serializerCompiler);

    await fastify.register(othersPlugin);
    await fastify.register(swaggerPlugin);
    await fastify.register(errorHandlerPlugin);
    await fastify.register(autoroutesPlugin);

    fastify.addHook(
        "preHandler",
        async (
            req: FastifyRequest<{ Querystring: { "vk-params": IVKParams } }>,
        ) => {
            console.log(`[${req.method}]`, req.url, req.body || req.query);
            console.log(req.headers);
            if (req.url.includes("documentation")) return;
            if (!req.headers["vk-params"] && !req.query["vk-params"])
                throw new APIError(
                    ErrorCode.NO_AUTH,
                    "Строка авторизации некорректна",
                );

            const urlParams = querystring.parse(
                (req.headers["vk-params"] || req.query["vk-params"]) as string,
            );
            const signKeys = Object.keys(urlParams).filter((key) =>
                key.startsWith("vk_"),
            );
            const ordered = {};

            signKeys.forEach((key) => (ordered[key] = urlParams[key]));

            const stringParams = querystring.stringify(ordered);
            const paramsHash = crypto
                .createHmac("sha256", config.appSecret)
                .update(stringParams)
                .digest()
                .toString("base64")
                .replace(/\+/g, "-")
                .replace(/\//g, "_")
                .replace(/=$/, "");

            req.vkParams = urlParams as unknown as IVKParams;
            if (paramsHash !== req.vkParams.sign)
                throw new APIError(
                    ErrorCode.NO_AUTH,
                    "Строка авторизации некорректна",
                );
        },
    );
}

export const registerPlugin = fastifyPlugin(registerPlugins, {
    name: "register-plugin",
});
