import { z } from "zod";

export const MAX_PLAYER = 8;

const $rsp_choice = z.object({
  type: z.literal("RSP"),
  value: z.enum(["ROCK", "SCISSORS", "PAPER"]),
});

const $updown_choice = z.object({
  type: z.literal("UP_DOWN"),
  value: z.enum(["UP", "DOWN"]),
});

export const $choice = z.union([$rsp_choice, $updown_choice]).nullable();

export type Choice = z.infer<typeof $choice>;

export const $player_state = z.enum(["playing", "spectating", "exited"]);

export type PlayerState = z.infer<typeof $player_state>;

export type Player = {
  id: string;
  choice: Choice;
  state: PlayerState;
};

export const $round_status = z.enum(["idle", "waiting", "processing", "result"]);

export type RoundStatus = z.infer<typeof $round_status>;
