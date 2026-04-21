import { describe, test } from "vitest";
import { expect } from "chai";
import { gameOfLife, readRLEfile } from "../src/gameOfLife.mjs";
import path from "path";
import { fileURLToPath } from "url";
import dedent from "dedent";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("Walking skeleton", () => {
  test("does not fail with RLE file input and generations", async () => {
    const testFilePath = path.resolve(__dirname, "../testdata/block.rle");
    const gOL = await gameOfLife(testFilePath, 1);
    expect(gOL).to.be.ok;
  });
});

describe("RLE file reader", () => {
  test("returns the contents of the RLE as a string", async () => {
    const testFilePath = path.resolve(__dirname, "../testdata/block.rle");
    const fileContents = await readRLEfile(testFilePath);

    expect(fileContents).to.equal(dedent`
      #N Block
      #C An extremely common 4-cell still life.
      #C www.conwaylife.com/wiki/index.php?title=Block
      x = 2, y = 2, rule = B3/S23
      2o$2o!
    `);
  });
});

describe("RLE file parser", () => {
  test("returns an appropriate object after processing input", () => {});
});
