import { prisma } from "@db";
import { MultipartValue } from "@fastify/multipart";
import { APIError } from "@services/errors";
import { ErrorCode } from "@services/protobuf";
import { FastifyZodInstance } from "@types";
import fs from "node:fs";
import { pipeline } from "node:stream/promises";
import { schema } from "./suggest.schema";

export const post = async (fastify: FastifyZodInstance) => {
    fastify.post(
        "/",
        {
            schema,
            validatorCompiler: () => () => ({ value: true }),
        },
        async (req, res) => {
            const files = await req.saveRequestFiles();

            console.log(files);
            const image = files.find((x) => x.fieldname === "image");
            if (!image)
                throw new APIError(
                    ErrorCode.UPLOAD_ERROR,
                    "Аватарка мема не была загружена",
                );
            await pipeline(
                image.file,
                fs.createWriteStream(
                    "/root/memology-backend/files/" + image.filename,
                ),
            );
            const { title, description } = image.fields;
            await prisma.meme.create({
                data: {
                    title: (title as MultipartValue).value as string,
                    description: (description as MultipartValue)
                        .value as string,
                    image: "/" + image.filename,
                    owner: {
                        connect: {
                            vkId: +req.vkParams.vk_user_id,
                        },
                    },
                },
            });

            return res
                .header("content-type", "application/x-protobuf")
                .send("");
        },
    );
};
