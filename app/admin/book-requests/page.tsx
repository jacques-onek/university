import BorrowStatusSelect from "@/components/admin/BorrowStatusSelect";
import BorrowRequestsFilters from "@/components/admin/BorrowRequestsFilters";
import { Button } from "@/components/ui/button";
import { db } from "@/database/drizzle";
import { books, borrowRecords, users } from "@/database/schema";
import { resolveImageUrl } from "@/lib/imagekit";
import { getInitials } from "@/lib/utils";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { ArrowUpDown, FileText } from "lucide-react";
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

const page = async ({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; q?: string; status?: string; due?: string }>;
}) => {
  const { sort, q, status, due } = await searchParams;
  const oldestFirst = sort === "oldest";
  const searchQuery = q?.trim();
  const statusFilter =
    status === "borrowed" || status === "returned" || status === "late" ? status : "";
  const dueFilter = due === "overdue" || due === "on_time" ? due : "";
  const nextSortParams = new URLSearchParams();
  if (q) nextSortParams.set("q", q);
  if (statusFilter) nextSortParams.set("status", statusFilter);
  if (dueFilter) nextSortParams.set("due", dueFilter);
  if (!oldestFirst) nextSortParams.set("sort", "oldest");
  const sortHref = `/admin/book-requests${nextSortParams.toString() ? `?${nextSortParams.toString()}` : ""}`;

  const now = new Date();
  const whereClauses = [];

  if (searchQuery) {
    whereClauses.push(
      or(
        ilike(books.title, `%${searchQuery}%`),
        ilike(books.author, `%${searchQuery}%`),
        ilike(books.genre, `%${searchQuery}%`),
        ilike(users.fullName, `%${searchQuery}%`),
        ilike(users.email, `%${searchQuery}%`)
      )
    );
  }

  if (statusFilter === "borrowed") {
    whereClauses.push(eq(borrowRecords.status, "BORROWED"));
  }
  if (statusFilter === "returned") {
    whereClauses.push(eq(borrowRecords.status, "RETURNED"));
  }
  if (statusFilter === "late") {
    whereClauses.push(
      and(
        eq(borrowRecords.status, "BORROWED"),
        sql`${borrowRecords.dueDate} < ${now}`
      )
    );
  }

  if (dueFilter === "overdue") {
    whereClauses.push(sql`${borrowRecords.dueDate} < ${now}`);
  }
  if (dueFilter === "on_time") {
    whereClauses.push(sql`${borrowRecords.dueDate} >= ${now}`);
  }

  let requestsQuery = db
    .select({
      id: borrowRecords.id,
      status: borrowRecords.status,
      borrowDate: borrowRecords.borrowDate,
      returnDate: borrowRecords.returnDate,
      dueDate: borrowRecords.dueDate,
      title: books.title,
      author: books.author,
      genre: books.genre,
      coverUrl: books.coverUrl,
      userName: users.fullName,
      userEmail: users.email,
    })
    .from(borrowRecords)
    .innerJoin(books, eq(books.id, borrowRecords.bookId))
    .innerJoin(users, eq(users.id, borrowRecords.userId));

  if (whereClauses.length > 0) {
    requestsQuery = requestsQuery.where(and(...whereClauses));
  }

  const requests = await requestsQuery.orderBy(
    oldestFirst ? asc(borrowRecords.createdAt) : desc(borrowRecords.createdAt)
  );

  return (
    <section className="requests-wrap">
      <div className="requests-header">
        <h2>Borrow Book Requests</h2>
        <Button asChild variant="ghost" className="sort-btn">
          <Link href={sortHref}>
            {oldestFirst ? "Oldest to Recent" : "Recent to Oldest"}
            <ArrowUpDown className="size-4" />
          </Link>
        </Button>
      </div>

      <BorrowRequestsFilters selectedStatus={statusFilter} selectedDue={dueFilter} />

      <div className="requests-table">
        <div className="borrow-requests-row borrow-requests-row_head">
          <p>Book</p>
          <p>User Requested</p>
          <p>Status</p>
          <p>Borrowed date</p>
          <p>Return date</p>
          <p>Due Date</p>
          <p>Receipt</p>
        </div>

        {requests.map((item) => {
          const isLate =
            item.status === "BORROWED" && item.dueDate && new Date(item.dueDate) < new Date();
          return (
            <div key={item.id} className="borrow-requests-row">
              <div className="book-cell">
                <Image
                  src={resolveImageUrl(item.coverUrl)}
                  alt={item.title}
                  width={34}
                  height={48}
                  className="book-cell-cover"
                />
                <p className="book-cell-title">{item.title}</p>
              </div>

              <div className="request-user">
                <div className="request-user-avatar small">{getInitials(item.userName)}</div>
                <div>
                  <p className="name">{item.userName}</p>
                  <p className="email">{item.userEmail}</p>
                </div>
              </div>

              <BorrowStatusSelect recordId={item.id} status={item.status} isLate={Boolean(isLate)} />
              <p>{formatDate(item.borrowDate)}</p>
              <p>{formatDate(item.returnDate)}</p>
              <p>{formatDate(item.dueDate)}</p>

              <Button
                variant="ghost"
                className="receipt-btn"
                disabled={item.status !== "BORROWED"}
              >
                <FileText className="size-4" />
                Generate
              </Button>
            </div>
          );
        })}

        {requests.length === 0 && (
          <div className="all-books-empty">
            <p>No borrow requests found.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default page;
