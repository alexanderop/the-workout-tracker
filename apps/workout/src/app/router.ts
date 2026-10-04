import { createWebHashHistory } from "vue-router";
import { experimental_createRouter } from "vue-router/experimental";
import { resolver, handleHotUpdate } from "vue-router/auto-resolver";

export const router = experimental_createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  resolver,
  scrollBehavior(to, from, savedPosition) {
    if (to.path === from.path) return false;
    return savedPosition ?? { top: 0 };
  },
});

if (import.meta.hot) handleHotUpdate(router);

declare module "vue-router" {
  interface TypesConfig {
    Router: typeof router;
  }
}
