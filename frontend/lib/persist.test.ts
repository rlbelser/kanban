import { describe, it, expect } from "vitest";
import {
  parseBoard,
  parseBoardText,
  serializeBoard,
  loadSavedBoard,
  saveBoard,
  STORAGE_KEY,
} from "./persist";
import type { Board } from "./types";

const sample: Board = {
  columns: [
    {
      id: "col-1",
      name: "To Do",
      cards: [{ id: "card-1", title: "Hello", details: "World" }],
    },
  ],
};

describe("serializeBoard / parseBoardText", () => {
  it("round-trips a board", () => {
    expect(parseBoardText(serializeBoard(sample))).toEqual(sample);
  });

  it("returns null for invalid JSON", () => {
    expect(parseBoardText("not json")).toBeNull();
  });
});

describe("parseBoard", () => {
  it("accepts a valid board", () => {
    expect(parseBoard(sample)).toEqual(sample);
  });

  it("rejects a non-object", () => {
    expect(parseBoard(null)).toBeNull();
    expect(parseBoard("x")).toBeNull();
    expect(parseBoard(42)).toBeNull();
  });

  it("rejects a missing or non-array columns field", () => {
    expect(parseBoard({})).toBeNull();
    expect(parseBoard({ columns: "nope" })).toBeNull();
  });

  it("rejects a column with a missing id or cards array", () => {
    expect(parseBoard({ columns: [{ name: "X" }] })).toBeNull();
    expect(parseBoard({ columns: [{ id: "c", cards: "nope" }] })).toBeNull();
  });

  it("rejects a card with a missing id", () => {
    expect(
      parseBoard({
        columns: [
          { id: "c", name: "C", cards: [{ title: "t" }] },
        ],
      })
    ).toBeNull();
  });

  it("fills missing string fields with empty strings", () => {
    const parsed = parseBoard({
      columns: [{ id: "c", cards: [{ id: "card" }] }],
    })!;
    expect(parsed.columns[0].name).toBe("");
    expect(parsed.columns[0].cards[0].title).toBe("");
    expect(parsed.columns[0].cards[0].details).toBe("");
  });
});

describe("loadSavedBoard / saveBoard", () => {
  it("round-trips through localStorage", () => {
    saveBoard(sample);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe(
      serializeBoard(sample)
    );
    expect(loadSavedBoard()).toEqual(sample);
  });

  it("returns null when nothing is saved", () => {
    window.localStorage.clear();
    expect(loadSavedBoard()).toBeNull();
  });

  it("returns null when the stored value is corrupted", () => {
    window.localStorage.setItem(STORAGE_KEY, "{ broken");
    expect(loadSavedBoard()).toBeNull();
  });
});
