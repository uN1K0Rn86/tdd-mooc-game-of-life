import { describe, test } from "vitest";
import { expect } from "chai";
import { gameOfLife, readRLEfile, parseInput, parsePattern } from "../src/gameOfLife.mjs";
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

  test("returns an appropriate object after processing glider gun input", () => {
    const input = dedent`
      #N Gosper glider gun
      #C This was the first gun discovered.
      #C As its name suggests, it was discovered by Bill Gosper.
      x = 36, y = 9, rule = B3/S23
      24bo$22bobo$12b2o6b2o12b2o$11bo3bo4b2o12b2o$2o8bo5bo3b2o$2o8bo3bob2o4b
      obo$10bo5bo7bo$11bo3bo$12b2o!`;

    const parsedInput = parseInput(input);

    expect(parsedInput).to.deep.equal({
      name: "Gosper glider gun",
      comments: ["This was the first gun discovered.", "As its name suggests, it was discovered by Bill Gosper."],
      width: 36,
      height: 9,
      rule: "B3/S23",
      pattern: "24bo$22bobo$12b2o6b2o12b2o$11bo3bo4b2o12b2o$2o8bo5bo3b2o$2o8bo3bob2o4bobo$10bo5bo7bo$11bo3bo$12b2o!",
    });
  });
});

describe("Pattern parser", () => {
  test("returns a set of live cells formatted as comma-separated strings x,y", () => {
    const pattern = "2o$2o!";

    const parsedPattern = parsePattern(pattern);

    expect(parsedPattern).to.deep.equal(new Set(["0,0", "1,0", "0,1", "1,1"]));
  });

  test("returns correct set for glider pattern", () => {
    const pattern = "bob$2bo$3o!";

    const parsedPattern = parsePattern(pattern);

    expect(parsedPattern).to.deep.equal(new Set(["1,0", "2,1", "0,2", "1,2", "2,2"]));
  });
});
