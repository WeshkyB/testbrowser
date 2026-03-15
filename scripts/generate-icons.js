#!/usr/bin/env node

/**
 * Weshky Browser - Icon Generator
 * Generates PNG icons in multiple sizes from the SVG source.
 * Requires: sharp (npm install sharp)
 */

"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const ICONS_DIR = path.join(ROOT, "src/icons");
const OUTPUT_DIR = path.join(ROOT, "build/icons");

const SIZES = [16, 24, 32, 48, 64, 128, 256, 512];

async function generateIcons() {
  let sharp;
  try {
    sharp = require("sharp");
  } catch {
    console.error("Error: sharp is required. Run: npm install sharp");
    process.exit(1);
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const svgPath = path.join(ICONS_DIR, "weshky-logo.svg");
  const svgBuffer = fs.readFileSync(svgPath);

  for (const size of SIZES) {
    const outputPath = path.join(OUTPUT_DIR, `weshky-${size}.png`);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`Generated: weshky-${size}.png`);
  }

  // Generate ICO for Windows
  console.log("Icon generation complete.");
}

generateIcons().catch((err) => {
  console.error("Error generating icons:", err.message);
  process.exit(1);
});
