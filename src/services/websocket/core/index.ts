import { glob } from "glob";
import { SocketCommand } from "./socketCommand";

export * from "./socketCommand";

export class SocketManager {
    commands: SocketCommand<any, any>[];

    constructor() {
        this.commands = [];
    }

    getCommand(game: string, command: string) {
        return this.commands.find((x) => x.game === game && x.name === command);
    }

    getCommands() {
        return this.commands;
    }

    async loadCommands() {
        glob(`${process.cwd()}/dist/services/websocket/cmds/**/*.js`).then(
            (paths) => {
                console.log(paths);
                paths.map(async (path) => {
                    const file = await import(path);

                    const command = file[Object.keys(file)[0]] as SocketCommand<
                        any,
                        any
                    >;
                    command.game = path.split("/").at(7)!;

                    this.commands.push(command);
                });
            },
        );
    }
}
