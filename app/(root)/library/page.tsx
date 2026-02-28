import LibraryFilters from "@/components/LibraryFilters";
import BookCard from "@/components/BookCard";
import { db } from "@/database/drizzle";
import { books } from "@/database/schema";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import Link from "next/link";
import React from "react";

const BOOKS_PER_PAGE = 12;

const buildPageItems = (currentPage: number, totalPages: number): (number | "...")[] => {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);

  if (currentPage <= 3) return [1, 2, 3, "...", totalPages];
  if (currentPage >= totalPages - 2) return [1, "...", totalPages - 2, totalPages - 1, totalPages];

  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
};

const LibraryPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; author?: string; genre?: string; page?: string }>;
}) => {
  const { q, author, genre, page } = await searchParams;

  const searchQuery = q?.trim() ?? "";
  const selectedAuthor = author?.trim() ?? "all";
  const selectedGenre = genre?.trim() ?? "all";

  const requestedPage = Number(page);
  const currentPage = Number.isFinite(requestedPage) && requestedPage > 0 ? Math.floor(requestedPage) : 1;

  const [authorRows, genreRows] = await Promise.all([
    db.selectDistinct({ author: books.author }).from(books).orderBy(asc(books.author)),
    db.selectDistinct({ genre: books.genre }).from(books).orderBy(asc(books.genre)),
  ]);

  const authorOptions = authorRows.map((row) => row.author);
  const genreOptions = genreRows.map((row) => row.genre);

  const textFilter =
    searchQuery.length > 0
      ? or(
          ilike(books.title, `%${searchQuery}%`),
          ilike(books.author, `%${searchQuery}%`),
          ilike(books.genre, `%${searchQuery}%`)
        )
      : undefined;

  const authorFilter = selectedAuthor !== "all" ? eq(books.author, selectedAuthor) : undefined;
  const genreFilter = selectedGenre !== "all" ? eq(books.genre, selectedGenre) : undefined;

  const strictFilter =
    authorFilter && genreFilter ? and(authorFilter, genreFilter) : authorFilter ?? genreFilter;

  const whereExpression =
    textFilter && strictFilter ? and(textFilter, strictFilter) : textFilter ?? strictFilter;

  const [countRow] = whereExpression
    ? await db.select({ count: sql<number>`count(*)::int` }).from(books).where(whereExpression)
    : await db.select({ count: sql<number>`count(*)::int` }).from(books);
  const totalResults = countRow?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalResults / BOOKS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const offset = (safePage - 1) * BOOKS_PER_PAGE;

  const results = whereExpression
    ? await db
        .select()
        .from(books)
        .where(whereExpression)
        .orderBy(desc(books.createdAt))
        .limit(BOOKS_PER_PAGE)
        .offset(offset)
    : await db.select().from(books).orderBy(desc(books.createdAt)).limit(BOOKS_PER_PAGE).offset(offset);
  const pageItems = buildPageItems(safePage, totalPages);

  const makePageLink = (nextPage: number) => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (selectedAuthor !== "all") params.set("author", selectedAuthor);
    if (selectedGenre !== "all") params.set("genre", selectedGenre);
    if (nextPage > 1) params.set("page", nextPage.toString());
    const queryString = params.toString();
    return queryString ? `/library?${queryString}` : "/library";
  };

  const previousPage = Math.max(1, safePage - 1);
  const nextPage = Math.min(totalPages, safePage + 1);
  const prevDisabled = safePage === 1;
  const nextDisabled = safePage === totalPages;

  return (
    <section className="library-page">
      <div className="library-page_header">
        <h1>Library</h1>
        <p>Browse all books, then filter by author, genre, or keyword.</p>
      </div>

      <LibraryFilters
        initialQuery={searchQuery}
        initialAuthor={selectedAuthor}
        initialGenre={selectedGenre}
        authorOptions={authorOptions}
        genreOptions={genreOptions}
      />

      {results.length > 0 ? (
        <ul className="book-list mt-10">
          {results.map((book) => (
            <BookCard key={book.id} {...book} />
          ))}
        </ul>
      ) : (
        <div className="library-page_empty">
          <p className="library-page_empty-title">No books found</p>
          <p className="library-page_empty-text">Try changing your filters or clearing the search.</p>
          <Link href="/library" className="library-page_empty-btn">
            Clear filters
          </Link>
        </div>
      )}

      {totalPages > 1 && (
        <div id="pagination" className="mt-10 border-t border-light-100/10 pt-8">
          <Link
            href={makePageLink(previousPage)}
            className={`pagination-btn_dark ${prevDisabled ? "pointer-events-none opacity-50" : ""}`}
            aria-disabled={prevDisabled}
          >
            <p>{"<"}</p>
          </Link>

          {pageItems.map((item, index) =>
            item === "..." ? (
              <p key={`ellipsis-${index}`} className="pagination-btn_dark">
                ...
              </p>
            ) : (
              <Link
                key={item}
                href={makePageLink(item)}
                className={item === safePage ? "pagination-btn_light" : "pagination-btn_dark"}
              >
                <p>{item}</p>
              </Link>
            )
          )}

          <Link
            href={makePageLink(nextPage)}
            className={`pagination-btn_dark ${nextDisabled ? "pointer-events-none opacity-50" : ""}`}
            aria-disabled={nextDisabled}
          >
            <p>{">"}</p>
          </Link>
        </div>
      )}
    </section>
  );
};

export default LibraryPage;
