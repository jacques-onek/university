"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

interface Props {
  initialQuery: string;
  initialGenre: string;
  genres: string[];
}

const SearchControls = ({ initialQuery, initialGenre, genres }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(initialQuery);
  const [genre, setGenre] = useState(initialGenre || "all");

  const applyFilters = (nextQuery: string, nextGenre: string) => {
    const params = new URLSearchParams(searchParams.toString());

    const trimmedQuery = nextQuery.trim();
    if (trimmedQuery.length > 0) params.set("q", trimmedQuery);
    else params.delete("q");

    if (nextGenre !== "all") params.set("genre", nextGenre);
    else params.delete("genre");

    params.delete("page");
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    applyFilters(query, genre);
  };

  const onGenreChange = (value: string) => {
    setGenre(value);
    applyFilters(query, value);
  };

  return (
    <>
      <form onSubmit={onSubmit} className="search-form">
        <div className="search-input-wrap">
          <Image src="/icons/search-fill.svg" alt="Search icon" width={22} height={22} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title, author or genre"
            className="search-input-field"
          />
        </div>
      </form>

      <div className="search-filter-wrap">
        <label htmlFor="genre-filter" className="search-filter-label">
          Filter by:
        </label>
        <select
          id="genre-filter"
          className="search-filter-select"
          value={genre}
          onChange={(event) => onGenreChange(event.target.value)}
        >
          <option value="all">Department</option>
          {genres.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
    </>
  );
};

export default SearchControls;
