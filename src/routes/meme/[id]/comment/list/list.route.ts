import { prisma } from "@db";
import { CommentsResponse_CommentsListResponse } from "@services/protobuf/comment";
import { Mark, MemeListResponse } from "@services/protobuf/meme";
import { FastifyZodInstance } from "@types";
import { DateTime } from "luxon";
import { schema } from "./list.schema";

export const get = async (fastify: FastifyZodInstance) => {
    fastify.get(
        "/",
        {
            schema,
        },
        async (req, res) => {
            const { page, pageSize } = req.query;

            const [comments, count] = await prisma.comment.findManyAndCount({
                where: {
                    meme: {
                        id: req.params.id,
                    },
                },
                skip: (+page - 1) * +pageSize,
                take: pageSize,
                include: {
                    user: {
                        select: {
                            vkId: true,
                        },
                    },
                },
            });

            console.log(comments, count);
            return res.header("content-type", "application/x-protobuf").send(
                CommentsResponse_CommentsListResponse.toBinary({
                    count,
                    items: comments.map((comment) => ({
                        id: comment.id,
                        text: comment.text,
                        vkId: Number(comment.user.vkId),
                        createdAt: DateTime.fromJSDate(
                            comment.createdAt,
                        ).toUnixInteger(),
                        likesCount: 0,
                        mark: Mark.LIKE,
                    })),
                }),
            );
        },
    );
};
