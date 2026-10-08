import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
const root = resolve('apps/workout/dist');
const types = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2'};
const server = createServer(async (request,response) => {
  const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
  const file = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(root + '/')) { response.writeHead(403).end(); return; }
  try {const body=await readFile(file);response.writeHead(200,{'Content-Type':types[extname(file)] ?? 'application/octet-stream'}).end(body);}
  catch {response.writeHead(404).end();}
});
await new Promise(resolve => server.listen(4190,'127.0.0.1',resolve));
try {await import('./probe.mjs');}
finally {await new Promise(resolve => server.close(resolve));}
