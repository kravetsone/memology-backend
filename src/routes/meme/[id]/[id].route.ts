import { prisma, RatingType } from "@db";
import { APIError, ErrorCode, Mark, MemeResponse } from "@services";
import { FastifyZodInstance } from "@types";
import { schema } from "./[id].schema";

export const get = async (fastify: FastifyZodInstance) => {
    fastify.get(
        "/",
        {
            schema,
        },
        async (req, res) => {
            const { id } = req.params;

            const meme = await prisma.meme.get(id, +req.vkParams.vk_user_id);
            if (
                !meme ||
                (meme.isSuggest &&
                    Number(meme.owner.vkId) !== +req.vkParams.vk_user_id)
            )
                throw new APIError(
                    ErrorCode.NOT_EXISTS,
                    "Этого мема не существует",
                );
            console.log(meme);

            return res.header("content-type", "application/x-protobuf").send(
                MemeResponse.toBinary({
                    id: meme.id,
                    title: meme.title,
                    image: meme.image,
                    description: meme.description ?? undefined,
                    favoritesCount: meme._count.inFavorites,
                    isFavorites: !!meme.inFavorites.length,
                    likesCount: meme.likesCount,
                    commentsCount: meme._count.comments,
                    ownerId: Number(meme.owner.vkId),
                    placeInEternalRating: meme.positionInRating.find(
                        (x) => x.type === RatingType.ETERNAL,
                    )?.index,
                    placeInWeeklyRating: meme.positionInRating.find(
                        (x) => x.type === RatingType.WEEKLY,
                    )?.index,
                    mark: meme.inLikes.length
                        ? Mark.LIKE
                        : meme.inDislikes.length
                          ? Mark.DISLIKE
                          : undefined,
                }),
            );
        },
    );
};
