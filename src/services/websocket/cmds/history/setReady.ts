import { historyGame } from "@services/games/history";
import { SocketCommand } from "@services/websocket/core";

export const sendTextCommand = new SocketCommand({
    game: "history",
    name: "sendText",
    handler: async (connection, { text }) => {
        return historyGame.handleReady(connection, text);
    },
});
