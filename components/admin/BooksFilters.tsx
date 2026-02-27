"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";

interface Props {
  authorOptions: string[];
  genreOptions: string[];
  selectedAuthor?: string;
  selectedGenre?: string;
  selectedDate?: string;
  selectedBorrowed?: string;
}

const BooksFilters = ({
  authorOptions,
  genreOptions,
  selectedAuthor,
  selectedGenre,
  selectedDate,
  selectedBorrowed,
}: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onSelectChange = (
    key: "author" | "genre" | "date" | "borrowed",
    value: string
  ) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    const next = params.toString();
    router.push(next ? `${pathname}?${next}` : pathname);
  };

  return (
    <div className="all-books-filters">
      <Select
        value={selectedAuthor && selectedAuthor.length > 0 ? selectedAuthor : "all"}
        onValueChange={(value) => onSelectChange("author", value)}
      >
        <SelectTrigger className="books-filter-select">
          <SelectValue placeholder="All authors" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All authors</SelectItem>
          {authorOptions.map((author) => (
            <SelectItem key={author} value={author}>
              {author}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedGenre && selectedGenre.length > 0 ? selectedGenre : "all"}
        onValueChange={(value) => onSelectChange("genre", value)}
      >
        <SelectTrigger className="books-filter-select">
          <SelectValue placeholder="All genres" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All genres</SelectItem>
          {genreOptions.map((genre) => (
            <SelectItem key={genre} value={genre}>
              {genre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedDate && selectedDate.length > 0 ? selectedDate : "all"}
        onValueChange={(value) => onSelectChange("date", value)}
      >
        <SelectTrigger className="books-filter-select">
          <SelectValue placeholder="Date" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Date</SelectItem>
          <SelectItem value="newest">Newest first</SelectItem>
          <SelectItem value="oldest">Oldest first</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={selectedBorrowed && selectedBorrowed.length > 0 ? selectedBorrowed : "all"}
        onValueChange={(value) => onSelectChange("borrowed", value)}
      >
        <SelectTrigger className="books-filter-select">
          <SelectValue placeholder="Borrowed" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All books</SelectItem>
          <SelectItem value="borrowed">Borrowed</SelectItem>
          <SelectItem value="most">Most borrowed</SelectItem>
          <SelectItem value="least">Least borrowed</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="ghost"
        className="books-filter-reset"
        onClick={() => router.push("/admin/books")}
      >
        Reset
      </Button>
    </div>
  );
};

export default BooksFilters;
