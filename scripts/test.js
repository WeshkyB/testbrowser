#!/usr/bin/env node

/**
 * Weshky Browser - Test Runner
 * Runs basic validation tests on the browser source.
 */

"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  PASS  ${name}`);
    passed++;
  } catch (err) {
    console.log(`  FAIL  ${name}: ${err.message}`);
    failed++;
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg || "Assertion failed");
}

function fileExists(relativePath) {
  return fs.existsSync(path.join(ROOT, relativePath));
}

function fileContains(relativePath, text) {
  const content = fs.readFileSync(path.join(ROOT, relativePath), "utf-8");
  return content.includes(text);
}

console.log("\nWeshky Browser - Test Suite\n");

// Structure tests
console.log("Project Structure:");
test("package.json exists", () => assert(fileExists("package.json")));
test("mozconfig exists", () => assert(fileExists("mozconfig")));
test("config/weshky.js exists", () => assert(fileExists("config/weshky.js")));
test("policies/policies.json exists", () => assert(fileExists("policies/policies.json")));
test("browser.html exists", () => assert(fileExists("src/browser/chrome/browser.html")));
test("browser.js exists", () => assert(fileExists("src/browser/chrome/browser.js")));
test("theme CSS exists", () => assert(fileExists("src/browser/themes/weshky-theme.css")));

// Icon tests
console.log("\nIcons:");
test("logo SVG exists", () => assert(fileExists("src/icons/weshky-logo.svg")));
test("toolbar icons exist", () => assert(fileExists("src/icons/toolbar-icons.svg")));
test("16px icon exists", () => assert(fileExists("src/icons/weshky-icon-16.svg")));
test("32px icon exists", () => assert(fileExists("src/icons/weshky-icon-32.svg")));

// Component tests
console.log("\nComponents:");
test("tab-manager.js exists", () => assert(fileExists("src/browser/components/tab-manager.js")));
test("navigation.js exists", () => assert(fileExists("src/browser/components/navigation.js")));
test("urlbar.js exists", () => assert(fileExists("src/browser/components/urlbar.js")));

// Module tests
console.log("\nModules:");
test("shield.js exists", () => assert(fileExists("src/modules/adblocker/shield.js")));
test("filter-engine.js exists", () => assert(fileExists("src/modules/adblocker/filter-engine.js")));
test("fingerprint-guard.js exists", () => assert(fileExists("src/modules/antifingerprint/fingerprint-guard.js")));
test("performance-monitor.js exists", () => assert(fileExists("src/modules/performance/performance-monitor.js")));

// Configuration tests
console.log("\nConfiguration:");
test("privacy.resistFingerprinting enabled", () =>
  assert(fileContains("config/weshky.js", 'pref("privacy.resistFingerprinting", true)')));
test("tracking protection enabled", () =>
  assert(fileContains("config/weshky.js", 'pref("privacy.trackingprotection.enabled", true)')));
test("telemetry disabled", () =>
  assert(fileContains("config/weshky.js", 'pref("toolkit.telemetry.enabled", false)')));
test("HTTPS-only mode enabled", () =>
  assert(fileContains("config/weshky.js", 'pref("dom.security.https_only_mode", true)')));
test("WebRTC leak prevention", () =>
  assert(fileContains("config/weshky.js", 'pref("media.peerconnection.ice.default_address_only", true)')));
test("Weshky Shield config exists", () =>
  assert(fileContains("config/weshky.js", 'pref("weshky.shield.enabled", true)')));

// Policy tests
console.log("\nPolicies:");
test("telemetry disabled in policy", () =>
  assert(fileContains("policies/policies.json", '"DisableTelemetry": true')));
test("HTTPS-only in policy", () =>
  assert(fileContains("policies/policies.json", '"HttpsOnlyMode": "force_enabled"')));

// Build script tests
console.log("\nBuild Scripts:");
test("build.js exists", () => assert(fileExists("scripts/build.js")));
test("dev.js exists", () => assert(fileExists("scripts/dev.js")));
test("generate-icons.js exists", () => assert(fileExists("scripts/generate-icons.js")));
test("clean.js exists", () => assert(fileExists("scripts/clean.js")));

// Summary
console.log(`\n${passed + failed} tests, ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
