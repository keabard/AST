import { move, TILES, DIRECTIONS } from "./blocks";
import { field3x3 } from "./blocks.fixtures";

describe("Move function", () => {
  it("should move UP (valid case)", () => {
    expect(
      move(DIRECTIONS.UP)({ currentColumn: 0, currentLine: 1, field: field3x3 })
    ).toMatchObject({ currentColumn: 0, currentLine: 0 });
  });
  it("should not move UP (invalid case)", () => {
    expect(
      move(DIRECTIONS.UP)({ currentColumn: 2, currentLine: 0, field: field3x3 })
    ).toMatchObject({ currentColumn: 2, currentLine: 0 });
  });
  it("should move RIGHT (valid case)", () => {
    expect(
      move(DIRECTIONS.RIGHT)({
        currentColumn: 0,
        currentLine: 0,
        field: field3x3
      })
    ).toMatchObject({ currentColumn: 1, currentLine: 0 });
  });
  it("should not move RIGHT (invalid case)", () => {
    expect(
      move(DIRECTIONS.RIGHT)({
        currentColumn: 2,
        currentLine: 1,
        field: field3x3
      })
    ).toMatchObject({ currentColumn: 2, currentLine: 1 });
  });
  it("should move DOWN (valid case)", () => {
    expect(
      move(DIRECTIONS.DOWN)({
        currentColumn: 0,
        currentLine: 0,
        field: field3x3
      })
    ).toMatchObject({ currentColumn: 0, currentLine: 1 });
  });
  it("should not move DOWN (invalid case)", () => {
    expect(
      move(DIRECTIONS.DOWN)({
        currentColumn: 1,
        currentLine: 2,
        field: field3x3
      })
    ).toMatchObject({ currentColumn: 1, currentLine: 2 });
  });
  it("should move LEFT (valid case)", () => {
    expect(
      move(DIRECTIONS.LEFT)({
        currentColumn: 1,
        currentLine: 0,
        field: field3x3
      })
    ).toMatchObject({ currentColumn: 0, currentLine: 0 });
  });
  it("should not move LEFT (invalid case)", () => {
    expect(
      move(DIRECTIONS.LEFT)({
        currentColumn: 0,
        currentLine: 2,
        field: field3x3
      })
    ).toMatchObject({ currentColumn: 0, currentLine: 2 });
  });
});
