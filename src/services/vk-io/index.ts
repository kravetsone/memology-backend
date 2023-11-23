import { config } from "@config";
import { VK } from "vk-io";

export const vk = new VK({
    token: config.vkBotToken,
});

export const vkUser = new VK({
    token: config.vkUserToken,
});
