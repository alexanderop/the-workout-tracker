import type { Command } from "../domain";
export type Confirmation = {
  /** `destructive` removes or discards data and gets the destructive button. */
  intent: "destructive" | "neutral";
  title: string;
  description: string;
  /** Visible label of the button that runs the command. */
  actionLabel: string;
  command: Command;
};
