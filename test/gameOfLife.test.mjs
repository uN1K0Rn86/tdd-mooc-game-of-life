import { describe, test } from "vitest";
import { expect } from "chai";
import {
  main,
  gameOfLife,
  findPosition,
  readRLEfile,
  parseInput,
  parsePattern,
  rleConverter,
  objectToString,
} from "../src/gameOfLife.mjs";
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

  test("returns an appropriate object after processing input from a file saved by Golly", () => {
    const input = dedent`
      #CXRLE Pos=0,0 Gen=205
      x = 69, y = 56, rule = B3/S23
      25b2o$25b2o$11bo10b2o6bo3b2o$11bobo7b3o5bo3bobo$2o12b2o6b2o6b5o$2o12b
      2o9b2o4b3o$14b2o9b2o$11bobo$11bo11bo$21bobo$22b2o5$30bo$31bo$29b3o6$
      38bo$36bobo$37b2o5$45bo$46bo$44b3o6$53bo$51bobo$52b2o5$60bo$61bo$59b3o
      6$68bo$66bobo$67b2o!
      `;

    const parsedInput = parseInput(input);

    expect(parsedInput).to.deep.equal({
      comments: ["XRLE Pos=0,0 Gen=205"],
      width: 69,
      height: 56,
      rule: "B3/S23",
      pattern:
        "25b2o$25b2o$11bo10b2o6bo3b2o$11bobo7b3o5bo3bobo$2o12b2o6b2o6b5o$2o12b2o9b2o4b3o$14b2o9b2o$11bobo$11bo11bo$21bobo$22b2o5$30bo$31bo$29b3o6$38bo$36bobo$37b2o5$45bo$46bo$44b3o6$53bo$51bobo$52b2o5$60bo$61bo$59b3o6$68bo$66bobo$67b2o!",
    });
  });

  test("returns an appropriate object even if comments are marked with lower case c", () => {
    const input = dedent`
      #N Glider
      #O Richard K. Guy
      #c The smallest, most common, and first discovered spaceship. Diagonal, has period 4 and speed c/4.
      #c www.conwaylife.com/wiki/index.php?title=Glider
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

  test("returns an appropriate object if position info is included", () => {
    const input = dedent`
      #N Glider
      #O Richard K. Guy
      #C The smallest, most common, and first discovered spaceship. Diagonal, has period 4 and speed c/4.
      #C www.conwaylife.com/wiki/index.php?title=Glider
      #P 0 0
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
      pos: [0, 0],
      width: 3,
      height: 3,
      rule: "B3/S23",
      pattern: "bob$2bo$3o!",
    });
  });

  test("returns an appropriate object if position info is marked with #R", () => {
    const input = dedent`
      #N Glider
      #O Richard K. Guy
      #C The smallest, most common, and first discovered spaceship. Diagonal, has period 4 and speed c/4.
      #C www.conwaylife.com/wiki/index.php?title=Glider
      #R 0 0
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
      pos: [0, 0],
      width: 3,
      height: 3,
      rule: "B3/S23",
      pattern: "bob$2bo$3o!",
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
  describe("single generation", () => {
    test("is applied to block pattern with correct result", () => {
      const blockPattern = new Set(["0,0", "1,0", "0,1", "1,1"]);

      expect(gameOfLife(blockPattern, 1)).to.deep.equal(new Set(["0,0", "1,0", "0,1", "1,1"]));
    });

    test("is applied to glider pattern with correct result", () => {
      const gliderPattern = new Set(["1,0", "2,1", "0,2", "1,2", "2,2"]);

      expect(gameOfLife(gliderPattern, 1)).to.deep.equal(new Set(["0,1", "2,1", "1,2", "2,2", "1,3"]));
    });

    test("is applied to blinker pattern with correct results", () => {
      const blinkerPattern = new Set(["0,0", "1,0", "2,0"]);

      expect(gameOfLife(blinkerPattern, 1)).to.deep.equal(new Set(["1,-1", "1,0", "1,1"]));
    });
  });

  describe("two generations", () => {
    test("is applied to glider pattern with correct result", () => {
      const gliderPattern = new Set(["1,0", "2,1", "0,2", "1,2", "2,2"]);

      expect(gameOfLife(gliderPattern, 2)).to.deep.equal(new Set(["2,1", "0,2", "2,2", "1,3", "2,3"]));
    });

    test("is applied to blinker pattern with correct results", () => {
      const blinkerPattern = new Set(["0,0", "1,0", "2,0"]);

      expect(gameOfLife(blinkerPattern, 2)).to.deep.equal(new Set(["0,0", "1,0", "2,0"]));
    });
  });

  describe("multiple generations", () => {
    test("5 generations of gosper glider gun returns correct result", () => {
      const gliderGunPattern = parsePattern(
        "24bo$22bobo$12b2o6b2o12b2o$11bo3bo4b2o12b2o$2o8bo5bo3b2o$2o8bo3bob2o4bobo$10bo5bo7bo$11bo3bo$12b2o!",
      );

      expect(gameOfLife(gliderGunPattern, 5)).to.deep.equal(
        new Set([
          "22,0",
          "23,0",
          "24,1",
          "11,2",
          "12,2",
          "25,2",
          "34,2",
          "35,2",
          "11,3",
          "12,3",
          "17,3",
          "25,3",
          "34,3",
          "35,3",
          "0,4",
          "1,4",
          "8,4",
          "9,4",
          "15,4",
          "16,4",
          "25,4",
          "0,5",
          "1,5",
          "7,5",
          "8,5",
          "9,5",
          "15,5",
          "18,5",
          "19,5",
          "24,5",
          "8,6",
          "9,6",
          "16,6",
          "17,6",
          "18,6",
          "19,6",
          "20,6",
          "22,6",
          "23,6",
          "11,7",
          "12,7",
          "17,7",
          "11,8",
          "12,8",
        ]),
      );
    });

    test("50 generations of glider patterns returns correct result", () => {
      const gliderPattern = new Set(["1,0", "2,1", "0,2", "1,2", "2,2"]);

      expect(gameOfLife(gliderPattern, 50)).to.deep.equal(new Set(["14,13", "12,14", "14,14", "13,15", "14,15"]));
    });

    test("1000 generations of glider patterns returns correct result", () => {
      const gliderPattern = new Set(["1,0", "2,1", "0,2", "1,2", "2,2"]);

      expect(gameOfLife(gliderPattern, 1000)).to.deep.equal(
        new Set(["251,250", "252,251", "250,252", "251,252", "252,252"]),
      );
    });
  });
});

describe("RLE converter", () => {
  test("converts block pattern back to RLE format", () => {
    const blockPattern = new Set(["0,0", "1,0", "0,1", "1,1"]);

    expect(rleConverter(blockPattern)).to.equal("2o$2o!");
  });

  test("converts glider pattern back to RLE format", () => {
    const gliderPattern = new Set(["1,0", "2,1", "0,2", "1,2", "2,2"]);

    expect(rleConverter(gliderPattern)).to.equal("bob$2bo$3o!");
  });

  test("converts blinker pattern back to RLE format", () => {
    const blinkerPattern = new Set(["0,0", "1,0", "2,0"]);

    expect(rleConverter(blinkerPattern)).to.equal("3o!");
  });

  test("converts glider gun back to rle format", () => {
    const gliderGunPattern = new Set([
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
    ]);

    expect(rleConverter(gliderGunPattern)).to.equal(
      "24bo$22bobo$12b2o6b2o12b2o$11bo3bo4b2o12b2o$2o8bo5bo3b2o$2o8bo3bob2o4bobo$10bo5bo7bo$11bo3bo$12b2o!",
    );
  });
});

describe("Find position", () => {
  test("finds top left corner of block pattern", () => {
    const input = new Set(["0,0", "1,0", "0,1", "1,1"]);

    expect(findPosition(input)).to.deep.equal([0, 0]);
  });

  test("finds top left corner of glider pattern after 5 generations", () => {
    const input = new Set(["1,2", "3,2", "2,3", "3,3", "2,4"]);

    expect(findPosition(input)).to.deep.equal([1, 2]);
  });
});

describe("Object to string function", () => {
  test("creates a string that matches valid RLE format", () => {
    const objectToConvert = {
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
    };

    expect(objectToString(objectToConvert)).to.equal(
      "#N Blinker\n#O John Conway\n#C A period 2 oscillator that is the smallest and most common oscillator.\n#C www.conwaylife.com/wiki/index.php?title=Blinker\nx = 3, y = 1, rule = B3/S23\n3o!",
    );
  });
});

describe("Integration tests", () => {
  test("Pattern parser, Game of Life, and RLE converter return correct rle pattern after 5 generations of Gosper Glider Gun", () => {
    const parsedGunPattern = parsePattern(
      "24bo$22bobo$12b2o6b2o12b2o$11bo3bo4b2o12b2o$2o8bo5bo3b2o$2o8bo3bob2o4bobo$10bo5bo7bo$11bo3bo$12b2o!",
    );

    const generatedPattern = gameOfLife(parsedGunPattern, 5);

    expect(rleConverter(generatedPattern)).to.equal(
      "22b2o$24bo$11b2o12bo8b2o$11b2o4bo7bo8b2o$2o6b2o5b2o8bo$2o5b3o5bo2b2o4bo$8b2o6b5ob2o$11b2o4bo$11b2o!",
    );
  });

  test("Pattern parser, Game of Life, and RLE converter return correct rle pattern after 205 generations of Gosper Glider Gun", () => {
    const parsedGunPattern = parsePattern(
      "24bo$22bobo$12b2o6b2o12b2o$11bo3bo4b2o12b2o$2o8bo5bo3b2o$2o8bo3bob2o4bobo$10bo5bo7bo$11bo3bo$12b2o!",
    );

    const generatedPattern = gameOfLife(parsedGunPattern, 205);

    expect(rleConverter(generatedPattern)).to.equal(
      "25b2o$25b2o$11bo10b2o6bo3b2o$11bobo7b3o5bo3bobo$2o12b2o6b2o6b5o$2o12b2o9b2o4b3o$14b2o9b2o$11bobo$11bo11bo$21bobo$22b2o5$30bo$31bo$29b3o6$38bo$36bobo$37b2o5$45bo$46bo$44b3o6$53bo$51bobo$52b2o5$60bo$61bo$59b3o6$68bo$66bobo$67b2o!",
    );
  });

  test("Main function should return a string matching a valid RLE format with updated pattern", async () => {
    const testFilePath = path.resolve(__dirname, "../testdata/glider.rle");
    const gOL = await main(testFilePath, 5);

    const validRleString = dedent`#N Glider
      #O Richard K. Guy
      #C The smallest, most common, and first discovered spaceship. Diagonal, has period 4 and speed c/4.
      #C www.conwaylife.com/wiki/index.php?title=Glider
      #P 1 2
      x = 3, y = 3, rule = B3/S23
      obo$b2o$bo!`;

    expect(gOL).to.equal(validRleString);
  });
});
