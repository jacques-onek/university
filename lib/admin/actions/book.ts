"use server"

import { db } from "@/database/drizzle"
import { books } from "@/database/schema"
import { BookParams } from "@/types"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

const createBook = async (params:BookParams) => {
    try {
        
        const createNewBook = await db.insert(books).values({
            ...params,
            availableCopies:params.totalCopies
        }).returning()
        revalidatePath("/admin")
        revalidatePath("/admin/books")

        return {
            success:true,
            data:JSON.parse(JSON.stringify(createNewBook[0]))
        }
    } catch (error) {
        console.log(error)
        return {
            sucess:false,
            message:"An error occured while creating book"
        }
    }
}

export const updateBook = async (bookId: string, params: BookParams) => {
    try {
        const updatedBook = await db
            .update(books)
            .set({
                ...params,
                availableCopies: params.totalCopies,
            })
            .where(eq(books.id, bookId))
            .returning();

        revalidatePath("/admin");
        revalidatePath("/admin/books");
        revalidatePath(`/admin/books/${bookId}`);

        return {
            success: true,
            data: JSON.parse(JSON.stringify(updatedBook[0])),
        };
    } catch (error) {
        console.log(error);
        return {
            success: false,
            message: "An error occured while updating book",
        };
    }
};

export const deleteBook = async (bookId: string) => {
    try {
        await db.delete(books).where(eq(books.id, bookId));

        revalidatePath("/admin");
        revalidatePath("/admin/books");

        return { success: true };
    } catch (error) {
        console.log(error);
        return {
            success: false,
            message: "An error occured while deleting book",
        };
    }
};

export default createBook
