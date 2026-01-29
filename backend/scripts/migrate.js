const fs = require("fs");

const logs = JSON.parse(fs.readFileSync("data/logs.json", "utf8"));
const out = logs.map(l => JSON.stringify(l)).join("\n");
fs.writeFileSync("data/logs.ndjson", out);

console.log("Migration done!");
