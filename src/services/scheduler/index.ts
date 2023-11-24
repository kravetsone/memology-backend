import { prisma, RatingType } from "@db";
import { DateTime } from "luxon";

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
        orderBy: {
            likesCount: "desc",
        },
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
