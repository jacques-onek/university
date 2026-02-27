"use client"
import { adminSideBarLinks } from '@/constant'
import { cn, getInitials } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import React from 'react'
import { Avatar,AvatarFallback } from '../ui/avatar'
import { Session } from 'next-auth'

const Sidebar = ({session}:{session:Session}) => {

    const pathname = usePathname()
  return (
    <div className='admin-sidebar'>
        <div>
            <div className='logo'>
                <Image src="/icons/admin/logo.svg" alt='logo' height={37} width={37} />
                <h1>Bookwise</h1>
            </div>

             <div className='mt-10 flex flex-col gap-5'>
                {adminSideBarLinks.map((link) => {

                   const isSelected =(link.route !== "/admin" && pathname.includes(link.route) && link.route.length > 1) || pathname === link.route;
                    return (
                        <Link href={link.route} key={link.route}>
                            <div className={cn("link",
                                isSelected && "bg-primary-admin shadow-sm",)}>
                            <div className='relative size-5'>
                                <Image src={link.img} alt='icon' fill className={`${isSelected ?'brightness-0 invert' : ''}  object-contain  `} />
                            </div>
                            <p className={cn(isSelected ? "text-white" : "text-dark-500")}>{link.text}</p>
                            </div>
                        </Link>
                    )
                })}
             </div>
        </div>

        <div className='user'>
          <div className='relative'>
            <Avatar className='size-12'>
              <AvatarFallback className='bg-primary-admin/15 font-semibold text-primary-admin'>
                {getInitials(session?.user?.name || "ON") }
              </AvatarFallback>
            </Avatar>
            <span className='absolute bottom-0 right-0 size-2.5 rounded-full bg-green-500 ring-2 ring-white' />
          </div>
          <div className='flex flex-1 flex-col max-md:hidden'>
            <p className='font-semibold text-dark-200 line-clamp-1'> {session?.user?.name} </p>
            <p className='text-light-500 text-sm line-clamp-1'> {session?.user?.email} </p>
          </div>
          <button
            aria-label='Logout'
            className='ml-auto rounded-full p-1 transition-colors hover:bg-light-300 max-md:hidden'
            onClick={() => signOut({ callbackUrl: "/sign-in" })}
            type='button'
          >
            <Image src="/icons/logout.svg" alt='logout' width={20} height={20} />
          </button>
        </div>
    </div>
  )
}

export default Sidebar
