import { z } from "zod";

export const parser = z.enum(["history", "templates"]);
