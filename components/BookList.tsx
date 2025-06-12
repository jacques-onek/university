import React from 'react'
import  {Book} from "@/types"
import BookCard from './BookCard'
interface Props {
  title:string
  Books:Book[],
  containerClassName:string
}
const BookList = ({title,Books,containerClassName} :Props) => {
  return (
    <section className={containerClassName}>
        <h2 className='font-bebas-neue text-4xl text-light-100 '>{title}</h2>
        <ul className='book-list'>
            {Books.map((book) => (
              <BookCard
                key={book.title} {...book}
              /> 
            ))}
        </ul>
    </section>
  )
}

export default BookList