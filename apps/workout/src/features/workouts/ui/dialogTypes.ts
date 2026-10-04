import type { Command } from "../domain";
export type Confirmation = {
  title: string;
  description: string;
  command: Command;
};
