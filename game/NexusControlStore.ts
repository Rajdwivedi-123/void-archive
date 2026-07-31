import { createNexusControls, type NexusControls } from "./gameTypes";

export class NexusControlStore {
  private state: NexusControls = createNexusControls();
  setMovement(key: "forward" | "backward" | "left" | "right" | "sprint", value: boolean) { this.state[key] = value; }
  pulseMovement(key: "forward" | "backward" | "left" | "right") { this.state[key] = true; window.setTimeout(() => { this.state[key] = false; }, 220); }
  addLook(x: number, y: number) { this.state.lookX += x; this.state.lookY += y; }
  snapshot() { return this.state; }
  consumeLook() { const look = { x: this.state.lookX, y: this.state.lookY }; this.state.lookX = 0; this.state.lookY = 0; return look; }
  clear() { this.state = createNexusControls(); }
}
