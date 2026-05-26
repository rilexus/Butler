import { build } from "vite";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const entry = join(__dirname, "../src/main/mcp/ui/mcp-app.ts");
const outDir = join(__dirname, "../dist/mcp-app-tmp");

await build({
  logLevel: "silent",
  build: {
    outDir,
    emptyOutDir: true,
    lib: {
      entry,
      name: "McpApp",
      fileName: "mcp-app",
      formats: ["iife"],
    },
  },
});

const { readFileSync, readdirSync } = await import("fs");
const [file] = readdirSync(outDir).filter((f) => f.endsWith(".js"));
const code = readFileSync(join(outDir, file), "utf-8");

writeFileSync(
  join(__dirname, "../src/main/mcp/ui/mcp-app-bundle.ts"),
  `// AUTO-GENERATED — run: npm run bundle:mcp-app\nexport default ${JSON.stringify(code)};\n`,
);

// clean up temp dir
const { rmSync } = await import("fs");
rmSync(outDir, { recursive: true });

console.log("mcp-app bundle written to src/main/mcp/ui/mcp-app-bundle.ts");
