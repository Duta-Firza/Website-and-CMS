"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  type SortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SortableContainerProps {
  items: string[];
  onReorder: (newIds: string[]) => void;
  children: ReactNode;
  strategy?: "vertical" | "grid";
}

const STRATEGIES: Record<"vertical" | "grid", SortingStrategy> = {
  vertical: verticalListSortingStrategy,
  grid: rectSortingStrategy,
};

export function SortableContainer({
  items,
  onReorder,
  children,
  strategy = "vertical",
}: SortableContainerProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.indexOf(String(active.id));
    const newIndex = items.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    onReorder(arrayMove(items, oldIndex, newIndex));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items} strategy={STRATEGIES[strategy]}>
        {children}
      </SortableContext>
    </DndContext>
  );
}

interface SortableItemRenderProps {
  ref: (node: HTMLElement | null) => void;
  style: CSSProperties;
  handleProps: Record<string, unknown>;
  isDragging: boolean;
}

interface SortableItemProps {
  id: string;
  children: (props: SortableItemRenderProps) => ReactNode;
}

export function SortableItem({ id, children }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    position: "relative",
    zIndex: isDragging ? 10 : "auto",
  };
  return (
    <>
      {children({
        ref: setNodeRef,
        style,
        handleProps: { ...attributes, ...listeners },
        isDragging,
      })}
    </>
  );
}

interface DragHandleProps {
  handleProps: Record<string, unknown>;
  className?: string;
  size?: "sm" | "md";
  ariaLabel?: string;
}

/**
 * Default visual for the drag handle. Spread `handleProps` from SortableItem
 * onto this button so drag starts on grip only — not the whole row.
 */
export function DragHandle({ handleProps, className, size = "md", ariaLabel }: DragHandleProps) {
  const t = useTranslations("Admin.altImage");
  const label = ariaLabel ?? t("dragHandle");
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...handleProps}
      className={cn(
        "inline-flex shrink-0 cursor-grab items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:cursor-grabbing",
        size === "sm" ? "h-7 w-7" : "h-8 w-8",
        className,
      )}
    >
      <GripVertical className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
    </button>
  );
}
