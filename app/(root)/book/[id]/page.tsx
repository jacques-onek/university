import BookOverview from '@/components/BookOverview'
import BookCover from '@/components/BookCover'
import BookVideo from '@/components/BookVideo'
import { db } from '@/database/drizzle'
import { books } from '@/database/schema'
import { and, desc, eq, ne } from 'drizzle-orm'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

const page = async ({params}:{params:Promise<{id:string}>}) => {
    const bookId = (await params).id
    const [book] = await db.select().from(books).where(eq(books.id, bookId)).limit(1)

    if (!book) notFound()

    const similarByGenre = await db
      .select()
      .from(books)
      .where(and(eq(books.genre, book.genre), ne(books.id, book.id)))
      .limit(6)

    const remainingCount = 6 - similarByGenre.length
    let similarBooks = similarByGenre

    if (remainingCount > 0) {
      const fallbackBooks = await db
        .select()
        .from(books)
        .where(ne(books.id, book.id))
        .orderBy(desc(books.createdAt))
        .limit(12)

      const existingIds = new Set(similarByGenre.map((item) => item.id))
      const uniqueFallback = fallbackBooks.filter((item) => !existingIds.has(item.id)).slice(0, remainingCount)
      similarBooks = [...similarByGenre, ...uniqueFallback]
    }

  return (
    <>
      <BookOverview {...book} />
      <div className='book-details'>
         <div className='book-details_main'>
           <section className='flex flex-col gap-7'>
              <h3>Video</h3>
              <div className='book-details_video'>
                <BookVideo vidUrl={book.videoUrl} />
              </div>
           </section>
           <section className='mt-10 flex flex-col gap-7'>
             <h3>Summary</h3>
             <div className='space-y-5 text-xl text-light-100'>
                {book.summary.split("\n").map((line,i) => (
                  <p key={i}>{line}</p>
                ))}
             </div>
           </section>
         </div>
         {similarBooks.length > 0 && (
           <aside className='book-details_similar'>
             <h3>More similar books</h3>
             <div className='similar-books-grid'>
               {similarBooks.map((similarBook) => (
                 <Link key={similarBook.id} href={`/book/${similarBook.id}`} className='similar-book-item'>
                   <BookCover
                     variant="medium"
                     coverColor={similarBook.coverColor}
                     coverImage={similarBook.coverUrl}
                   />
                 </Link>
               ))}
             </div>
           </aside>
         )}
      </div>
    </>
  )
}

export default page
