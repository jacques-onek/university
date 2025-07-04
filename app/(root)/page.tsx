import { auth } from '@/auth'
import BookList from '@/components/BookList'
import BookOverview from '@/components/BookOverview'
import { sampleBooks } from '@/constant'
import { db } from '@/database/drizzle'
import { books, users } from '@/database/schema'
import { Book } from '@/types'
import { desc } from 'drizzle-orm'
import React from 'react'

const Home = async  () => {

const userId = (await auth())?.user?.id
const latestBooks = (await db.select().from(books).limit(10).orderBy(desc(books.createdAt))) as Book[]

  return (
     <>
       <BookOverview
        {...latestBooks[0]}
       />

       <BookList
         title="Latest Books"
         Books={latestBooks}
         containerClassName="mt-28"
       />
       
     </>
  )
}

export default Home