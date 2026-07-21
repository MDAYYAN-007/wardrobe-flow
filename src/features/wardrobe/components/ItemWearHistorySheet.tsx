"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { formatLastWorn, formatWearCount } from "@/lib/format/wear-stat";
import { CLOTHING_CATEGORY_LABELS } from "@/lib/validations/categories";
import { ITEM_WEAR_HISTORY_PAGE_SIZE } from "@/features/wardrobe/constants/wear-history";
import { ItemWearHistoryList } from "@/features/wardrobe/components/ItemWearHistoryList";
import { getItemWearHistoryAction } from "@/features/wardrobe/actions/get-item-wear-history";
import type { ClothingItem, ItemWearHistory } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ItemWearHistorySheetProps {
  item: ClothingItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type HistoryState =
  | { status: "loading" }
  | { status: "ready"; history: ItemWearHistory }
  | { status: "error"; message: string };

export function ItemWearHistorySheet({
  item,
  open,
  onOpenChange,
}: ItemWearHistorySheetProps) {
  const [state, setState] = useState<HistoryState>({ status: "loading" });
  const isArchived = Boolean(item.archived_at);
  const categoryLabel = CLOTHING_CATEGORY_LABELS[item.category] ?? item.category;

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;
    setState({ status: "loading" });

    void getItemWearHistoryAction(item.id).then((result) => {
      if (cancelled) {
        return;
      }

      if (!result.success) {
        setState({ status: "error", message: result.error });
        return;
      }

      setState({ status: "ready", history: result.data });
    });

    return () => {
      cancelled = true;
    };
  }, [open, item.id]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2 pr-6">
            <span className="min-w-0">{item.name}</span>
            {isArchived ? (
              <Badge
                variant="secondary"
                className="h-5 shrink-0 px-1.5 text-[10px] uppercase tracking-wide"
              >
                Archived
              </Badge>
            ) : null}
          </DialogTitle>
          <DialogDescription>
            {state.status === "ready" ? (
              <>
                {formatWearCount(state.history.wear_count)}
                <span aria-hidden> · </span>
                {formatLastWorn(state.history.last_worn_date)}
              </>
            ) : state.status === "error" ? (
              state.message
            ) : (
              <span className="inline-flex items-center gap-1" aria-label="Loading">
                <span className="size-1 animate-pulse rounded-full bg-muted-foreground/70" />
                <span className="size-1 animate-pulse rounded-full bg-muted-foreground/70 [animation-delay:150ms]" />
                <span className="size-1 animate-pulse rounded-full bg-muted-foreground/70 [animation-delay:300ms]" />
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          <span>{categoryLabel}</span>
          <span aria-hidden>·</span>
          <span
            className="inline-flex size-2.5 shrink-0 rounded-full border border-border/70"
            style={{ backgroundColor: item.color }}
            aria-hidden
          />
          <span className="capitalize">{item.color}</span>
        </div>

        {state.status === "loading" ? (
          <div
            className="flex items-center justify-center gap-1.5 py-10"
            aria-label="Loading wear history"
          >
            <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/70" />
            <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/70 [animation-delay:150ms]" />
            <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/70 [animation-delay:300ms]" />
          </div>
        ) : state.status === "error" ? (
          <p className="text-sm text-muted-foreground">{state.message}</p>
        ) : state.history.entries.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Not worn yet. Log an outfit that includes this piece to start tracking.
            </p>
            <Button
              size="sm"
              className="w-full"
              nativeButton={false}
              render={<Link href="/outfits/new" />}
            >
              <Plus className="size-4" />
              Log an outfit
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <ItemWearHistoryList entries={state.history.entries} />
            {state.history.has_more ? (
              <p className="text-center text-xs text-muted-foreground">
                Showing latest {ITEM_WEAR_HISTORY_PAGE_SIZE} wears
              </p>
            ) : null}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            nativeButton={false}
            render={<Link href={`/wardrobe/${item.id}/edit`} />}
          >
            Edit item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
