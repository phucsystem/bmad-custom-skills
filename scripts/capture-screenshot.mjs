#!/usr/bin/env node
/**
 * Lightweight Playwright screenshot capture for bmad-ui-verify.
 * Standalone fallback when Chrome MCP and gstack are unavailable.
 *
 * Usage:
 *   node scripts/capture-screenshot.mjs --url http://localhost:3000 --output shot.png
 *   node scripts/capture-screenshot.mjs --url http://localhost:3000 --viewport 390x844 --output mobile.png
 *   node scripts/capture-screenshot.mjs --url http://localhost:3000 --js "document.title"
 *
 * Options:
 *   --url <url>           Page to capture (required)
 *   --output <path>       Screenshot output path (default: screenshot.png)
 *   --viewport <WxH>      Viewport size (default: 1440x900)
 *   --js <expression>     JavaScript to evaluate and return (printed to stdout)
 *   --wait <ms>           Wait time after load before capture (default: 2000)
 *   --full-page           Capture full scrollable page
 *
 * Output (JSON to stdout):
 *   { "screenshot": "/abs/path.png", "js_result": <any>, "viewport": { "width": N, "height": N } }
 *
 * Prerequisites:
 *   npm install playwright
 *   npx playwright install chromium
 */

import { existsSync } from "node:fs";
import { resolve } from "node:path";

const args = process.argv.slice(2);

function getArg(flag) {
  const index = args.indexOf(flag);
  if (index === -1 || index + 1 >= args.length) return undefined;
  return args[index + 1];
}

function hasFlag(flag) {
  return args.includes(flag);
}

const url = getArg("--url");
const output = resolve(getArg("--output") || "screenshot.png");
const viewportRaw = getArg("--viewport") || "1440x900";
const jsExpression = getArg("--js");
const waitMs = parseInt(getArg("--wait") || "2000", 10);
const fullPage = hasFlag("--full-page");

if (!url) {
  console.error("Error: --url is required");
  process.exit(1);
}

const [viewportWidth, viewportHeight] = viewportRaw.split("x").map(Number);
if (!viewportWidth || !viewportHeight) {
  console.error("Error: --viewport must be WxH (e.g., 1440x900)");
  process.exit(1);
}

let chromium;
try {
  const playwright = await import("playwright");
  chromium = playwright.chromium;
} catch {
  console.error(
    "Error: playwright not installed. Run:\n  npm install playwright && npx playwright install chromium"
  );
  process.exit(1);
}

let browser;
try {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: viewportWidth, height: viewportHeight },
  });
  const page = await context.newPage();

  await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });

  if (waitMs > 0) {
    await page.waitForTimeout(waitMs);
  }

  await page.screenshot({ path: output, fullPage });

  let jsResult = undefined;
  if (jsExpression) {
    jsResult = await page.evaluate(jsExpression);
  }

  const result = {
    screenshot: output,
    viewport: { width: viewportWidth, height: viewportHeight },
  };
  if (jsResult !== undefined) {
    result.js_result = jsResult;
  }

  console.log(JSON.stringify(result));
} catch (error) {
  console.error(`Capture failed: ${error.message}`);
  process.exit(1);
} finally {
  if (browser) await browser.close();
}
