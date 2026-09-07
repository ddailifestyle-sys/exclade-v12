import { mkdir, cp, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const clientDir = join(root, "dist", "client");
const publicDir = join(root, ".output", "public");
const server = await import(pathToFileURL(join(root, "dist", "server", "server.js")));
const routes = ["/", "/about", "/contact", "/crew", "/events", "/register"];

await cp(clientDir, publicDir, { recursive: true, force: true });

for (const route of routes) {
  const response = await server.default.fetch(new Request(`http://localhost${route}`));
  if (!response.ok) {
    throw new Error(`Could not prerender ${route}: ${response.status}`);
  }

  const outputDir = route === "/" ? publicDir : join(publicDir, route.slice(1));
  await mkdir(outputDir, { recursive: true });
  await writeFile(join(outputDir, "index.html"), await response.text());
}

console.log(`Prerendered ${routes.length} Firebase routes to ${publicDir}`);