 "use client"

import { Session } from 'next-auth'
import { Search, X } from 'lucide-react'
import React, { FormEvent, useEffect, useState } from 'react'
import { Input } from '../ui/input'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

const Header = ({session}:{session:Session}) => {
  const firstName = session?.user?.name?.split(" ")[0] ?? "Admin"
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get("q") ?? "")

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "")
  }, [searchParams])

  const onSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    const sanitizedQuery = query.trim()

    if (sanitizedQuery) {
      params.set("q", sanitizedQuery)
    } else {
      params.delete("q")
    }

    const targetPath = pathname.startsWith("/admin") ? pathname : "/admin/books"
    const queryString = params.toString()
    router.push(queryString ? `${targetPath}?${queryString}` : targetPath)
  }

  const onClear = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("q")
    setQuery("")
    const queryString = params.toString()
    router.push(queryString ? `${pathname}?${queryString}` : pathname)
  }

  return (
    <header className='admin-header'>
        <div>
            <h2 className='text-3xl xl:text-[42px] leading-[1.1] text-dark-400 font-semibold'>
              Welcome, {firstName}
            </h2>
            <p className='text-slate-500 text-base xl:text-lg'>Monitor all of your projects and tasks here</p>
        </div>

        <form className='admin-search' onSubmit={onSearch}>
          <Search className='size-5 text-slate-400' />
          <Input
            className='admin-search_input'
            placeholder='Search users, books by title, author, or genre.'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query.trim().length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="rounded-md p-1 text-slate-400 hover:bg-light-300 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          )}
        </form>
    </header>
  )
}

export default Header
