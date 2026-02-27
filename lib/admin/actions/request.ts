"use server";

import { db } from "@/database/drizzle";
import { borrowRecords, users } from "@/database/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const updateBorrowRecordStatus = async (
  recordId: string,
  status: "BORROWED" | "RETURNED"
) => {
  try {
    await db.update(borrowRecords).set({ status }).where(eq(borrowRecords.id, recordId));

    revalidatePath("/admin");
    revalidatePath("/admin/book-requests");

    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Failed to update borrow status" };
  }
};

export const approveAccountRequest = async (userId: string) => {
  try {
    await db.update(users).set({ status: "APPROVED" }).where(eq(users.id, userId));

    revalidatePath("/admin");
    revalidatePath("/admin/account-requests");

    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Failed to approve account request" };
  }
};

export const rejectAccountRequest = async (userId: string) => {
  try {
    await db.update(users).set({ status: "REJECTED" }).where(eq(users.id, userId));

    revalidatePath("/admin");
    revalidatePath("/admin/account-requests");

    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Failed to reject account request" };
  }
};

