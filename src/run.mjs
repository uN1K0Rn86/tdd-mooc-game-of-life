import { main } from "./gameOfLife.mjs";

const args = process.argv.slice(2);
const [filePath, generations] = args;

if (!filePath || !generations) {
  console.log("Error: missing arguments. Use: node run.mjs <file> <gens>");
  process.exit(1);
}

console.log(await main(filePath, parseInt(generations)));
