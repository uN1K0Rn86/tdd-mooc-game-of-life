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
  if (generations === 0) return parsedPattern;
  const newPattern = new Set();
  const neighborCounts = new Map();

  for (const liveCell of parsedPattern) {
    const coordinates = liveCell.split(",");
    const x = parseInt(coordinates[0]);
    const y = parseInt(coordinates[1]);
    let liveNeighbors = 0;

    for (let i = x - 1; i < x + 2; i++) {
      for (let j = y - 1; j < y + 2; j++) {
        if (!(i === x && j === y)) {
          const neighborKey = `${i},${j}`;
          if (parsedPattern.has(neighborKey)) {
            liveNeighbors += 1;
          }
          const count = neighborCounts.get(neighborKey) || 0;
          neighborCounts.set(neighborKey, count + 1);
        }
      }
    }

    if (liveNeighbors >= 2 && liveNeighbors <= 3) {
      newPattern.add(liveCell);
    }
  }

  for (const [key, count] of neighborCounts) {
    if (count === 3) {
      newPattern.add(key);
    }
  }

  return gameOfLife(newPattern, generations - 1);
}

export function rleConverter(setPattern) {
  const patternArray = [];
  let xmin = Infinity;
  let ymin = Infinity;
  let xmax = -Infinity;
  let ymax = -Infinity;

  for (const coord of setPattern) {
    const [x, y] = coord.split(",").map(Number);

    if (x < xmin) xmin = x;
    if (y < ymin) ymin = y;
    if (x > xmax) xmax = x;
    if (y > ymax) ymax = y;

    patternArray.push([Number(x), Number(y)]);
  }

  patternArray.sort((a, b) => a[1] - b[1] || a[0] - b[0]);

  let currentX = xmin;
  let currentY = ymin;
  let rlePattern = "";
  let liveCount = 0;

  for (const coord of patternArray) {
    const [x, y] = coord;

    if (y > currentY) {
      const endGap = xmax - currentX + 1;

      if (liveCount === 1) {
        rlePattern += "o";
      }
      if (liveCount >= 2) {
        rlePattern += `${liveCount}o`;
      }
      if (endGap > 0) {
        rlePattern += endGap >= 2 ? `${endGap}b` : "b";
      }
      rlePattern += "$";
      currentY = y;
      currentX = xmin;
      liveCount = 0;
    }

    const gap = x - currentX;

    liveCount += 1;

    if (gap === 1 && liveCount === 1) {
      rlePattern += "b";
    }

    if (gap >= 2) {
      rlePattern += `${gap}b`;
    }

    currentX = x + 1;
    console.log(coord, liveCount, rlePattern);
  }

  if (liveCount === 1) {
    rlePattern += "o";
  }
  if (liveCount >= 2) {
    rlePattern += `${liveCount}o`;
  }
  return rlePattern + "!";
}

export async function main(filepath, generations) {
  const input = await readRLEfile(filepath);
  const parsedInput = parseInput(input);
  const parsedPattern = parsePattern(parsedInput.pattern);
  const setResult = gameOfLife(parsedPattern, generations);

  return setResult;
}
