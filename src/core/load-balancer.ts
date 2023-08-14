import { MAX_PLAYER } from "./schema";
import os from "node:os";

const MAX_CPU = os.cpus().length;

export class LoadBalancer {
  private counter: number;
  private currentThread: number;
  private workerPool: Map<number, Worker>;
  constructor() {
    this.workerPool = new Map<number, Worker>();
    this.currentThread = 1;
    this.counter = 0;
  }
  async init(): Promise<void> {
    const threads = [...Array(MAX_CPU).keys()].map((_, index) => index + 1);
    let initalized = 0;
    return new Promise((resolve, _) => {
      for (const thread of threads) {
        const workerURL = new URL("worker.ts", import.meta.url).href;
        const worker = new Worker(workerURL);
        const workerId = thread;
        worker.postMessage({ type: "init", workerId });
        worker.onmessage = (e) => {
          if (e.data.success) {
            console.log("Initialized worker", workerId);
            this.workerPool.set(workerId, worker);
            initalized++;
          }
          if (initalized === threads.length) {
            console.log("Resolved");
            resolve();
          }
        };
      }
    });
  }
  async assign(playerId: string): Promise<void> {
    if (this.counter >= MAX_PLAYER) {
      console.log(`Number of players reached maximum, switching to next thread`);
      this.counter = 0;
      this.currentThread++;
    }
    if (this.currentThread > MAX_CPU) {
      console.log(`Back to 1st thread`);
      this.currentThread = 1;
    }
    const workerId = this.currentThread;
    const worker = this.workerPool.get(workerId);
    if (!worker) throw new Error(`Worker ID: ${workerId} does not exist`);
    return new Promise((resolve, _) => {
      worker.onmessage = (e) => {
        if (e.data.success) {
          this.counter++;
          resolve();
        }
      };
      worker.postMessage({ type: "new-player", threadId: workerId, playerId });
    });
  }
}
