#!/usr/bin/env node

/**
 * Weshky Browser - Build Script
 * Downloads Firefox source, applies Weshky patches, and builds the browser.
 */

"use strict";

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const FIREFOX_VERSION = "128.0";
const SOURCE_URL = `https://archive.mozilla.org/pub/firefox/releases/${FIREFOX_VERSION}/source/firefox-${FIREFOX_VERSION}.source.tar.xz`;
const BUILD_DIR = path.join(ROOT, "build");
const SOURCE_DIR = path.join(BUILD_DIR, `firefox-${FIREFOX_VERSION}`);
const OBJ_DIR = path.join(SOURCE_DIR, "obj-weshky");

function log(msg) {
  const timestamp = new Date().toISOString().slice(11, 19);
  console.log(`[${timestamp}] ${msg}`);
}

function run(cmd, cwd = ROOT) {
  log(`> ${cmd}`);
  execSync(cmd, { cwd, stdio: "inherit" });
}

function ensureBuildDir() {
  if (!fs.existsSync(BUILD_DIR)) {
    fs.mkdirSync(BUILD_DIR, { recursive: true });
  }
}

function downloadSource() {
  const tarball = path.join(BUILD_DIR, `firefox-${FIREFOX_VERSION}.source.tar.xz`);
  if (fs.existsSync(SOURCE_DIR)) {
    log("Firefox source already exists, skipping download");
    return;
  }
  if (!fs.existsSync(tarball)) {
    log(`Downloading Firefox ${FIREFOX_VERSION} source...`);
    run(`curl -L -o "${tarball}" "${SOURCE_URL}"`, BUILD_DIR);
  }
  log("Extracting source...");
  run(`tar xf "${tarball}"`, BUILD_DIR);
}

function applyBranding() {
  log("Applying Weshky branding...");
  const brandingDir = path.join(SOURCE_DIR, "browser/branding/weshky");
  fs.mkdirSync(brandingDir, { recursive: true });

  // Copy branding files
  const iconsSrc = path.join(ROOT, "src/icons");
  const files = fs.readdirSync(iconsSrc);
  for (const file of files) {
    fs.copyFileSync(path.join(iconsSrc, file), path.join(brandingDir, file));
  }

  // Create branding configure.sh
  fs.writeFileSync(
    path.join(brandingDir, "configure.sh"),
    `MOZ_APP_DISPLAYNAME="Weshky"\nMOZ_APP_VENDOR="Weshky"\n`
  );

  // Create brand.properties
  fs.writeFileSync(
    path.join(brandingDir, "brand.properties"),
    [
      "brandShortName=Weshky",
      "brandFullName=Weshky Browser",
      "vendorShortName=Weshky",
    ].join("\n")
  );
}

function applyPreferences() {
  log("Applying Weshky preferences...");
  const prefsFile = path.join(ROOT, "config/weshky.js");
  const targetDir = path.join(SOURCE_DIR, "browser/app/profile");
  fs.mkdirSync(targetDir, { recursive: true });
  fs.copyFileSync(prefsFile, path.join(targetDir, "weshky.js"));
}

function applyPolicies() {
  log("Applying Weshky policies...");
  const policiesSrc = path.join(ROOT, "policies/policies.json");
  const targetDir = path.join(SOURCE_DIR, "browser/app/distribution");
  fs.mkdirSync(targetDir, { recursive: true });
  fs.copyFileSync(policiesSrc, path.join(targetDir, "policies.json"));
}

function applyMozconfig() {
  log("Applying mozconfig...");
  fs.copyFileSync(
    path.join(ROOT, "mozconfig"),
    path.join(SOURCE_DIR, "mozconfig")
  );
}

function buildBrowser() {
  log("Building Weshky Browser...");
  run("./mach build", SOURCE_DIR);
}

function packageBrowser() {
  log("Packaging Weshky Browser...");
  run("./mach package", SOURCE_DIR);
}

// Main
async function main() {
  const args = process.argv.slice(2);
  const skipDownload = args.includes("--skip-download");
  const packageOnly = args.includes("--package-only");

  log("Weshky Browser Build System");
  log("===========================");

  ensureBuildDir();

  if (!skipDownload) {
    downloadSource();
  }

  if (!packageOnly) {
    applyBranding();
    applyPreferences();
    applyPolicies();
    applyMozconfig();
    buildBrowser();
  }

  if (args.includes("--package") || packageOnly) {
    packageBrowser();
  }

  log("Build complete.");
}

main().catch((err) => {
  console.error("[BUILD ERROR]", err.message);
  process.exit(1);
});
