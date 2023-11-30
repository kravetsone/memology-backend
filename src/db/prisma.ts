import {
    findManyAndCountExtension,
    memeModelExtension,
    signInOrUpExtension,
    staticUrlAdditionExtension,
} from "@db/extensions";
import { PrismaClient, RatingType } from "@prisma/client";
import { DateTime } from "luxon";

export const prisma = new PrismaClient()
    .$extends(findManyAndCountExtension)
    .$extends(signInOrUpExtension)
    .$extends(staticUrlAdditionExtension)
    .$extends(memeModelExtension);

export * from "@prisma/client";
//TODO: separate this... but imports wrong and throw err in runtime (prisma is undefined)
async function calculateRatingByType(type: RatingType) {
    const memes = await prisma.meme.findMany({
        where: {
            isSuggest: false,
            ...(type === RatingType.WEEKLY
                ? {
                      createdAt: {
                          gt: DateTime.now()
                              .minus({ week: 1 })
                              .startOf("day")
                              .toJSDate(),
                      },
                  }
                : {}),
        },
        orderBy: [
            {
                likesCount: "desc",
            },
            {
                id: "desc",
            },
        ],
        take: 20,
        select: {
            id: true,
        },
    });

    await Promise.all(
        memes.map(async ({ id }, i) => {
            const index = i + 1;

            await prisma.memeInRating.upsert({
                where: {
                    index_type: {
                        index,
                        type,
                    },
                },
                update: {
                    meme: {
                        connect: {
                            id,
                        },
                    },
                },
                create: {
                    index,
                    type,
                    meme: {
                        connect: {
                            id,
                        },
                    },
                },
            });
        }),
    );
}

async function calculateRating() {
    console.log("[RATING] rating is calculating...");
    await calculateRatingByType(RatingType.ETERNAL);
    await calculateRatingByType(RatingType.WEEKLY);
    console.log("[RATING] rating has been updated");
}

setInterval(calculateRating, 60 * 60 * 1000);

calculateRating();
