import { historyGame, SocketCommand } from "@services";

export const changeSettingsCommand = new SocketCommand({
    game: "history",
    name: "changeSettings",
    handler: async (connection, settings) => {
        return historyGame.setSettings(connection, settings);
    },
});
