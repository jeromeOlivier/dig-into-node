#!/usr/bin/env node

"use strict";

const util = require("util");
const path = require("path");
const fs = require("fs");
const Tranform = require("stream").Transform;
const zlib = require("zlib");

const args = require("minimist")(process.argv.slice(2), {
  boolean: ["help", "in", "out", "compress", "decompress"],
  string: ["file"],
});

const BASE_PATH = path.resolve(process.env.BASE_PATH || __dirname);

let OUTFILE = path.join(BASE_PATH, "out.txt");

if (process.env.HELLO) {
  console.log(process.env.HELLO);
}

if (args.help) {
  printHelp();
} else if (args.in || args._.includes("-")) {
  processFile(process.stdin);
} else if (args.file) {
  const stream = fs.createReadStream(path.join(BASE_PATH, args.file));
  processFile(stream);
} else {
  error("incorrect usage", true);
}

function processFile(outputStream) {
  let targetStream;

  if (args.decompress) {
    console.log("Decompressing the input...");
    let gunzipStream = zlib.createGunzip();
    outputStream = outputStream.pipe(gunzipStream);
  }

  if (args.compress) {
    console.log("Compressing the output...");
    const gzipStream = zlib.createGzip();
    outputStream = outputStream.pipe(gzipStream);
    OUTFILE = `${OUTFILE}.gz`;
  }

  if (args.out) {
    targetStream = process.stdout;
  } else {
    targetStream = fs.createWriteStream(OUTFILE);
  }

  outputStream.pipe(targetStream);
}

function error(msg, includeHelp = false) {
  console.log("Stream error", msg);
  if (includeHelp) {
    console.log("");
    printHelp();
  }
}

// *******************************************
function printHelp() {
  console.log("ex2 usage:");
  console.log("");
  console.log("--help              print this help");
  console.log("--file={filename}   print file");
  console.log("--in, -             process stdin");
  console.log("--out               print to stdout");
  console.log("--compress          gzip the output");
  console.log("--decompress        un-gzip the input");
  console.log("");
}
