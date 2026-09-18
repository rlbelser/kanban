import type { Board, Card, Column } from "./types";

function findCard(board: Board, cardId: string): { card: Card } | null {
  for (const column of board.columns) {
    const card = column.cards.find((c) => c.id === cardId);
    if (card) return { card };
  }
  return null;
}

/**
 * Return a new board with a card moved to the end of a column. If the card is
 * already in that column, it is removed first so it never duplicates.
 */
export function moveCardToColumn(
  board: Board,
  cardId: string,
  toColumnId: string
): Board {
  if (board.columns.some((c) => c.id === toColumnId) === false) return board;
  const located = findCard(board, cardId);
  if (!located) return board;
  const card = located.card;

  return {
    columns: board.columns.map((column) => {
      if (column.id === toColumnId) {
        const others = column.cards.filter((c) => c.id !== cardId);
        return { ...column, cards: [...others, card] };
      }
      return { ...column, cards: column.cards.filter((c) => c.id !== cardId) };
    }),
  };
}

/** Return a new board with a card re-ordered within (or into) a column. */
export function moveCard(
  board: Board,
  cardId: string,
  fromColumnId: string,
  toColumnId: string,
  indexInTarget: number
): Board {
  const located = findCard(board, cardId);
  if (!located) return board;
  const card = located.card;

  const sourceCards = board.columns
    .find((c) => c.id === fromColumnId)
    ?.cards.filter((c) => c.id !== cardId) ?? [];

  const targetCards = board.columns
    .find((c) => c.id === toColumnId)
    ?.cards.filter((c) => c.id !== cardId) ?? [];

  const clamped = Math.max(0, Math.min(indexInTarget, targetCards.length));
  targetCards.splice(clamped, 0, card);

  return {
    columns: board.columns.map((column) => {
      if (column.id === toColumnId) return { ...column, cards: targetCards };
      if (column.id === fromColumnId) return { ...column, cards: sourceCards };
      return column;
    }),
  };
}

/** Return a new board with a card added to a column. */
export function addCardToColumn(
  board: Board,
  columnId: string,
  card: Card
): Board {
  return {
    columns: board.columns.map((column) =>
      column.id === columnId
        ? { ...column, cards: [...column.cards, card] }
        : column
    ),
  };
}

/** Return a new board with a card removed. */
export function removeCard(board: Board, cardId: string): Board {
  return {
    columns: board.columns.map((column) => ({
      ...column,
      cards: column.cards.filter((c) => c.id !== cardId),
    })),
  };
}

/** Return a new board with a column renamed. */
export function renameColumn(
  board: Board,
  columnId: string,
  name: string
): Board {
  const trimmed = name.trim();
  if (!trimmed) return board;
  return {
    columns: board.columns.map((column) =>
      column.id === columnId ? { ...column, name: trimmed } : column
    ),
  };
}
