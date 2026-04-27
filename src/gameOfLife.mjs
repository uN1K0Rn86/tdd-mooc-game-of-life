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
      if (line.startsWith("#C ")) {
        result.comments.push(line.replace("#C ", ""));
      } else {
        result.comments.push(line.replace("#C", ""));
      }
    } else if (line.startsWith("#c")) {
      if (line.startsWith("#c ")) {
        result.comments.push(line.replace("#c ", ""));
      } else {
        result.comments.push(line.replace("#c", ""));
      }
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
    } else if (line.startsWith("#P")) {
      const coords = line.replace("#P ", "");
      const [x, y] = coords.split(" ");
      result.pos = [Number(x), Number(y)];
    } else if (line.startsWith("#R")) {
      const coords = line.replace("#R ", "");
      const [x, y] = coords.split(" ");
      result.pos = [Number(x), Number(y)];
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

    patternArray.push([x, y]);
  }

  patternArray.sort((a, b) => a[1] - b[1] || a[0] - b[0]);

  let currentX = xmin;
  let currentY = ymin;
  let rlePattern = "";
  let liveCount = 0;
  let firstOnRow = true;

  for (const coord of patternArray) {
    const [x, y] = coord;

    if (y > currentY) {
      const lineGap = y - currentY;
      const endGap = xmax - currentX + 1;

      rlePattern += liveCount === 1 ? "o" : `${liveCount}o`;

      if (endGap === 1) {
        rlePattern += "b";
      }

      rlePattern += lineGap > 1 ? `${lineGap}$` : "$";
      currentY = y;
      currentX = xmin;
      liveCount = 0;
      firstOnRow = true;
    }

    const gap = x - currentX;

    if (gap === 1) {
      if (liveCount === 1 && !firstOnRow) {
        rlePattern += "o";
      }
      if (liveCount >= 2) {
        rlePattern += `${liveCount}o`;
      }
      rlePattern += "b";
    }

    if (gap >= 2) {
      if (liveCount === 1 && !firstOnRow) {
        rlePattern += "o";
      }
      if (liveCount >= 2) {
        rlePattern += `${liveCount}o`;
      }
      rlePattern += `${gap}b`;
    }

    if (gap > 0) liveCount = 0;
    liveCount += 1;

    currentX = x + 1;
    firstOnRow = false;
  }

  rlePattern += liveCount === 1 ? "o" : `${liveCount}o`;

  return rlePattern + "!";
}

export function findPosition(setResult) {
  const allX = [];
  const allY = [];

  for (const coord of setResult) {
    const [x, y] = coord.split(",");
    allX.push(x);
    allY.push(y);
  }

  const minX = Math.min(...allX);
  const minY = Math.min(...allY);

  return [minX, minY];
}

export function objectToString(golObject) {
  let result = "";

  if (!!golObject.name) {
    result += `#N ${golObject.name}\n`;
  }
  if (!!golObject.filedata) {
    result += `#O ${golObject.filedata}\n`;
  }
  if (!!golObject.comments && golObject.comments.length > 0) {
    for (const comment of golObject.comments) {
      result += `#C ${comment}\n`;
    }
  }
  if (!!golObject.pos) {
    result += `#P ${golObject.pos[0]} ${golObject.pos[1]}\n`;
  }

  result += `x = ${golObject.width}, y = ${golObject.height}, rule = ${golObject.rule}\n`;
  result += golObject.pattern;

  return result;
}

export async function main(filepath, generations) {
  const input = await readRLEfile(filepath);
  const parsedInput = parseInput(input);
  const parsedPattern = parsePattern(parsedInput.pattern);
  const setResult = gameOfLife(parsedPattern, generations);
  const generatedPattern = rleConverter(setResult);
  const position = findPosition(setResult);
  const golObject = { ...parsedInput, pattern: generatedPattern, pos: position };
  const result = objectToString(golObject);

  return result;
}
