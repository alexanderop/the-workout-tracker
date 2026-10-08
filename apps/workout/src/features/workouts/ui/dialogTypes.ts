import type { Command } from "../domain";
export type Confirmation = {
  title: string;
  description: string;
  /** Visible label of the button that runs the command. */
  actionLabel: string;
  command: Command;
};
