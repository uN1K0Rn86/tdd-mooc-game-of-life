import { describe, test } from "vitest";
import { expect } from "chai";
import { gameOfLife, readRLEfile, parseInput } from "../src/gameOfLife.mjs";
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
  test("returns an appropriate object after processing block input", () => {
    const input = dedent`
      #N Block
      #C An extremely common 4-cell still life.
      #C www.conwaylife.com/wiki/index.php?title=Block
      x = 2, y = 2, rule = B3/S23
      2o$2o!`;
    const parsedInput = parseInput(input);

    expect(parsedInput).to.deep.equal({
      name: "Block",
      comments: ["An extremely common 4-cell still life.", "www.conwaylife.com/wiki/index.php?title=Block"],
      width: 2,
      height: 2,
      rule: "B3/S23",
      pattern: "2o$2o!",
    });
  });

  test("returns an appropriate object after processing glider input", () => {
    const input = dedent`
      #N Glider
      #O Richard K. Guy
      #C The smallest, most common, and first discovered spaceship. Diagonal, has period 4 and speed c/4.
      #C www.conwaylife.com/wiki/index.php?title=Glider
      x = 3, y = 3, rule = B3/S23
      bob$2bo$3o!`;
    const parsedInput = parseInput(input);

    expect(parsedInput).to.deep.equal({
      name: "Glider",
      filedata: "Richard K. Guy",
      comments: [
        "The smallest, most common, and first discovered spaceship. Diagonal, has period 4 and speed c/4.",
        "www.conwaylife.com/wiki/index.php?title=Glider",
      ],
      width: 3,
      height: 3,
      rule: "B3/S23",
      pattern: "bob$2bo$3o!",
    });
  });

  test("returns an appropriate object after processing blinker input", () => {
    const input = dedent`
      #N Blinker
      #O John Conway
      #C A period 2 oscillator that is the smallest and most common oscillator.
      #C www.conwaylife.com/wiki/index.php?title=Blinker
      x = 3, y = 1, rule = B3/S23
      3o!`;

    const parsedInput = parseInput(input);

    expect(parsedInput).to.deep.equal({
      name: "Blinker",
      filedata: "John Conway",
      comments: [
        "A period 2 oscillator that is the smallest and most common oscillator.",
        "www.conwaylife.com/wiki/index.php?title=Blinker",
      ],
      width: 3,
      height: 1,
      rule: "B3/S23",
      pattern: "3o!",
    });
  });
});
