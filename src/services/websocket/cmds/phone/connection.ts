import { historyGame } from "@services/games/history";
import { SocketCommand } from "@services/websocket/core";

export const connectionCommand = new SocketCommand({
    game: "history",
    name: "test2",
    handler: (connection, _) => {
        historyGame.joinUser(connection);
    },
});
