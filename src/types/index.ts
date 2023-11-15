import {
    FastifyBaseLogger,
    FastifyInstance,
    FastifyReply,
    RawReplyDefaultExpression,
    RawRequestDefaultExpression,
    RawServerDefault,
} from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { ZodError } from "zod";

export type FastifyZodInstance = FastifyInstance<
    RawServerDefault,
    RawRequestDefaultExpression<RawServerDefault>,
    RawReplyDefaultExpression<RawServerDefault>,
    FastifyBaseLogger,
    ZodTypeProvider
>;

declare module "fastify" {
    interface PassportUser {
        token: string;
        isNewAccount?: boolean;
    }

    interface FastifyInstance {
        auth: (
            getUser?: boolean,
            countNotify?: boolean,
        ) => (req: FastifyRequest, res: FastifyReply) => void;
    }
    interface FastifyRequest {
        vkParams: IVKParams;
    }

    interface FastifyError extends ZodError {}
}

export type TRoute = (fastify: FastifyZodInstance) => unknown;

export interface IVKParams {
    vk_access_token_settings: string;
    vk_app_id: string;
    vk_are_notifications_enabled: string;
    vk_is_app_user: string;
    vk_is_favorite: string;
    vk_language: string;
    vk_platform: string;
    vk_ref: string;
    vk_ts: string;
    vk_user_id: string;
    sign: string;
}

export enum RatingType {
    WEEKLY = "weekly",
    ETERNAL = "eternal",
}

export enum ListType {
    LIKE = "like",
    DISLIKE = "dislike",
    FAVORITE = "favorite",
}
