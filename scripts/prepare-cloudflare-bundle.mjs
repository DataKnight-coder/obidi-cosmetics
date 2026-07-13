import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const schemaPath = path.join(root, "prisma", "schema.prisma");
const handlerPath = path.join(
  root,
  ".open-next",
  "server-functions",
  "default",
  "handler.mjs",
);
const prismaWasmPath = path.join(
  root,
  ".open-next",
  "server-functions",
  "default",
  "node_modules",
  ".prisma",
  "client",
  "query_engine_bg.wasm",
);
const middlewareWasmDir = path.join(root, ".open-next", "middleware", "wasm");

const schema = await readFile(schemaPath, "utf8");
if (!/datasource\s+db\s*{[\s\S]*?provider\s*=\s*["']sqlite["'][\s\S]*?}/m.test(schema)) {
  throw new Error("Cloudflare bundle preparation is restricted to the SQLite datasource");
}

const hash = (buffer) => createHash("sha256").update(buffer).digest("hex");
const prismaWasmHash = hash(await readFile(prismaWasmPath));
const middlewareWasmFiles = (await readdir(middlewareWasmDir)).filter((file) =>
  file.endsWith(".wasm"),
);

let canonicalWasmFile;
for (const file of middlewareWasmFiles) {
  if (hash(await readFile(path.join(middlewareWasmDir, file))) === prismaWasmHash) {
    canonicalWasmFile = file;
    break;
  }
}

if (!canonicalWasmFile) {
  throw new Error("The OpenNext middleware bundle does not contain the Prisma SQLite WASM module");
}

let handler = await readFile(handlerPath, "utf8");
const sqliteImport = /import\((["'])[^"']*query_engine_bg(?:\.sqlite)?\.wasm\1\)/g;
const unsupportedImport =
  /import\((["'])[^"']*query_engine_bg\.(?:mysql|postgresql)\.wasm\1\)/g;

let sqliteImportCount = 0;
handler = handler.replace(sqliteImport, () => {
  sqliteImportCount += 1;
  return `import("../../middleware/wasm/${canonicalWasmFile}")`;
});

let unsupportedImportCount = 0;
handler = handler.replace(unsupportedImport, () => {
  unsupportedImportCount += 1;
  return 'Promise.reject(new Error("Unsupported Prisma engine in SQLite-only Cloudflare bundle"))';
});

if (sqliteImportCount < 2 || unsupportedImportCount < 2) {
  throw new Error(
    `Unexpected Prisma WASM imports: sqlite=${sqliteImportCount}, unsupported=${unsupportedImportCount}`,
  );
}
if (/import\((["'])[^"']*query_engine_bg(?:\.(?:mysql|postgresql|sqlite))?\.wasm\1\)/.test(handler)) {
  throw new Error("Prisma WASM imports remain after Cloudflare bundle preparation");
}

await writeFile(handlerPath, handler);
console.log(
  `Prepared SQLite-only Cloudflare bundle using ${canonicalWasmFile}; deduplicated ${sqliteImportCount} imports and removed ${unsupportedImportCount} unreachable engines.`,
);
