"use client"
import { adminSideBarLinks } from '@/constant'
import { cn, getInitials } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
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

        <div className='flex gap-3'>
            <Avatar>
                  <AvatarFallback className='bg-amber-700 font-semibold'>
                     {getInitials(session?.user?.name || "ON") }
                  </AvatarFallback>
            </Avatar>
        <div className='flex flex-col max-md:hidden'>
           <p className='font-semibold text-dark-200'> {session?.user?.name} </p>
           <p className='text-light-500 text-xs'> {session?.user?.email} </p>
        </div>
        </div>
    </div>
  )
}

export default Sidebar