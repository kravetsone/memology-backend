import { historyGame } from "@services/games/history";
import { SocketCommand } from "@services/websocket/core";

export const disconnectionCommand = new SocketCommand({
    game: "history",
    name: "disconnection",
    handler: (connection, _) => {
        historyGame.leaveUser(connection);
    },
});
