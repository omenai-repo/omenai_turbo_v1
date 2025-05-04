const fs = require("fs");
const path = require("path");

const HIGHLIGHT_IMPORT = `import { withAppRouterHighlight } from "@highlight-run/next";`;
const isDryRun = !process.argv.includes("--write");

function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");

  if (content.includes("withAppRouterHighlight")) {
    console.log(`⏩ Skipped (already wrapped): ${filePath}`);
    return;
  }

  const methodRegex =
    /export const (GET|POST|PUT|DELETE|PATCH|OPTIONS|HEAD)\s*=\s*(async\s*\([^\)]*\)|\([^\)]*\)|\w+)/g;

  let modified = false;
  const replacements = [];

  const updatedContent = content.replace(
    methodRegex,
    (match, method, handlerName) => {
      modified = true;
      replacements.push(`${method} => wrapped`);
      return `export const ${method} = withAppRouterHighlight()(${handlerName})`;
    }
  );

  if (!modified) return;

  let finalContent = updatedContent;
  if (!finalContent.includes(HIGHLIGHT_IMPORT)) {
    finalContent = `${HIGHLIGHT_IMPORT}\n${finalContent}`;
  }

  if (isDryRun) {
    console.log(`🧪 Dry run: Would update ${filePath}`);
    return;
  }

  const backupPath = `${filePath}.bak`;
  fs.writeFileSync(backupPath, content, "utf-8");
  fs.writeFileSync(filePath, finalContent, "utf-8");
  console.log(`✅ Updated: ${filePath} (backup at ${backupPath})`);
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
      processFile(fullPath);
    }
  }
}

// Modify this if your routes are not under app/api
const apiDir = path.join(__dirname, "app", "api");
walk(apiDir);

console.log(
  isDryRun
    ? "\n🔍 Dry run complete. Run with `--write` to apply changes."
    : "\n✅ Migration complete. Original files backed up as .bak"
);
