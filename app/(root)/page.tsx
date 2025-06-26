import BookList from '@/components/BookList'
import BookOverview from '@/components/BookOverview'
import { sampleBooks } from '@/constant'
import { db } from '@/database/drizzle'
import { users } from '@/database/schema'
import React from 'react'

const Home = async  () => {


  return (
     <>
       <BookOverview
        {...sampleBooks[0]}
       />

       <BookList
         title="Latest Books"
         Books={sampleBooks}
         containerClassName="mt-28"
       />
       
     </>
  )
}

export default Home