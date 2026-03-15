#!/usr/bin/env node

/**
 * Weshky Browser - Development Server
 * Serves the browser chrome for development/preview purposes.
 */

"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PORT = 3000;

const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".json": "application/json",
};

const server = http.createServer((req, res) => {
  let filePath = path.join(ROOT, "src", req.url === "/" ? "/browser/chrome/browser.html" : req.url);

  // Prevent directory traversal
  if (!filePath.startsWith(path.join(ROOT, "src"))) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === "ENOENT") {
        res.writeHead(404);
        res.end("Not found");
      } else {
        res.writeHead(500);
        res.end("Internal server error");
      }
      return;
    }

    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Weshky Dev Server running at http://localhost:${PORT}`);
  console.log("Press Ctrl+C to stop");
});
