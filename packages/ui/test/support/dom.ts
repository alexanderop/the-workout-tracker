// A lookup that fails with a clear message instead of returning null, so tests
// need no type assertions.
export function find(root: ParentNode, selector: string): HTMLElement {
  const element = root.querySelector<HTMLElement>(selector);
  if (!element) throw new Error(`No element matches ${selector}`);
  return element;
}
