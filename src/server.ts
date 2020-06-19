import { v4 as uuid } from "uuid";
import WebSocket = require("ws");
import { ErrorCodes, Message, GameEngine, GameStatus } from "./model";
import TiciTacaToeyGameEngine from "./TiciTacaToeyGameEngine";

const log = (engine: GameEngine) => {
  console.clear();
  console.log(
    `
  /$$$$$$$$ /$$$$$$  /$$$$$$  /$$$$$$    /$$$$$$$$ /$$$$$$   /$$$$$$   /$$$$$$       /$$$$$$$$ /$$$$$$  /$$$$$$$$ /$$     /$$
  |__  $$__/|_  $$_/ /$$__  $$|_  $$_/   |__  $$__//$$__  $$ /$$__  $$ /$$__  $$     |__  $$__//$$__  $$| $$_____/|  $$   /$$/
     | $$     | $$  | $$  \__/  | $$        | $$  | $$  \ $$| $$  \__/| $$  \ $$        | $$  | $$  \ $$| $$       \  $$ /$$/ 
     | $$     | $$  | $$        | $$ /$$$$$$| $$  | $$$$$$$$| $$      | $$$$$$$$ /$$$$$$| $$  | $$  | $$| $$$$$     \  $$$$/  
     | $$     | $$  | $$        | $$|______/| $$  | $$__  $$| $$      | $$__  $$|______/| $$  | $$  | $$| $$__/      \  $$/   
     | $$     | $$  | $$    $$  | $$        | $$  | $$  | $$| $$    $$| $$  | $$        | $$  | $$  | $$| $$          | $$    
     | $$    /$$$$$$|  $$$$$$/ /$$$$$$      | $$  | $$  | $$|  $$$$$$/| $$  | $$        | $$  |  $$$$$$/| $$$$$$$$    | $$    
     |__/   |______/ \______/ |______/      |__/  |__/  |__/ \______/ |__/  |__/        |__/   \______/ |________/    |__/    
     
    Active Players Count: ${Object.values(engine.players).length}
    Active Players: ${Object.values(engine.players)
      .map((each) => each.name)
      .join(", ")}
    Active Games Count: ${Object.values(engine.games).length}
    Active Games: ${Object.values(engine.games)
      .filter((each) => each.status === GameStatus.GAME_IN_PROGRESS)
      .map((each) => each.name)
      .join(", ")}
  `
  );
};

const wss = new WebSocket.Server({ port: 8080 });

const engine = new TiciTacaToeyGameEngine();

log(engine);

wss.on("connection", (ws) => {
  const playerId = uuid();
  ws.on("message", (data: string) => {
    let message: Message = null;
    try {
      message = JSON.parse(data);
    } catch (exception) {
      ws.send(
        JSON.stringify({
          error: ErrorCodes.BAD_REQUEST,
          message: `Only valid JSON messages are supported. Please review your message and try again. Original Message: ${data}`,
        })
      );
    }

    const enrichedMessage: Message = {
      ...message,
      playerId,
      gameId: message.gameId ? message.gameId : uuid(), // nullish coalescing!!
      connection: ws,
    };

    engine.play(enrichedMessage).then(log);
  });

  ws.on("close", function close() {
    console.log("Player Disconnect - Update Game Engine State");
  });
});
