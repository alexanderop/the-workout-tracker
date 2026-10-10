import type { Translate } from "../../../i18n";

/**
 * Display text for the muscle groups and equipment of the built-in exercises.
 * Stored values stay English (they are part of persisted snapshots and
 * backups); a custom exercise may use any text, which is shown as typed.
 */
export function categoryLabel(category: string, t: Translate): string {
  switch (category) {
    case "Chest":
      return t("exercises.categories.chest");
    case "Back":
      return t("exercises.categories.back");
    case "Legs":
      return t("exercises.categories.legs");
    case "Shoulders":
      return t("exercises.categories.shoulders");
    case "Arms":
      return t("exercises.categories.arms");
    case "Core":
      return t("exercises.categories.core");
    case "Other":
      return t("exercises.categories.other");
    default:
      return category;
  }
}

export function equipmentLabel(equipment: string, t: Translate): string {
  switch (equipment) {
    case "Barbell":
      return t("exercises.equipment.barbell");
    case "Dumbbell":
      return t("exercises.equipment.dumbbell");
    case "Cable":
      return t("exercises.equipment.cable");
    case "Machine":
      return t("exercises.equipment.machine");
    case "Bodyweight":
      return t("exercises.equipment.bodyweight");
    case "Band":
      return t("exercises.equipment.band");
    case "Kettlebell":
      return t("exercises.equipment.kettlebell");
    case "EGYM":
      return t("exercises.equipment.egym");
    case "Other":
      return t("exercises.equipment.other");
    default:
      return equipment;
  }
}
