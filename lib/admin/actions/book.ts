"use server"

import { db } from "@/database/drizzle"
import { books } from "@/database/schema"
import { BookParams } from "@/types"

const createBook = async (params:BookParams) => {
    try {
        
        const createNewBook = await db.insert(books).values({
            ...params,
            availableCopies:params.totalCopies
        }).returning()

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

export default createBook