import { historyGame } from "@services/games/history";
import { SocketCommand } from "@services/websocket/core";

export const changeSettingsCommand = new SocketCommand({
    game: "history",
    name: "changeSettings",
    handler: async (connection, settings) => {
        return historyGame.setSettings(connection, settings);
    },
});
