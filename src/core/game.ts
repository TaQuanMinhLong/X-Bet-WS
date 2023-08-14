import { Player, RoundStatus } from "./schema";

export class Game {
  roomId: string;
  roundNum: number;
  roundStatus: RoundStatus;
  phrase: "START" | "UP_DOWN" | "RSP" | "END";
  players: Player[];
  spectators: Player[];
  constructor(roomId: string, players: string[]) {
    this.roomId = roomId;
    this.roundNum = 0;
    this.roundStatus = "idle";
    this.phrase = "START";
    this.players = players.map((id) => ({ id, choice: null, state: "playing" }));
    this.spectators = [];
  }
  start() {
    this.roundNum = 1;
    this.phrase = "UP_DOWN";
  }
  receiveChoice() {}
}
