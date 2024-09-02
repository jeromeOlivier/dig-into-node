#!/usr/bin/env node

"use strict";

// const util = require("util");
const path = require("path");
const fs = require("fs");
// const Tranform = require("stream").Transform;
const zlib = require("zlib");
const { AbortController } = require("abort-controller");

const args = require("minimist")(process.argv.slice(2), {
  boolean: ["help", "in", "out", "compress", "decompress"],
  string: ["file"],
});

const BASE_PATH = path.resolve(process.env.BASE_PATH || __dirname);

let OUTFILE = path.join(BASE_PATH, "out.txt");

if (args.help) {
  printHelp();
} else if (args.in || args._.includes("-")) {
  processFile(process.stdin).catch(error);
} else if (args.file) {
  const stream = fs.createReadStream(path.join(BASE_PATH, args.file));
  processFile(stream)
    .then(() => console.log("Complete"))
    .catch((err) => console.error(err));
} else {
  error("incorrect usage", true);
}

async function processFile(outputStream) {
  let targetStream;

  if (args.decompress) {
    let gunzipStream = zlib.createGunzip();
    outputStream = outputStream.pipe(gunzipStream);
  }

  if (args.compress) {
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

  const controller = new AbortController();
  const signal = controller.signal;

  // set a timeout to abort the operation after 3 miliseconds
  setTimeout(() => controller.abort(), 3);

  try {
    await streamComplete(outputStream, targetStream, signal);
  } catch (error) {
    if (signal.aborted) {
      console.error("Operation was aborted");
    } else {
      throw error;
    }
  }
}

function streamComplete(outputStream, targetStream, signal) {
  return new Promise((resolve, reject) => {
    let aborted = false;

    signal.addEventListener("abort", () => {
      aborted = true;
      outputStream.unpipe(targetStream);
      outputStream.destroy();
      reject(new DOMException("Aborted", "AbortError"));
    });

    outputStream.on("end", () => {
      if (!aborted) {
        resolve();
      }
    });

    outputStream.on("error", (error) => {
      if (!aborted) {
        reject(error);
      }
    });

    targetStream.on("error", (error) => {
      if (!aborted) {
        reject(error);
      }
    });
  });
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
  console.log("ex3 usage:");
  console.log("");
  console.log("--help              print this help");
  console.log("--file={filename}   print file");
  console.log("--in, -             process stdin");
  console.log("--out               print to stdout");
  console.log("--compress          gzip the output");
  console.log("--decompress        un-gzip the input");
  console.log("");
}
