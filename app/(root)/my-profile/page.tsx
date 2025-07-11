import { auth, signOut } from '@/auth'
import BookList from '@/components/BookList'
import { Button } from '@/components/ui/button'
import { db } from '@/database/drizzle'
import { borrowRecords } from '@/database/schema'
import { eq } from 'drizzle-orm'
import { books } from '@/database/schema'
import React from 'react'

const page = async () => {

  const userId = (await auth())?.user?.id
  const BorrowedBooks = await db.select().from(borrowRecords).where(eq(borrowRecords.userId,userId!))
  let listBooks = []
  
    for (let index = 0; index < BorrowedBooks.length; index++) {
      const [book] = await db.select().from(books).where(eq(books.id,BorrowedBooks[index].bookId))
      listBooks.push(book);
      
    }
  

  return (
    <>
    <form action={async () => {
        "use server"

        await signOut()
    }}
    className='mb-10'
    >
     <Button>
        Logout
     </Button>

    </form>
    <BookList title="Borrowed Books" Books={listBooks} containerClassName="mt-28"/>
    </>
  )
}

export default page