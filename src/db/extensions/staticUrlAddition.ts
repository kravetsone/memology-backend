import { STATIC_URL } from "@config";
import { Meme } from "@prisma/client";

export const staticUrlAdditionExtension = {
    name: "add STATIC_URL where it needed",
    result: {
        meme: {
            image: {
                needs: { image: true },
                compute: (user: Meme) => STATIC_URL + user.image,
            },
        },
    },
};
