import { Button } from "@/components/ui/button";
import BooksFilters from "@/components/admin/BooksFilters";
import { db } from "@/database/drizzle";
import { books, borrowRecords } from "@/database/schema";
import { deleteBook } from "@/lib/admin/actions/book";
import { resolveImageUrl } from "@/lib/imagekit";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { ArrowUpDown, Pencil, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const formatDate = (date: Date | string | null) => {
  if (!date) return "--";

  const parsedDate = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(parsedDate);
};

const createBooksUrl = (
  params: {
    sort?: string;
    q?: string;
    author?: string;
    genre?: string;
    date?: string;
    borrowed?: string;
  },
  overrides: Partial<{
    sort?: string;
    q?: string;
    author?: string;
    genre?: string;
    date?: string;
    borrowed?: string;
  }>
) => {
  const next = new URLSearchParams();
  const merged = { ...params, ...overrides };

  Object.entries(merged).forEach(([key, value]) => {
    if (value && value.trim().length > 0) {
      next.set(key, value);
    }
  });

  const query = next.toString();
  return query ? `/admin/books?${query}` : "/admin/books";
};

const page = async ({
  searchParams,
}: {
  searchParams: Promise<{
    sort?: string;
    q?: string;
    author?: string;
    genre?: string;
    date?: string;
    borrowed?: string;
  }>;
}) => {
  const { sort, q, author, genre, date, borrowed } = await searchParams;
  const isDesc = sort === "desc";
  const searchQuery = q?.trim();
  const selectedAuthor = author?.trim();
  const selectedGenre = genre?.trim();
  const selectedDate = date === "oldest" ? "oldest" : date === "newest" ? "newest" : "";
  const selectedBorrowed =
    borrowed === "least"
      ? "least"
      : borrowed === "most"
      ? "most"
      : borrowed === "borrowed"
      ? "borrowed"
      : "";

  const [authorOptions, genreOptions] = await Promise.all([
    db
      .selectDistinct({ author: books.author })
      .from(books)
      .orderBy(asc(books.author)),
    db
      .selectDistinct({ genre: books.genre })
      .from(books)
      .orderBy(asc(books.genre)),
  ]);

  const whereClauses = [];

  if (searchQuery) {
    whereClauses.push(
      or(
        ilike(books.title, `%${searchQuery}%`),
        ilike(books.author, `%${searchQuery}%`),
        ilike(books.genre, `%${searchQuery}%`)
      )
    );
  }

  if (selectedAuthor) {
    whereClauses.push(eq(books.author, selectedAuthor));
  }

  if (selectedGenre) {
    whereClauses.push(eq(books.genre, selectedGenre));
  }

  const borrowedCountSql = sql<number>`count(${borrowRecords.id})`;

  let booksQuery = db
    .select({
      id: books.id,
      title: books.title,
      author: books.author,
      genre: books.genre,
      coverUrl: books.coverUrl,
      createdAt: books.createdAt,
      borrowedCount: sql<number>`count(${borrowRecords.id})::int`,
    })
    .from(books)
    .leftJoin(borrowRecords, eq(borrowRecords.bookId, books.id))
    .groupBy(books.id);

  if (whereClauses.length > 0) {
    booksQuery = booksQuery.where(and(...whereClauses));
  }

  if (selectedBorrowed === "borrowed") {
    booksQuery = booksQuery.having(sql`count(${borrowRecords.id}) > 0`);
  }

  const orderByClauses = [];

  if (selectedBorrowed === "most") {
    orderByClauses.push(desc(borrowedCountSql));
  } else if (selectedBorrowed === "least") {
    orderByClauses.push(asc(borrowedCountSql));
  }

  if (selectedDate === "newest") {
    orderByClauses.push(desc(books.createdAt));
  } else if (selectedDate === "oldest") {
    orderByClauses.push(asc(books.createdAt));
  }

  orderByClauses.push(isDesc ? desc(books.title) : asc(books.title));

  const allBooks = await booksQuery.orderBy(...orderByClauses);

  return (
    <section className="all-books-wrap">
      <div className="all-books-header">
        <h2 className="text-4xl font-semibold text-dark-500">All Books</h2>

        <div className="all-books-actions">
          <Button asChild variant="ghost" className="sort-btn">
            <Link
              href={createBooksUrl(
                { sort, q, author, genre, date, borrowed },
                { sort: isDesc ? "asc" : "desc" }
              )}
            >
              {isDesc ? "Z-A" : "A-Z"}
              <ArrowUpDown className="size-4" />
            </Link>
          </Button>

          <Button className="bg-primary-admin text-white hover:bg-primary-admin/95" asChild>
            <Link href="/admin/books/new">
              <Plus className="size-4" />
              Create a New Book
            </Link>
          </Button>
        </div>
      </div>

      <BooksFilters
        authorOptions={authorOptions.map((item) => item.author)}
        genreOptions={genreOptions.map((item) => item.genre)}
        selectedAuthor={selectedAuthor}
        selectedGenre={selectedGenre}
        selectedDate={selectedDate}
        selectedBorrowed={selectedBorrowed}
      />

      <div className="all-books-table">
        <div className="all-books-row all-books-row_head">
          <p>Book Title</p>
          <p>Author</p>
          <p>Genre</p>
          <p>Date Created</p>
          <p>Action</p>
        </div>

        {allBooks.map((book) => (
          <div key={book.id} className="all-books-row">
            <div className="book-cell">
              <Image
                src={resolveImageUrl(book.coverUrl)}
                alt={book.title}
                width={34}
                height={48}
                className="book-cell-cover"
              />
              <p className="book-cell-title">{book.title}</p>
            </div>
            <p>{book.author}</p>
            <p>{book.genre}</p>
            <p>{formatDate(book.createdAt)}</p>

            <div className="book-actions">
              <Link href={`/admin/books/${book.id}/edit`} className="edit-action" aria-label="Edit book">
                <Pencil className="size-4" />
              </Link>

              <form
                action={async () => {
                  "use server";
                  await deleteBook(book.id);
                }}
              >
                <button
                  type="submit"
                  aria-label="Delete book"
                  className="delete-action"
                >
                  <Trash2 className="size-4" />
                </button>
              </form>
            </div>
          </div>
        ))}

        {allBooks.length === 0 && (
          <div className="all-books-empty">
            <p>
              {searchQuery
                ? `No books found for "${searchQuery}".`
                : "No books found. Create your first book to populate this table."}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default page;
