import {
    findManyAndCountExtension,
    staticUrlAdditionExtension,
} from "@db/extensions";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()
    .$extends(findManyAndCountExtension)
    .$extends(staticUrlAdditionExtension);

export * from "@prisma/client";
export { prisma };
