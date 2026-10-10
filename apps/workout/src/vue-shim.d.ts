// Lets plain TypeScript entry points (main.ts) import Vue components; vue-tsc
// still resolves real .vue files to their own types.
declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent;
  export default component;
}
