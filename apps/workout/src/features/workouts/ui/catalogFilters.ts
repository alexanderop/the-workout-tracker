import type { Exercise } from "../domain";

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
  /** Extra searchable text per exercise, such as translated category names. */
  labels?: (exercise: Exercise) => string;
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
  const query = search.trim().toLowerCase();
  return exercises
    .filter((exercise) => matchesFilters(exercise, filters))
    .filter((exercise) =>
      `${exercise.name} ${exercise.category} ${exercise.equipment} ${labels?.(exercise) ?? ""}`
        .toLowerCase()
        .includes(query),
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
