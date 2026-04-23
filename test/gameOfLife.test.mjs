import { describe, test } from "vitest";
import { expect } from "chai";
import { main, gameOfLife, readRLEfile, parseInput, parsePattern } from "../src/gameOfLife.mjs";
import path from "path";
import { fileURLToPath } from "url";
import dedent from "dedent";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("Walking skeleton", () => {
  test("does not fail with RLE file input and generations", async () => {
    const testFilePath = path.resolve(__dirname, "../testdata/block.rle");
    const gOL = await main(testFilePath, 1);
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

  test("returns correct set for gosper glider gun pattern", () => {
    const pattern =
      "24bo$22bobo$12b2o6b2o12b2o$11bo3bo4b2o12b2o$2o8bo5bo3b2o$2o8bo3bob2o4bobo$10bo5bo7bo$11bo3bo$12b2o!";

    const parsedPattern = parsePattern(pattern);

    expect(parsedPattern).to.deep.equal(
      new Set([
        "24,0",
        "22,1",
        "24,1",
        "12,2",
        "13,2",
        "20,2",
        "21,2",
        "34,2",
        "35,2",
        "11,3",
        "15,3",
        "20,3",
        "21,3",
        "34,3",
        "35,3",
        "0,4",
        "1,4",
        "10,4",
        "16,4",
        "20,4",
        "21,4",
        "0,5",
        "1,5",
        "10,5",
        "14,5",
        "16,5",
        "17,5",
        "22,5",
        "24,5",
        "10,6",
        "16,6",
        "24,6",
        "11,7",
        "15,7",
        "12,8",
        "13,8",
      ]),
    );
  });
});

describe("Game of Life", () => {
  test("is applied to block pattern for one generation with correct result", () => {
    const blockPattern = new Set(["0,0", "1,0", "0,1", "1,1"]);

    expect(gameOfLife(blockPattern, 1)).to.deep.equal(new Set(["0,0", "1,0", "0,1", "1,1"]));
  });

  test("is applied to glider pattern for one generation with correct result", () => {
    const gliderPattern = new Set(["1,0", "2,1", "0,2", "1,2", "2,2"]);

    expect(gameOfLife(gliderPattern, 1)).to.deep.equal(new Set(["0,1", "2,1", "1,2", "2,2", "1,3"]));
  });
});
