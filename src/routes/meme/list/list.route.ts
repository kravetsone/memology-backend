import { prisma } from "@db";
import { MemeListResponse } from "@services/protobuf/meme";
import { FastifyZodInstance } from "@types";
import { schema } from "./list.schema";

export const get = async (fastify: FastifyZodInstance) => {
    fastify.get(
        "/",
        {
            schema,
        },
        async (req, res) => {
            const { page, pageSize } = req.query;

            const [memes, count] = await prisma.meme.findManyAndCount({
                skip: (+page - 1) * +pageSize,
                take: pageSize,
                select: {
                    id: true,
                    description: true,
                    title: true,
                    image: true,
                    inFavorites: {
                        where: {
                            user: {
                                vkId: +req.vkParams.vk_user_id,
                            },
                        },
                    },
                    _count: {
                        select: {
                            inFavorites: true,
                        },
                    },
                },
            });
            console.log(memes, count);
            return res.header("content-type", "application/x-protobuf").send(
                MemeListResponse.toBinary({
                    count,
                    items: memes.map((meme) => ({
                        id: meme.id,
                        title: meme.title,
                        description: meme.description ?? undefined,
                        image: meme.image,
                        favoritesCount: meme._count.inFavorites,
                        isFavorites: !!meme.inFavorites,
                        //TODO: implement
                        likesCount: 0,
                    })),
                }),
            );
        },
    );
};
