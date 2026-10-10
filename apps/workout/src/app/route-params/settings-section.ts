import { z } from "zod";
import { settingsSections } from "../settings/sections";

// Nullish: no section means the hub.
export const parser = z.enum(settingsSections).nullish();
