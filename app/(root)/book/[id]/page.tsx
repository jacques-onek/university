import { db } from '@/database/drizzle'
import { books } from '@/database/schema'
import { eq } from 'drizzle-orm'
import React from 'react'

const page = async ({params}:{params:Promise<{id:string}>}) => {
    

    const bookId = (await params).id
    console.log("the book id is ", bookId)
    // const book =  await db.select().from(books).where(eq(books.id,bookId!)).limit(1)
  return (
    <div>page</div>
  )
}

export default page