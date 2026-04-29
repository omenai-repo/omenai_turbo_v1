/**
 * Removes duplicated vi.mock blocks from test files now that they live in
 * __tests__/setup.ts or __tests__/helpers/util-mock.ts.
 *
 * Blocks removed from every file:
 *   - vi.mock("next/server", ...)
 *   - vi.mock("@omenai/rollbar-config", ...)
 *
 * Blocks replaced with a 3-line async factory (pointing to helpers/util-mock):
 *   - vi.mock("...app/api/util", () => { class BadRequestError... validateRequestBody })
 *   - vi.mock("...app/api/util", () => { class BadRequestError... validateGetRouteParams })
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testsRoot = path.join(__dirname, "..", "__tests__");
const helpersDir = path.join(testsRoot, "helpers");

// ──────────────────────────────────────────────────────────────────────────────
// Exact string blocks to strip
// ──────────────────────────────────────────────────────────────────────────────
const NEXT_SERVER_BLOCK = `vi.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) =>
      new Response(JSON.stringify(body), {
        ...init,
        headers: { "Content-Type": "application/json" },
      }),
  },
}));`;

const ROLLBAR_BLOCK = `vi.mock("@omenai/rollbar-config", () => ({
  rollbarServerInstance: { error: vi.fn() },
}));`;

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────
function findTestFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "helpers") {
      results.push(...findTestFiles(full));
    } else if (entry.isFile() && entry.name.endsWith(".test.ts")) {
      results.push(full);
    }
  }
  return results;
}

function stripBlock(content, block) {
  // Remove the block followed by optional blank lines, leaving at most one blank line.
  return content
    .split(block + "\n\n")
    .join("\n")
    .split(block + "\n")
    .join("")
    .split(block)
    .join("");
}

function relativeHelperPath(testFilePath) {
  return path.relative(path.dirname(testFilePath), helpersDir).replace(/\\/g, "/");
}

// Regex that matches a util mock block that starts with `() => {`
// (i.e. NOT `() => ({`) and contains BadRequestError.
// Captures: [1] quoted util path, [2] full matched block
const UTIL_MOCK_RE =
  /vi\.mock\(("[^"]*\/app\/api\/util")\s*,\s*\(\)\s*=>\s*\{\n([\s\S]*?)\n\}\);\n/g;

// ──────────────────────────────────────────────────────────────────────────────
// Process files
// ──────────────────────────────────────────────────────────────────────────────
let modifiedCount = 0;

for (const filePath of findTestFiles(testsRoot)) {
  let content = fs.readFileSync(filePath, "utf-8");
  const original = content;

  // 1. Strip universal blocks
  content = stripBlock(content, NEXT_SERVER_BLOCK);
  content = stripBlock(content, ROLLBAR_BLOCK);

  // 2. Replace complex util mocks with async factory
  content = content.replace(UTIL_MOCK_RE, (match, quotedPath, body) => {
    if (!body.includes("BadRequestError")) return match; // simple stub – keep as-is

    const helperPath = relativeHelperPath(filePath);
    const hasValidateRequestBody = body.includes("validateRequestBody");
    const factoryFn = hasValidateRequestBody
      ? "buildValidateRequestBodyMock"
      : "buildValidateGetRouteParamsMock";

    return (
      `vi.mock(${quotedPath}, async () => {\n` +
      `  const { ${factoryFn} } = await import("${helperPath}/util-mock");\n` +
      `  return ${factoryFn}();\n` +
      `});\n`
    );
  });

  // 3. Collapse any accidental triple blank lines to double
  content = content.replace(/\n{3,}/g, "\n\n");

  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf-8");
    modifiedCount++;
    console.log("✓", path.relative(testsRoot, filePath));
  }
}

console.log(`\nDone — modified ${modifiedCount} files.`);
