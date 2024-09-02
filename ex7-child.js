"use strict";

const fetch = require("node-fetch");

// ************************************
const HTTP_PORT = 8039;

main().catch(() => 1);

// ************************************

async function main() {
  try {
    const response = await fetch("http://localhost:8039/get-records");
    if (response && response.ok) {
      const records = await response.json();
      if (records && records.length > 0) {
        process.exitCode = 0;
        return;
      }
    }
  } catch (error) {
    console.log(error);
  }
  process.exitCode = 1;
}
