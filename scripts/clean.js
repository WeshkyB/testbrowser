#!/usr/bin/env node

/**
 * Weshky Browser - Clean Build Artifacts
 */

"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const BUILD_DIR = path.join(ROOT, "build");

if (fs.existsSync(BUILD_DIR)) {
  fs.rmSync(BUILD_DIR, { recursive: true, force: true });
  console.log("Build directory cleaned.");
} else {
  console.log("Nothing to clean.");
}
