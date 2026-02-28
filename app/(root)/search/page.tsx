import BookCover from "@/components/BookCover";
import SearchControls from "@/components/SearchControls";
import { db } from "@/database/drizzle";
import { books } from "@/database/schema";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";

const BOOKS_PER_PAGE = 12;

const buildPageItems = (currentPage: number, totalPages: number): (number | "...")[] => {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);

  if (currentPage <= 3) return [1, 2, 3, "...", totalPages];
  if (currentPage >= totalPages - 2) return [1, "...", totalPages - 2, totalPages - 1, totalPages];

  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
};

const SearchPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; genre?: string; page?: string }>;
}) => {
  const { q, genre, page } = await searchParams;
  const searchQuery = q?.trim() ?? "";
  const selectedGenre = genre?.trim() ?? "all";
  const requestedPage = Number(page);
  const currentPage = Number.isFinite(requestedPage) && requestedPage > 0 ? Math.floor(requestedPage) : 1;

  const genreRows = await db.selectDistinct({ genre: books.genre }).from(books).orderBy(asc(books.genre));
  const genres = genreRows.map((row) => row.genre);

  const textFilter =
    searchQuery.length > 0
      ? or(
          ilike(books.title, `%${searchQuery}%`),
          ilike(books.author, `%${searchQuery}%`),
          ilike(books.genre, `%${searchQuery}%`)
        )
      : undefined;

  const genreFilter = selectedGenre !== "all" ? eq(books.genre, selectedGenre) : undefined;
  const whereExpression = textFilter && genreFilter ? and(textFilter, genreFilter) : textFilter ?? genreFilter;

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
    if (searchQuery.length > 0) params.set("q", searchQuery);
    if (selectedGenre !== "all") params.set("genre", selectedGenre);
    if (nextPage > 1) params.set("page", nextPage.toString());
    const queryString = params.toString();
    return queryString ? `/search?${queryString}` : "/search";
  };

  const previousPage = Math.max(1, safePage - 1);
  const nextPage = Math.min(totalPages, safePage + 1);
  const prevDisabled = safePage === 1;
  const nextDisabled = safePage === totalPages;

  return (
    <section className="search-page">
      <div className="search-hero">
        <p className="search-kicker">DISCOVER YOUR NEXT GREAT READ:</p>
        <h1>
          Explore and Search for
          <br />
          <span>Any Book In Our Library</span>
        </h1>
      </div>

      <SearchControls initialQuery={searchQuery} initialGenre={selectedGenre} genres={genres} />

      <div className="search-results-head">
        <h2>
          {searchQuery ? (
            <>
              Search Result for <span>{searchQuery}</span>
            </>
          ) : (
            "Search Results"
          )}
        </h2>
      </div>

      {results.length > 0 ? (
        <>
          <ul className="search-results-grid">
            {results.map((book) => (
              <li key={book.id}>
                <Link href={`/book/${book.id}`} className="search-book-card">
                  <BookCover variant="medium" coverColor={book.coverColor} coverImage={book.coverUrl} />
                  <div className="search-book-meta">
                    <p className="search-book-title">
                      {book.title} - By {book.author}
                    </p>
                    <p className="search-book-genre">{book.genre}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

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
        </>
      ) : (
        <div className="search-empty-state">
          <div className="search-empty-icon-wrap">
            <Image src="/icons/no-results.svg" alt="No results" width={224} height={224} className="search-empty-icon" />
          </div>
          <h3>No Results Found</h3>
          <p>We couldn&apos;t find any books matching your search.</p>
          <p>Try using different keywords or check for typos.</p>
          <Link href="/search" className="search-empty-clear">
            Clear Search
          </Link>
        </div>
      )}
    </section>
  );
};

export default SearchPage;
