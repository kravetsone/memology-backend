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
            // const files: MultipartFile[] = [];
            // const fields: MultipartValue[] = [];
            // const parts = req.parts();
            // for await (const part of parts) {
            //     // console.log(part);
            //     if (part.type === "file") {
            //         files.push(part);
            //     } else fields.push(part);
            // }
            // console.log(files);
            // const { title, description } = bodySchema.parse(
            //     Object.fromEntries(
            //         fields.map((field) => [field.fieldname, field.value]),
            //     ),
            // );
            // console.log(title);
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

            // await prisma.meme.create({
            //     data: {
            //         title: "",
            //         description: "",
            //         image: "/" + image.filename,
            //     },
            // });

            // return res
            //     .header("content-type", "application/x-protobuf")
            //     .send("");
        },
    );
};
