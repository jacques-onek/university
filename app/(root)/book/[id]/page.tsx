import BookOverview from '@/components/BookOverview'
import BookVideo from '@/components/BookVideo'
import { db } from '@/database/drizzle'
import { books } from '@/database/schema'
import { eq } from 'drizzle-orm'
import React from 'react'

const page = async ({params}:{params:Promise<{id:string}>}) => {
    

    const bookId = (await params).id
    const data =  await db.select().from(books).where(eq(books.id,bookId!)).limit(1)
    const Books = data[0]
    
  return (
    <>
      <BookOverview {...Books} />
      <div className='book-details'>
         <div className='flex[1.5]'>
           <section className='flex flex-col gap-7'>
              <h3>Video</h3>
              <BookVideo vidUrl={Books.videoUrl} />
           </section>
           <section className='mt-10 flex flex-col gap-7'>
             <h3>Summary</h3>
             <div className='space-y-5 text-xl text-light-100'>
                {Books.summary.split("\n").map((line,i) => (
                  <p key={i}>{line}</p>
                ))}
             </div>
           </section>
         </div>
      </div>
    </>
  )
}

export default page