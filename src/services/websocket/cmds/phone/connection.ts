import { SocketCommand } from "@services/websocket/core";

export const connectionCommand = new SocketCommand({
    game: "history",
    name: "test2",
    handler: (connection, _, vkId) => {
        connection.send({
            userJoined: {
                vkId,
            },
        });
    },
});
