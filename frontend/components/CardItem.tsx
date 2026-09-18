"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Card } from "../lib/types";

export default function CardItem({
  card,
  onEdit,
  onDelete,
}: {
  card: Card;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 1 : undefined,
    position: isDragging ? ("relative" as const) : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-card-id={card.id}
      className={isDragging ? "card dnd-dragging" : "card"}
      {...attributes}
      {...listeners}
    >
      <div
        className="card-title"
        onClick={() => onEdit(card.id)}
        title="Click to edit"
      >
        {card.title}
      </div>
      {card.details ? (
        <div className="card-details">{card.details}</div>
      ) : null}
      <div className="card-footer">
        <button
          type="button"
          className="card-delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(card.id);
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
