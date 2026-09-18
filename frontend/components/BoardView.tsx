"use client";

import { useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import Column from "./Column";
import type { Board, Card } from "../lib/types";

export default function BoardView({
  board,
  activeCardId,
  onDragStart,
  onDragEnd,
  onRename,
  onAddCard,
  onEditCard,
  onDeleteCard,
}: {
  board: Board;
  activeCardId: string | null;
  onDragStart: (cardId: string) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onRename: (columnId: string, name: string) => void;
  onAddCard: (columnId: string, title: string, details: string) => void;
  onEditCard: (columnId: string, cardId: string) => void;
  onDeleteCard: (cardId: string) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const activeCard: Card | null = useMemo(() => {
    if (!activeCardId) return null;
    for (const column of board.columns) {
      const card = column.cards.find((c) => c.id === activeCardId);
      if (card) return card;
    }
    return null;
  }, [board, activeCardId]);

  function handleDragStart(event: DragStartEvent) {
    onDragStart(String(event.active.id));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="board">
        {board.columns.map((column) => (
          <div key={column.id} className="column-wrap">
            <SortableContext
              items={column.cards.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <Column
                column={column}
                onRename={onRename}
                onAddCard={onAddCard}
                onEditCard={onEditCard}
                onDeleteCard={onDeleteCard}
              />
            </SortableContext>
          </div>
        ))}
      </div>
      <DragOverlay>
        {activeCard ? (
          <div className="card dnd-dragging">
            <div className="card-title">{activeCard.title}</div>
            {activeCard.details ? (
              <div className="card-details">{activeCard.details}</div>
            ) : null}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
