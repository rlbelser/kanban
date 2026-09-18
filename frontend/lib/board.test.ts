import { describe, it, expect } from "vitest";
import {
  addCardToColumn,
  moveCard,
  moveCardToColumn,
  removeCard,
  renameColumn,
} from "../lib/board";
import { initialBoard } from "../lib/dummyData";
import type { Board } from "../lib/types";

function clone(): Board {
  return structuredClone(initialBoard);
}

describe("moveCardToColumn", () => {
  it("moves a card to the end of another column", () => {
    const board = clone();
    const card = board.columns[0].cards[0]; // card-1 in "To Do"
    const next = moveCardToColumn(board, card.id, "col-2");
    expect(next.columns.find((c) => c.id === "col-1")?.cards).not.toContain(
      expect.objectContaining({ id: card.id })
    );
    const col2 = next.columns.find((c) => c.id === "col-2")!;
    expect(col2.cards.at(-1)?.id).toBe(card.id);
    expect(col2.cards).toHaveLength(3);
  });

  it("does not duplicate a card already in the target column", () => {
    const board = clone();
    const card = board.columns[1].cards[0]; // already in col-2
    const next = moveCardToColumn(board, card.id, "col-2");
    const col2 = next.columns.find((c) => c.id === "col-2")!;
    expect(col2.cards.filter((c) => c.id === card.id)).toHaveLength(1);
  });

  it("returns the same board for an unknown column", () => {
    const board = clone();
    expect(moveCardToColumn(board, "nope", "nope-col")).toBe(board);
  });
});

describe("moveCard", () => {
  it("reorders a card within its column", () => {
    const board = clone();
    // col-1 has cards [card-1, card-2, card-3]
    const next = moveCard(board, "card-1", "col-1", "col-1", 2);
    const col1 = next.columns.find((c) => c.id === "col-1")!;
    expect(col1.cards.map((c) => c.id)).toEqual(["card-2", "card-3", "card-1"]);
  });

  it("moves a card into another column at the given index", () => {
    const board = clone();
    const next = moveCard(board, "card-1", "col-1", "col-3", 0); // top of Review
    const col3 = next.columns.find((c) => c.id === "col-3")!;
    expect(col3.cards.at(0)?.id).toBe("card-1");
  });

  it("clamps an out-of-range index to the end", () => {
    const board = clone();
    const next = moveCard(board, "card-1", "col-1", "col-3", 999);
    const col3 = next.columns.find((c) => c.id === "col-3")!;
    expect(col3.cards.at(-1)?.id).toBe("card-1");
  });
});

describe("addCardToColumn", () => {
  it("appends a new card to the target column", () => {
    const board = clone();
    const before = board.columns.find((c) => c.id === "col-1")!.cards.length;
    const next = addCardToColumn(board, "col-1", {
      id: "new-1",
      title: "New",
      details: "",
    });
    const col1 = next.columns.find((c) => c.id === "col-1")!;
    expect(col1.cards).toHaveLength(before + 1);
    expect(col1.cards.at(-1)?.id).toBe("new-1");
  });

  it("leaves other columns untouched", () => {
    const board = clone();
    const next = addCardToColumn(board, "col-4", {
      id: "new-1",
      title: "New",
      details: "",
    });
    const col1 = next.columns.find((c) => c.id === "col-1")!;
    expect(col1.cards).toHaveLength(3);
  });
});

describe("removeCard", () => {
  it("removes a card from whichever column contains it", () => {
    const board = clone();
    const next = removeCard(board, "card-1");
    const col1 = next.columns.find((c) => c.id === "col-1")!;
    expect(col1.cards).toHaveLength(2);
    expect(col1.cards.some((c) => c.id === "card-1")).toBe(false);
  });

  it("removes only that card", () => {
    const board = clone();
    const next = removeCard(board, "card-1");
    expect(next.columns.flatMap((c) => c.cards)).toHaveLength(
      board.columns.flatMap((c) => c.cards).length - 1
    );
  });
});

describe("renameColumn", () => {
  it("renames the target column only", () => {
    const board = clone();
    const next = renameColumn(board, "col-1", "Backlog");
    expect(next.columns.find((c) => c.id === "col-1")?.name).toBe("Backlog");
    expect(next.columns.find((c) => c.id === "col-2")?.name).toBe(
      "In Progress"
    );
  });

  it("ignores an empty name", () => {
    const board = clone();
    const next = renameColumn(board, "col-1", "   ");
    expect(next.columns.find((c) => c.id === "col-1")?.name).toBe("To Do");
  });
});
