"use client";

import { useEffect, useState } from "react";

export default function EditDialog({
  open,
  title,
  details,
  onCancel,
  onSave,
}: {
  open: boolean;
  title: string;
  details: string;
  onCancel: () => void;
  onSave: (title: string, details: string) => void;
}) {
  const [t, setT] = useState(title);
  const [d, setD] = useState(details);

  useEffect(() => {
    if (open) {
      setT(title);
      setD(details);
    }
  }, [open, title, details]);

  if (!open) return null;

  return (
    <div
      className="dialog-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="dialog" role="dialog" aria-modal="true" aria-label="Edit card">
        <div className="dialog-header">Edit Card</div>
        <label className="dialog-field">
          <span>Title</span>
          <input
            autoFocus
            value={t}
            onChange={(e) => setT(e.target.value)}
            data-testid="edit-title"
          />
        </label>
        <label className="dialog-field">
          <span>Details</span>
          <textarea
            rows={5}
            value={d}
            onChange={(e) => setD(e.target.value)}
            data-testid="edit-details"
          />
        </label>
        <div className="dialog-actions">
          <button type="button" className="add-btn" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => onSave(t.trim(), d.trim())}
            disabled={!t.trim()}
            data-testid="edit-save"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
