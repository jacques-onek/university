import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import React, { ReactNode } from 'react'
import "@/styles/admin.css"
import Sidebar from '@/components/admin/Sidebar'
import Header from '@/components/admin/Header'

const layout =async ({children}:{children:ReactNode}) => {

    const session = await auth()

    if(!session?.user?.id) redirect ("/sign-in")
    // const isAdmin = await db.select().from(users).
    // where(and( eq(users.id,session.user.id),eq(users.role,"ADMIN")))
    // if (!isAdmin) {
    //   redirect("/")
    // }
  return (
    <main className='flex min-h-screen w-full flex-row'>
        <Sidebar session={session}/>

        <div className='admin-container'>
           <Header session={session} />
           {children}
        </div>
    </main>
  )
}

export default layout
