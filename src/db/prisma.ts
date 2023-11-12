import {
    findManyAndCountExtension,
    memeModelExtension,
    signInOrUpExtension,
    staticUrlAdditionExtension,
} from "@db/extensions";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()
    .$extends(findManyAndCountExtension)
    .$extends(signInOrUpExtension)
    .$extends(staticUrlAdditionExtension)
    .$extends(memeModelExtension);

export * from "@prisma/client";
export { prisma };
