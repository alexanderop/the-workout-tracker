/** The Settings detail pages: `/settings/<section>`. */
export const settingsSections = [
  "training",
  "appearance",
  "language",
  "install",
  "export",
  "import",
  "delete",
] as const;
export type SettingsSection = (typeof settingsSections)[number];
