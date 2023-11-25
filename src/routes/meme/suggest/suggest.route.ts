import { prisma } from "@db";
import { APIError } from "@services/errors";
import { ErrorCode } from "@services/protobuf";
import { FastifyZodInstance } from "@types";
import { createHash } from "node:crypto";
import fs from "node:fs";
import { pipeline } from "node:stream/promises";
import { schema } from "./suggest.schema";

interface IMemeData {
    title?: string;
    description?: string;
    image?: string;
}

const allowedMimetypes = ["image/png", "image/jpeg"];

export const post = async (fastify: FastifyZodInstance) => {
    fastify.post(
        "/",
        {
            schema,
            validatorCompiler: () => () => ({ value: true }),
        },
        async (req, res) => {
            const parts = req.parts();

            const memeData: IMemeData = {};

            for await (const part of parts) {
                if (
                    part.type === "file" &&
                    part.fieldname === "image" &&
                    allowedMimetypes.includes(part.mimetype)
                ) {
                    const fileName =
                        createHash("sha1")
                            .update(Date.now() + "" + req.vkParams.vk_user_id)
                            .digest("hex")
                            .slice(0, 16) +
                        "." +
                        part.filename.split(".").at(-1);

                    await pipeline(
                        part.file,
                        fs.createWriteStream(
                            "/root/memology-backend/files/memes/" + fileName,
                        ),
                    );
                    memeData.image = fileName;
                }
                if (part.type === "field") {
                    if (part.fieldname === "title")
                        memeData.title = part.value as string;
                    if (part.fieldname === "description")
                        memeData.description = part.value as string;
                }
            }

            if (!memeData.description || !memeData.title || !memeData.image)
                throw new APIError(
                    ErrorCode.UPLOAD_ERROR,
                    "Вы не заполнили все поля",
                );

            await prisma.meme.create({
                data: {
                    title: memeData.title,
                    description: memeData.description,
                    image: "/memes/" + memeData.image,
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
