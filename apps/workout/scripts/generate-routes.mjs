import { createServer } from "vite";

const server = await createServer({ server: { watch: null } });
try {
  await server.environments.client.pluginContainer.buildStart({});
} finally {
  await server.close();
}
