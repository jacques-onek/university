"use client"
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

const Header = () => {

    const pathName = usePathname()
  return (
    <header className='my-10 flex justify-between gap-3'>
        <Link href="/" className='text-white'>
          <Image src="/icons/logo.svg" alt='logo' width={40} height={40}/>
        </Link>
        <ul>
            <li>
                <Link href="/library" className={cn("text-base cursor-pointer capitalize",pathName==="/library"?"text-light-200":"text-light-100")}>
                  Library
                </Link>
            </li>
            <li>
              <Link href="/my-profile">
              </Link>
            </li>
        </ul>
    </header>
  )
}

export default Header