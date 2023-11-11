import { config } from "@config";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import { FastifyZodInstance } from "@types";
import fastifyPlugin from "fastify-plugin";
import { jsonSchemaTransform } from "fastify-type-provider-zod";
import { SwaggerTheme } from "swagger-themes";

const theme = new SwaggerTheme("v3");
const darkStyle = theme.getBuffer("dark");

export async function registerSwagger(fastify: FastifyZodInstance) {
    await fastify.register(fastifySwagger, {
        transform: jsonSchemaTransform,
        openapi: {
            info: {
                title: "Memology backend",
                version: "1.0",
            },
            servers: [
                {
                    url: "https://" + config.host,
                },
            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        name: "Authorization",
                        in: "header",
                        type: "apiKey",
                        description:
                            "JWT Authorization header (don't forget Bearer)",
                    },
                },
            },
        },
    });

    await fastify.register(fastifySwaggerUI, {
        routePrefix: "/documentation",
        uiConfig: {
            docExpansion: "list",
            deepLinking: false,
            syntaxHighlight: {
                activate: true,
                theme: "monokai",
            },
            // persistAuthorization: true,
        },
        theme: {
            css: [{ filename: "theme.css", content: darkStyle }],
        },
    });
}

export const swaggerPlugin = fastifyPlugin(registerSwagger, {
    name: "swagger-import-plugin",
});
