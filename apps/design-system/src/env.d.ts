/// <reference types="@histoire/plugin-vue/components" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent;
  export default component;
}
