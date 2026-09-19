import type { Board } from "./types";

export const STORAGE_KEY = "kanban-board";
export const EXPORT_FILENAME = "kanban-board.json";

/** Validate and normalize a decoded value into a well-formed board. */
export function parseBoard(value: unknown): Board | null {
  if (typeof value !== "object" || value === null) return null;
  const columns = (value as { columns?: unknown }).columns;
  if (!Array.isArray(columns)) return null;

  const result: Board = { columns: [] };
  for (const raw of columns) {
    if (typeof raw !== "object" || raw === null) return null;
    const col = raw as {
      id?: unknown;
      name?: unknown;
      cards?: unknown;
    };
    if (typeof col.id !== "string" || !Array.isArray(col.cards)) return null;
    const cards = [];
    for (const rawCard of col.cards) {
      if (typeof rawCard !== "object" || rawCard === null) return null;
      const card = rawCard as {
        id?: unknown;
        title?: unknown;
        details?: unknown;
      };
      if (typeof card.id !== "string") return null;
      cards.push({
        id: card.id,
        title: typeof card.title === "string" ? card.title : "",
        details: typeof card.details === "string" ? card.details : "",
      });
    }
    result.columns.push({
      id: col.id,
      name: typeof col.name === "string" ? col.name : "",
      cards,
    });
  }
  return result;
}

/** Serialize a board to a JSON string for export or storage. */
export function serializeBoard(board: Board): string {
  return JSON.stringify(board, null, 2);
}

/** Parse a JSON string into a board, returning null if it is invalid. */
export function parseBoardText(text: string): Board | null {
  try {
    return parseBoard(JSON.parse(text));
  } catch {
    return null;
  }
}

/** Read and validate a previously saved board from localStorage. */
export function loadSavedBoard(): Board | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  return parseBoardText(raw);
}

/** Save the board to localStorage. No-op if unavailable. */
export function saveBoard(board: Board): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, serializeBoard(board));
}
