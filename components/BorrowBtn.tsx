"use client"
import React from 'react'
import { Button } from './ui/button'
import { borrowBook } from '@/lib/actions/book'
import Image from 'next/image'


const BorrowBtn = ({userId,bookId}:{userId:string,bookId:string}) => {
  return (
    <Button className='book-overview_btn' onClick={() => {borrowBook({userId,bookId}); console.log("boorow record successfully added ")}} >
        <Image src="/icons/book.svg" alt='book' width={20} height={20} />
            <p className='font-bebas-neue text-xl text-dark-100'> Borrow</p>
    </Button>
  )
}

export default BorrowBtn