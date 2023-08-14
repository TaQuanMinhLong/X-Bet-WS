import { MAX_PLAYER } from "./schema";
import { createId } from "@paralleldrive/cuid2";

export type CreateGameInput = { roomId: string; players: string[] };
export type AssignedPlayerEventData = { playerId: string; roomId: string };
/**
 * Array of players' id
 */
type Room = string[];

type GameMatcherOptions = {
  onGameStart: (game: CreateGameInput) => any;
  onAssigned: (data: AssignedPlayerEventData) => any;
};

export class GameMatcher {
  private readonly roomMap: Map<string, Room>;
  private availableRoom?: string;
  private onGameStart: (game: CreateGameInput) => any;
  private onAssigned: (data: AssignedPlayerEventData) => any;
  constructor({ onGameStart, onAssigned }: GameMatcherOptions) {
    this.roomMap = new Map<string, Room>();
    this.onGameStart = onGameStart;
    this.onAssigned = onAssigned;
  }
  private initRoom(firstPlayer: string): void {
    const newRoom = createId();
    this.roomMap.set(newRoom, [firstPlayer]);
    this.availableRoom = newRoom;
    this.onAssigned({ playerId: firstPlayer, roomId: newRoom });
  }
  private assignToRoom(playerId: string, roomId: string): void {
    const players = this.roomMap.get(roomId);
    if (!players) throw new Error(`Room ${roomId} does not exist!`);
    if (players.length >= MAX_PLAYER) throw new Error(`Room ${roomId} reached maximum player`);
    players.push(playerId);
    this.roomMap.set(roomId, players);
    this.onAssigned({ playerId, roomId });
    if (players.length === MAX_PLAYER) {
      this.availableRoom = undefined;
      this.onGameStart({ roomId, players });
    }
  }
  removeRoom(roomId: string) {
    this.roomMap.delete(roomId);
  }
  removePlayer(playerId: string, roomId: string) {
    const room = this.roomMap.get(roomId);
    if (!room) throw new Error(`Room ${roomId} does not exist!`);
    this.roomMap.set(
      roomId,
      room.filter((id) => id !== playerId)
    );
  }
  isAssigned(playerId: string, roomId: string): boolean {
    const room = this.roomMap.get(roomId);
    if (!room) return false;
    return room.includes(playerId);
  }
  assign(playerId: string): void {
    this.availableRoom ? this.assignToRoom(playerId, this.availableRoom) : this.initRoom(playerId);
  }
}
