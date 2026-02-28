"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

interface Props {
  initialQuery: string;
  initialAuthor: string;
  initialGenre: string;
  authorOptions: string[];
  genreOptions: string[];
}

const LibraryFilters = ({
  initialQuery,
  initialAuthor,
  initialGenre,
  authorOptions,
  genreOptions,
}: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(initialQuery);
  const [author, setAuthor] = useState(initialAuthor || "all");
  const [genre, setGenre] = useState(initialGenre || "all");

  const applyFilters = (next: { query: string; author: string; genre: string }) => {
    const params = new URLSearchParams(searchParams.toString());

    const trimmedQuery = next.query.trim();
    if (trimmedQuery) params.set("q", trimmedQuery);
    else params.delete("q");

    if (next.author !== "all") params.set("author", next.author);
    else params.delete("author");

    if (next.genre !== "all") params.set("genre", next.genre);
    else params.delete("genre");

    params.delete("page");
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    applyFilters({ query, author, genre });
  };

  const onAuthorChange = (value: string) => {
    setAuthor(value);
    applyFilters({ query, author: value, genre });
  };

  const onGenreChange = (value: string) => {
    setGenre(value);
    applyFilters({ query, author, genre: value });
  };

  return (
    <div className="library-filters">
      <form onSubmit={onSubmit} className="library-filters_search-form">
        <div className="library-filters_search-wrap">
          <Image src="/icons/search-fill.svg" alt="Search icon" width={20} height={20} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title, author or genre"
            className="library-filters_search-input"
          />
        </div>
      </form>

      <div className="library-filters_selects">
        <select value={author} onChange={(event) => onAuthorChange(event.target.value)} className="library-filters_select">
          <option value="all">All authors</option>
          {authorOptions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select value={genre} onChange={(event) => onGenreChange(event.target.value)} className="library-filters_select">
          <option value="all">All genres</option>
          {genreOptions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default LibraryFilters;
