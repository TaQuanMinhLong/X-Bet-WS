import { MAX_PLAYER } from "./schema";
import { createId } from "@paralleldrive/cuid2";

export type GameStartEvent = { roomId: string; players: string[] };
export type PlayerAssignedEvent = { playerId: string; roomId: string };
/**
 * Array of players' id
 */
type Room = string[];

type GameMatcherOptions = {
  onGameStart: (event: GameStartEvent) => any;
  onAssigned: (event: PlayerAssignedEvent) => any;
};

export class GameMatcher {
  private availableRoom?: string;
  private allPlayers: Set<string>;
  private readonly roomMap: Map<string, Room>;
  private onGameStart: (event: GameStartEvent) => any;
  private onAssigned: (event: PlayerAssignedEvent) => any;
  constructor({ onGameStart, onAssigned }: GameMatcherOptions) {
    this.roomMap = new Map<string, Room>();
    this.allPlayers = new Set<string>();
    this.availableRoom = undefined;
    this.onGameStart = onGameStart;
    this.onAssigned = onAssigned;
  }
  private initRoom(playerId: string) {
    if (this.allPlayers.has(playerId))
      throw new Error(`Player ${playerId} has already been assigned`);
    const roomId = createId();
    this.roomMap.set(roomId, [playerId]);
    this.availableRoom = roomId;
    this.allPlayers.add(playerId);
    this.onAssigned({ playerId, roomId });
    return roomId;
  }
  private assignToRoom(playerId: string, roomId: string) {
    if (this.allPlayers.has(playerId))
      throw new Error(`Player ${playerId} has already been assigned`);
    const room = this.roomMap.get(roomId);
    if (!room) throw new Error(`Room ${roomId} does not exist!`);
    if (room.length >= MAX_PLAYER) throw new Error(`Room ${roomId} reached maximum player`);
    room.push(playerId);
    this.allPlayers.add(playerId);
    this.roomMap.set(roomId, room);
    this.onAssigned({ playerId, roomId });
    if (room.length === MAX_PLAYER) {
      this.availableRoom = undefined;
      this.onGameStart({ roomId, players: room });
    }
    return roomId;
  }
  /**
   * Remove room and players of the room
   */
  removeRoom(roomId: string) {
    const room = this.roomMap.get(roomId);
    if (!room) throw new Error(`Room ${roomId} does not exist!`);
    room.forEach((id) => {
      this.allPlayers.delete(id);
    });
    this.roomMap.delete(roomId);
  }
  /**
   * Remove player from the room
   */
  removePlayer(playerId: string, roomId: string) {
    const room = this.roomMap.get(roomId);
    if (!room) throw new Error(`Room ${roomId} does not exist!`);
    this.roomMap.set(
      roomId,
      room.filter((id) => id !== playerId)
    );
    this.allPlayers.delete(playerId);
  }
  /**
   * Check if the player is already in the room
   */
  isAssigned(playerId: string, roomId?: string): boolean {
    if (!roomId) {
      return this.allPlayers.has(playerId);
    } else {
      const room = this.roomMap.get(roomId);
      if (!room) return false;
      return room.includes(playerId) && this.allPlayers.has(playerId);
    }
  }
  /**
   * Assign a player to a room
   * @returns roomId
   */
  assign(playerId: string): string {
    return this.availableRoom
      ? this.assignToRoom(playerId, this.availableRoom)
      : this.initRoom(playerId);
  }
}
