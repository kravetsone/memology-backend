import { prisma } from "@db";
import { CommentsResponse_CommentsListResponse } from "@services/protobuf/comment";
import { Mark } from "@services/protobuf/meme";
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
                select: {
                    id: true,
                    text: true,
                    createdAt: true,

                    user: {
                        select: {
                            id: true,
                            vkId: true,
                        },
                    },
                },
            });
            const userIds = comments.map((x) => x.user.vkId);

            const { inLikes, inDislikes } = await prisma.meme.findFirstOrThrow({
                select: {
                    inLikes: {
                        where: {
                            user: {
                                vkId: {
                                    in: userIds,
                                },
                            },
                        },
                    },
                    inDislikes: {
                        where: {
                            user: {
                                vkId: {
                                    in: userIds,
                                },
                            },
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
                        mark: inLikes.find((x) => x.userId === comment.user.id)
                            ? Mark.LIKE
                            : inDislikes.find(
                                    (x) => x.userId === comment.user.id,
                                )
                              ? Mark.DISLIKE
                              : undefined,
                    })),
                }),
            );
        },
    );
};
