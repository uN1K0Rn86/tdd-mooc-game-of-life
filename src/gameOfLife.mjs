import { readFile } from "fs/promises";

export async function readRLEfile(filepath) {
  const fileContents = await readFile(filepath, "utf8");
  return fileContents;
}

export function parseInput(fileContents) {
  const lines = fileContents.split("\n");

  const result = { comments: [] };

  for (const line of lines) {
    if (line.startsWith("#N")) {
      result.name = line.replace("#N ", "");
    } else if (line.startsWith("#C")) {
      result.comments.push(line.replace("#C ", ""));
    } else if (line.startsWith("x = ")) {
      const parts = line.split(",");
      const data = {};
      for (const part of parts) {
        const [key, value] = part.split("=");
        data[key.trim()] = value.trim();
      }
      result.width = Number(data.x);
      result.height = Number(data.y);
      result.rule = data.rule;
    } else if (line.startsWith("#O")) {
      result.filedata = line.replace("#O ", "");
    } else {
      if (!result.pattern) {
        result.pattern = line;
      } else {
        result.pattern = result.pattern + line;
      }
    }
  }

  return result;
}

export function parsePattern(pattern) {
  let x = 0;
  let y = 0;
  let count = "";
  const liveCells = new Set();

  for (const char of pattern) {
    if (char === "!") break;

    if (!isNaN(Number(char))) {
      count += char;
    } else if (char === "$") {
      y += 1;
      x = 0;
    } else if (char === "b") {
      x += parseInt(count || "1");
      count = "";
    } else if (char === "o") {
      const amount = parseInt(count || "1");
      for (let i = 0; i < amount; i++) {
        liveCells.add(`${x + i},${y}`);
      }
      x += amount;
      count = "";
    }
  }
  return liveCells;
}

export function gameOfLife(parsedPattern, generations) {
  const newPattern = new Set();

  for (const liveCell of parsedPattern) {
    const coordinates = liveCell.split(",");
    const x = parseInt(coordinates[0]);
    const y = parseInt(coordinates[1]);
    let neighbors = 0;
    for (let i = x - 1; i < x + 2; i++) {
      for (let j = y - 1; j < y + 2; j++) {
        if (!(i === x && j === y)) {
          if (parsedPattern.has(`${i},${j}`)) {
            neighbors += 1;
          }
        }
      }
    }

    if (neighbors >= 2 && neighbors <= 3) {
      newPattern.add(liveCell);
    }
  }
  return newPattern;
}

export async function main(filepath, generations) {
  const input = await readRLEfile(filepath);
  const parsedInput = parseInput(input);
  const parsedPattern = parsePattern(parsedInput.pattern);
  return 1;
}
