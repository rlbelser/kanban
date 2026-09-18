"use client";

import { useState } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import CardItem from "./CardItem";
import type { Column } from "../lib/types";

export default function Column({
  column,
  onRename,
  onAddCard,
  onEditCard,
  onDeleteCard,
}: {
  column: Column;
  onRename: (columnId: string, name: string) => void;
  onAddCard: (columnId: string, title: string, details: string) => void;
  onEditCard: (columnId: string, cardId: string) => void;
  onDeleteCard: (cardId: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const { setNodeRef } = useDroppable({ id: column.id });

  function handleAdd() {
    if (!title.trim()) return;
    onAddCard(column.id, title.trim(), details.trim());
    setTitle("");
    setDetails("");
    setAdding(false);
  }

  return (
    <div
      className="column"
      data-testid="column"
      data-column={column.id}
    >
      <div className="column-header">
        <input
          className="column-name"
          value={column.name}
          onChange={(e) => onRename(column.id, e.target.value)}
          aria-label={`Rename column ${column.name}`}
          data-testid="column-name"
        />
        <span className="column-count" data-testid="column-count">
          {column.cards.length}
        </span>
      </div>
      <div className="column-cards" ref={setNodeRef} data-testid="card-list">
        {column.cards.length === 0 ? (
          <div className="empty-hint">No cards</div>
        ) : (
          column.cards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              onEdit={(id) => onEditCard(column.id, id)}
              onDelete={onDeleteCard}
            />
          ))
        )}
      </div>
      <div className="add-card">
        {adding ? (
          <div className="add-form">
            <input
              autoFocus
              placeholder="Card title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
                if (e.key === "Escape") setAdding(false);
              }}
              data-testid="add-title"
            />
            <textarea
              placeholder="Details (optional)"
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              data-testid="add-details"
            />
            <div className="add-form-actions">
              <button
                type="button"
                className="add-btn"
                onClick={() => setAdding(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleAdd}
                disabled={!title.trim()}
                data-testid="add-submit"
              >
                Add Card
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="add-btn"
            onClick={() => setAdding(true)}
            data-testid="add-card-btn"
          >
            + Add Card
          </button>
        )}
      </div>
    </div>
  );
}
