import { GameMatcher } from "./matcher";
import { z } from "zod";

const $init = z.object({
  type: z.literal("init"),
  workerId: z.number(),
});

const $handler = z.object({
  type: z.literal("new-player"),
  threadId: z.number(),
  playerId: z.string(),
});

let workerId: number;

const gameMatcher = new GameMatcher({
  onAssigned(e) {
    console.log(`Assigned player ${e.playerId} to room: ${e.roomId}`);
  },
  onGameStart(e) {
    console.log(
      `Worker ${workerId} starting game at room ${e.roomId} with ${
        e.players.length
      } players: [${e.players.join(", ")}]`
    );
  },
});

self.onmessage = (e: MessageEvent) => {
  switch (e.data.type) {
    case "init": {
      workerId = $init.parse(e.data).workerId;
      self.postMessage({ type: "init", workerId, success: true });
      break;
    }
    case "new-player": {
      const { playerId, threadId, type } = $handler.parse(e.data);
      if (workerId === threadId) {
        console.log(`Worker ${workerId} handling new player ${playerId}`);
        if (gameMatcher.isAssigned(playerId))
          throw new Error(`Player ${playerId} has already been assigned`);
        gameMatcher.assign(playerId);
        self.postMessage({ type, workerId, playerId, success: true });
      }
      break;
    }
    default:
      throw new Error("Invalid event");
  }
};
