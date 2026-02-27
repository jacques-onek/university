"use server";

import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const updateUserRole = async (userId: string, role: "USER" | "ADMIN") => {
  try {
    await db.update(users).set({ role }).where(eq(users.id, userId));

    revalidatePath("/admin");
    revalidatePath("/admin/users");

    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Failed to update user role" };
  }
};

export const deleteUser = async (userId: string) => {
  try {
    await db.delete(users).where(eq(users.id, userId));

    revalidatePath("/admin");
    revalidatePath("/admin/users");

    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Failed to delete user" };
  }
};

