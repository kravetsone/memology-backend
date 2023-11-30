import { APIError } from "@services";
import { ErrorCode, ErrorResponse } from "@services/protobuf/error";
import { FastifyZodInstance } from "@types";
import fastifyPlugin from "fastify-plugin";

async function registerErrorHandler(fastify: FastifyZodInstance) {
    fastify.setErrorHandler((error, _req, res) => {
        if (error instanceof APIError) {
            const apiError = error as APIError;
            return (
                res
                    // .header("Content-Type", "application/x-protobuf")
                    .status(apiError.statusCode)
                    .send(apiError.protobuf)
            );
        }
        if ("storageErrors" in error)
            return res
                .status(409)
                .header("Content-Type", "application/x-protobuf")
                .send(
                    ErrorResponse.toBinary({
                        code: ErrorCode.UPLOAD_ERROR,
                        message: error.message,
                        errors: [],
                        params: {},
                    })
                );
        console.error("err:", error);
        if (error?.validation?.length) {
            return res
                .status(400)
                .header("Content-Type", "application/x-protobuf")
                .send(
                    ErrorResponse.toBinary({
                        code: ErrorCode.VALIDATION_ERROR,
                        message:
                            error.validation[0].message ||
                            "Произошла ошибка валидации",
                        errors: error.validation.map((err) => ({
                            message: err.message,
                            path: err.schemaPath,
                        })),
                        params: {},
                    })
                );
        }
        console.error(error);
        return res
            .status(500)
            .header("Content-Type", "application/x-protobuf")
            .send(
                ErrorResponse.toBinary({
                    code: ErrorCode.SERVER_ERROR,
                    message:
                        "На сервере произошла техническая ошибка. Попробуйте позже",
                    errors: [],
                    params: {},
                })
            );
    });
}

export const errorHandlerPlugin = fastifyPlugin(registerErrorHandler, {
    name: "register-error-handler-plugin",
});
