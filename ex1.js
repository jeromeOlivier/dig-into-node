#!/usr/bin/env node

"use strict";

const util = require("util");
const path = require("path");
const fs = require("fs");
const getStdin = require("get-stdin");

const args = require("minimist")(process.argv.slice(2), {
  boolean: ["help", "in"],
  string: ["file"],
});

const BASE_PATH = path.resolve(process.env.BASE_PATH || __dirname);

if (process.env.HELLO) {
  console.log(process.env.HELLO);
}

if (args.help) {
  printHelp();
} else if (args.in || args._.includes("-")) {
  getStdin().then(processFile).catch(error);
} else if (args.file) {
  fs.readFile(
    path.join(BASE_PATH, args.file),
    function onContents(err, contents) {
      if (err) {
        error(err.toString());
      } else {
        processFile(contents.toString());
      }
    },
  );
} else {
  error("incorrect usage", true);
}

function processFile(contents) {
  contents = contents.toUpperCase();
  process.stdout.write(contents);
}

function error(msg, includeHelp = false) {
  console.log(msg);
  if (includeHelp) {
    console.log("");
    printHelp();
  }
}

// *******************************************
function printHelp() {
  console.log("ex1 usage:");
  console.log("");
  console.log("--help              print this help");
  console.log("--file={filename}   print file");
  console.log("--in, -             process stdin");
  console.log("");
}
