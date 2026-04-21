import { readFile } from "fs/promises";

export async function readRLEfile(filepath) {
  const fileContents = await readFile(filepath, "utf8");
  return fileContents;
}

export async function gameOfLife(filepath, generations) {
  const input = await readRLEfile(filepath);
  return 1;
}
