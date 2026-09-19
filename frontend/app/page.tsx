"use client";

import { useEffect, useRef, useState } from "react";
import {
  moveCard,
  moveCardToColumn,
  renameColumn,
  addCardToColumn,
} from "../lib/board";
import {
  loadSavedBoard,
  saveBoard,
  serializeBoard,
  parseBoardText,
  EXPORT_FILENAME,
} from "../lib/persist";
import type { Board } from "../lib/types";
import BoardView from "../components/BoardView";
import EditDialog from "../components/EditDialog";
import type { DragEndEvent } from "@dnd-kit/core";

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "id-" + Math.random().toString(36).slice(2, 10);
}

const emptyBoard: Board = {
  columns: [
    { id: "col-1", name: "To Do", cards: [] },
    { id: "col-2", name: "In Progress", cards: [] },
    { id: "col-3", name: "Review", cards: [] },
    { id: "col-4", name: "Done", cards: [] },
    { id: "col-5", name: "Blocked", cards: [] },
  ],
};

export default function Home() {
  // Start empty so the server render and the first client render match. The
  // saved board is restored after mount (client only), so there is no
  // hydration mismatch.
  const [board, setBoard] = useState<Board>(emptyBoard);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [editing, setEditing] = useState<{
    columnId: string;
    cardId: string;
  } | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  // True once the board that is currently rendered matches what we last saved
  // (or the empty initial board). Until then we must not write, otherwise the
  // first paint would clobber the stored board with the pre-restore state.
  const inSyncRef = useRef(true);
  const pendingBoardRef = useRef<Board | null>(null);

  useEffect(() => {
    const saved = loadSavedBoard();
    if (saved) {
      pendingBoardRef.current = saved;
      inSyncRef.current = false;
      setBoard(saved);
    }
  }, []);

  useEffect(() => {
    if (pendingBoardRef.current === board) {
      // This render is the restored board; mark it as the new baseline.
      pendingBoardRef.current = null;
      inSyncRef.current = true;
      return;
    }
    if (!inSyncRef.current) return;
    saveBoard(board);
  }, [board]);

  function columnOf(id: string): string | null {
    if (board.columns.some((c) => c.id === id)) return id;
    return (
      board.columns.find((c) => c.cards.some((card) => card.id === id))?.id ??
      null
    );
  }

  // Where does the pointer land within a column's card list? Used to compute
  // the destination index for within-column reordering. Returns the number of
  // cards whose vertical midpoint is above the pointer.
  function dropIndexIn(columnId: string, y: number): number {
    const list = document.querySelector(
      `[data-column="${columnId}"] .column-cards`
    ) as HTMLElement | null;
    if (!list) return 0;
    return Array.from(list.querySelectorAll<HTMLElement>(".card")).reduce(
      (count, card) => {
        const r = card.getBoundingClientRect();
        return y > r.top + r.height / 2 ? count + 1 : count;
      },
      0
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveCardId(null);
    if (!over) return;
    const activeId = String(active.id);
    const from = columnOf(activeId);
    const to = columnOf(String(over.id));
    if (!from || !to) return;
    if (from === to) {
      const y = over.rect.top + over.rect.height / 2;
      setBoard(moveCard(board, activeId, from, to, dropIndexIn(to, y)));
    } else {
      setBoard(moveCardToColumn(board, activeId, to));
    }
  }

  function handleDeleteCard(cardId: string) {
    setBoard((b) => ({
      columns: b.columns.map((c) => ({
        ...c,
        cards: c.cards.filter((card) => card.id !== cardId),
      })),
    }));
  }

  function handleSaveEdit(title: string, details: string) {
    if (!editing) return;
    setBoard((b) => ({
      columns: b.columns.map((c) =>
        c.id === editing.columnId
          ? {
              ...c,
              cards: c.cards.map((card) =>
                card.id === editing.cardId ? { ...card, title, details } : card
              ),
            }
          : c
      ),
    }));
    setEditing(null);
  }

  function handleExport() {
    const blob = new Blob([serializeBoard(board)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = EXPORT_FILENAME;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseBoardText(String(reader.result));
      if (parsed) setBoard(parsed);
      else alert("That file is not a valid board.");
    };
    reader.readAsText(file);
  }

  const editingCard = editing
    ? board.columns
        .find((c) => c.id === editing.columnId)
        ?.cards.find((c) => c.id === editing.cardId)
    : undefined;

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Kanban</h1>
        <p className="app-subtitle">
          Drag cards between columns. Click a card title to edit it.
        </p>
        <div className="header-actions">
          <button
            type="button"
            className="add-btn"
            data-testid="import-btn"
            onClick={() => importInputRef.current?.click()}
          >
            Import
          </button>
          <button
            type="button"
            className="btn-primary"
            data-testid="export-btn"
            onClick={handleExport}
          >
            Export
          </button>
          <input
            ref={importInputRef}
            type="file"
            accept="application/json"
            data-testid="import-file"
            hidden
            onChange={handleImportFile}
          />
        </div>
      </header>
      <BoardView
        board={board}
        activeCardId={activeCardId}
        onDragStart={setActiveCardId}
        onDragEnd={handleDragEnd}
        onRename={(columnId, name) =>
          setBoard((b) => renameColumn(b, columnId, name))
        }
        onAddCard={(columnId, title, details) =>
          setBoard((b) =>
            addCardToColumn(b, columnId, { id: makeId(), title, details })
          )
        }
        onEditCard={(columnId, cardId) => setEditing({ columnId, cardId })}
        onDeleteCard={handleDeleteCard}
      />
      <EditDialog
        open={editingCard !== undefined}
        title={editingCard?.title ?? ""}
        details={editingCard?.details ?? ""}
        onCancel={() => setEditing(null)}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
