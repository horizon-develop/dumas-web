"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function linkSistelClient(userId: number, sistelId: number) {
  await db.update(users).set({ sistelId }).where(eq(users.id, userId));
  revalidatePath("/admin/clientes");
}

export async function unlinkSistelClient(userId: number) {
  await db.update(users).set({ sistelId: null }).where(eq(users.id, userId));
  revalidatePath("/admin/clientes");
}
