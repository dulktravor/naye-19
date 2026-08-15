import { copyFile, mkdir } from "node:fs/promises";

await mkdir(new URL("../dist/server/", import.meta.url), { recursive: true });
await copyFile(
  new URL("../worker/index.js", import.meta.url),
  new URL("../dist/server/index.js", import.meta.url),
);
