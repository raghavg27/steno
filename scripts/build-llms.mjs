// Builds llms.txt from facts.json, then checks that every page shows the same price.
// Run: npm run facts
import fs from "node:fs";

const facts = JSON.parse(fs.readFileSync("facts.json", "utf8"));
const template = fs.readFileSync("llms.template.txt", "utf8");
const out = template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
  if (!(key in facts)) throw new Error(`Missing fact: ${key}`);
  return String(facts[key]);
});
fs.writeFileSync("llms.txt", out);

const wrong = [];
for (const file of fs.readdirSync(".").filter((f) => f.endsWith(".html"))) {
  for (const [price] of fs.readFileSync(file, "utf8").matchAll(/₹\s?\d(?:[\d,]*\d)?/g)) {
    if (price.replace(/\s/g, "") !== facts.price) wrong.push(`${file}: ${price}`);
  }
  // Steno's dollar price always follows a slash, as in "₹4,999 / $56"
  for (const [price] of fs.readFileSync(file, "utf8").matchAll(/\/\s?\$\d+(?:\.\d+)?/g)) {
    if (price.replace(/[\s/]/g, "") !== facts.priceUsd) wrong.push(`${file}: ${price}`);
  }
}
if (wrong.length) {
  console.error(`These prices do not match facts.json (${facts.price} / ${facts.priceUsd}):\n` + wrong.join("\n"));
  process.exit(1);
}
console.log(`llms.txt is up to date and all pages show ${facts.price} / ${facts.priceUsd}`);
