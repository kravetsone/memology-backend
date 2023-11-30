import { historyGame, SocketCommand } from "@services";

export const sendTextCommand = new SocketCommand({
    game: "history",
    name: "sendText",
    handler: async (connection, { text }) => {
        return historyGame.handleReady(connection, text);
    },
});
