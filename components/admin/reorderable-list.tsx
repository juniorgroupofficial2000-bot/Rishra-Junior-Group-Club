"use client";

import { cn } from "@/lib/cn";
import { GripVertical } from "lucide-react";
import { useId, useState } from "react";

export type ReorderItem = {
  id: string;
  label: string;
  meta?: string;
};

/**
 * Accessible reorder control: HTML5 drag-and-drop plus move up/down buttons.
 * Persists via a hidden input of comma-separated ids submitted with the form.
 */
export function ReorderableList({
  items: initialItems,
  name = "orderedIds",
  className,
}: {
  items: ReorderItem[];
  name?: string;
  className?: string;
}) {
  const [items, setItems] = useState(initialItems);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const labelId = useId();

  function move(id: string, delta: number) {
    setItems((current) => {
      const index = current.findIndex((item) => item.id === id);
      if (index < 0) return current;
      const nextIndex = index + delta;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const copy = [...current];
      const [row] = copy.splice(index, 1);
      copy.splice(nextIndex, 0, row);
      return copy;
    });
  }

  return (
    <div className={cn("space-y-3", className)}>
      <p id={labelId} className="text-sm text-ink-500">
        Drag to reorder, or use Move up / Move down. Save to persist.
      </p>
      <input
        type="hidden"
        name={name}
        value={items.map((item) => item.id).join(",")}
      />
      <ul aria-labelledby={labelId} className="space-y-2">
        {items.map((item, index) => (
          <li
            key={item.id}
            draggable
            onDragStart={() => setDraggingId(item.id)}
            onDragEnd={() => setDraggingId(null)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (!draggingId || draggingId === item.id) return;
              setItems((current) => {
                const from = current.findIndex((row) => row.id === draggingId);
                const to = current.findIndex((row) => row.id === item.id);
                if (from < 0 || to < 0) return current;
                const copy = [...current];
                const [row] = copy.splice(from, 1);
                copy.splice(to, 0, row);
                return copy;
              });
              setDraggingId(null);
            }}
            className={cn(
              "flex items-center gap-3 rounded-md border border-border-default bg-surface-raised px-3 py-2",
              draggingId === item.id && "opacity-60",
            )}
          >
            <GripVertical
              className="h-4 w-4 shrink-0 text-ink-400"
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink-900">
                {item.label}
              </p>
              {item.meta ? (
                <p className="truncate text-xs text-ink-500">{item.meta}</p>
              ) : null}
            </div>
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                className="min-h-10 rounded-md border border-border-default px-2 text-xs font-medium hover:bg-ink-50 disabled:opacity-40"
                onClick={() => move(item.id, -1)}
                disabled={index === 0}
              >
                Move up
              </button>
              <button
                type="button"
                className="min-h-10 rounded-md border border-border-default px-2 text-xs font-medium hover:bg-ink-50 disabled:opacity-40"
                onClick={() => move(item.id, 1)}
                disabled={index === items.length - 1}
              >
                Move down
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
