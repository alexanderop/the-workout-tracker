import type { Exercise } from "../domain";
import { matchesSearch } from "./textSearch";

export type CatalogFilters = Readonly<{
  equipment: string;
  category: string;
  onlyCustom: boolean;
}>;
export type CatalogSort = "ascending" | "descending";
export type CatalogView = Readonly<{
  search: string;
  filters: CatalogFilters;
  sort: CatalogSort;
  /** Extra searchable fields per exercise, such as translated category names. */
  labels?: (exercise: Exercise) => readonly string[];
}>;
export const emptyCatalogFilters: CatalogFilters = {
  equipment: "",
  category: "",
  onlyCustom: false,
};

export function filterCatalog(
  exercises: readonly Exercise[],
  { search, filters, sort, labels }: CatalogView,
): Exercise[] {
  return exercises
    .filter((exercise) => matchesFilters(exercise, filters))
    .filter((exercise) =>
      matchesSearch(search, [
        exercise.name,
        exercise.category,
        exercise.equipment,
        ...(labels?.(exercise) ?? []),
      ]),
    )
    .sort((a, b) => {
      const order = a.name.localeCompare(b.name) || a.id.localeCompare(b.id);
      return sort === "ascending" ? order : -order;
    });
}

function matchesFilters(exercise: Exercise, filters: CatalogFilters): boolean {
  if (filters.equipment && exercise.equipment !== filters.equipment)
    return false;
  if (filters.category && exercise.category !== filters.category) return false;
  return !filters.onlyCustom || exercise.custom;
}
