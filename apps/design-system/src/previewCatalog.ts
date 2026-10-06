import catalog from "./preview-catalog.json";

export function findPreview(scenario: string) {
  return catalog.find((example) => example.id === scenario);
}

export function previewUrl(scenario: string): string {
  return `${import.meta.env.BASE_URL}product-preview/preview.html?scenario=${encodeURIComponent(scenario)}`;
}

export function previewsIn(group: string) {
  return catalog.filter((example) => example.group === group);
}
