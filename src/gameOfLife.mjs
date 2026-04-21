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

export async function gameOfLife(filepath, generations) {
  const input = await readRLEfile(filepath);
  return 1;
}
