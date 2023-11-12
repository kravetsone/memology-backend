import {
    findManyAndCountExtension,
    signInOrUpExtension,
    staticUrlAdditionExtension,
} from "@db/extensions";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()
    .$extends(findManyAndCountExtension)
    .$extends(signInOrUpExtension)
    .$extends(staticUrlAdditionExtension);

export * from "@prisma/client";
export { prisma };
