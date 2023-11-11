import { config } from "@config";
import { VK } from "vk-io";

export const vk = new VK({
    token: config.vkBotToken,
});
