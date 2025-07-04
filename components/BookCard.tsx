import { Book } from '@/types'
import Link from 'next/link'
import React from 'react'
import BookCover from './BookCover'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { Button } from './ui/button'

const BookCard = ({id,title,genre,coverColor,coverUrl}:Book) => <li>
    <Link href={`/book/${id}`}>
      <BookCover coverColor={coverColor} coverImage={coverUrl}/>
      <div className={cn("mt-4", "xs:max-w-40 max-w-28" )}>
        <p className='book-title'>{title}</p>
         <p className='book-genre'> {genre} </p>
      </div>

    </Link>
</li>
export default BookCard