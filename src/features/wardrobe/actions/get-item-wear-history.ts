"use server";

import { getUser } from "@/lib/supabase/server";
import { getItemWearHistory } from "@/features/wardrobe/queries/get-item-wear-history";
import { WARDROBE_ERRORS } from "@/features/wardrobe/types/action-result";
import type { ItemWearHistory } from "@/types/database";

export type GetItemWearHistoryResult =
  | { success: true; data: ItemWearHistory }
  | { success: false; error: string };

export async function getItemWearHistoryAction(
  itemId: string,
): Promise<GetItemWearHistoryResult> {
  const user = await getUser();
  if (!user) {
    return { success: false, error: WARDROBE_ERRORS.UNAUTHORIZED };
  }

  try {
    const history = await getItemWearHistory(itemId);
    if (!history || history.item.user_id !== user.id) {
      return { success: false, error: WARDROBE_ERRORS.NOT_FOUND };
    }

    return { success: true, data: history };
  } catch (error) {
    console.error(
      "getItemWearHistoryAction:",
      error instanceof Error ? error.message : error,
    );
    return { success: false, error: "Could not load wear history." };
  }
}
