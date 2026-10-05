import { z } from "zod";

export const parser = z.enum(["home", "history", "templates"]);
