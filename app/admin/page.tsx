import { Button } from "@/components/ui/button";
import { db } from "@/database/drizzle";
import { books, borrowRecords, users } from "@/database/schema";
import { resolveImageUrl } from "@/lib/imagekit";
import { getInitials } from "@/lib/utils";
import { desc, eq, sql } from "drizzle-orm";
import { CalendarDays, ChevronDown, ChevronUp, Eye, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

type DashboardCount = {
  count: number;
};

const formatDate = (date: Date | string | null) => {
  if (!date) return "--";

  const parsedDate = typeof date === "string" ? new Date(date) : date;
  const formatter = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });

  return formatter.format(parsedDate);
};

const page = async () => {
  const [
    borrowedBooksCount,
    totalUsersCount,
    totalBooksCount,
    recentBooks,
    borrowRequests,
    accountRequests,
  ] =
    await Promise.all([
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(borrowRecords)
        .where(eq(borrowRecords.status, "BORROWED")),
      db.select({ count: sql<number>`count(*)::int` }).from(users),
      db.select({ count: sql<number>`count(*)::int` }).from(books),
      db
        .select({
          id: books.id,
          title: books.title,
          author: books.author,
          genre: books.genre,
          coverUrl: books.coverUrl,
          createdAt: books.createdAt,
        })
        .from(books)
        .orderBy(desc(books.createdAt))
        .limit(6),
      db
        .select({
          id: borrowRecords.id,
          borrowDate: borrowRecords.borrowDate,
          bookId: books.id,
          title: books.title,
          author: books.author,
          genre: books.genre,
          coverUrl: books.coverUrl,
          userName: users.fullName,
        })
        .from(borrowRecords)
        .innerJoin(books, eq(books.id, borrowRecords.bookId))
        .innerJoin(users, eq(users.id, borrowRecords.userId))
        .where(eq(borrowRecords.status, "BORROWED"))
        .orderBy(desc(borrowRecords.createdAt))
        .limit(4),
      db
        .select({
          id: users.id,
          fullName: users.fullName,
          email: users.email,
        })
        .from(users)
        .where(eq(users.status, "PENDING"))
        .orderBy(desc(users.createdAt))
        .limit(6),
    ]);

  const borrowedCount = (borrowedBooksCount[0] as DashboardCount)?.count ?? 0;
  const usersCount = (totalUsersCount[0] as DashboardCount)?.count ?? 0;
  const booksCount = (totalBooksCount[0] as DashboardCount)?.count ?? 0;

  return (
    <section className="admin-dashboard">
      <div className="stats-grid">
        <article className="stat">
          <div className="stat-info">
            <p className="stat-label">Borrowed Books</p>
            <div className="stat-trend stat-trend_down">
              <ChevronDown className="size-4" />
              <span>2</span>
            </div>
          </div>
          <p className="stat-count">{borrowedCount}</p>
        </article>

        <article className="stat">
          <div className="stat-info">
            <p className="stat-label">Total Users</p>
            <div className="stat-trend stat-trend_up">
              <ChevronUp className="size-4" />
              <span>4</span>
            </div>
          </div>
          <p className="stat-count">{usersCount}</p>
        </article>

        <article className="stat">
          <div className="stat-info">
            <p className="stat-label">Total Books</p>
            <div className="stat-trend stat-trend_up">
              <ChevronUp className="size-4" />
              <span>2</span>
            </div>
          </div>
          <p className="stat-count">{booksCount}</p>
        </article>
      </div>

      <div className="admin-panels-grid">
        <div className="admin-panels-left">
          <article className="dashboard-panel">
            <div className="panel-heading">
              <h3>Borrow Requests</h3>
              <Button asChild className="view-btn">
                <Link href="/admin/book-requests">View all</Link>
              </Button>
            </div>
            {borrowRequests.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state_illustration">
                  <Image src="/icons/admin/book.svg" alt="book icon" width={46} height={46} />
                </div>
                <p className="empty-state_title">No Pending Book Requests</p>
                <p className="empty-state_text">
                  There are no borrow book requests awaiting your review at this time.
                </p>
              </div>
            ) : (
              <div className="borrow-requests-list hide-scrollbar">
                {borrowRequests.map((request) => (
                  <div key={request.id} className="book-stripe">
                    <Image
                      src={resolveImageUrl(request.coverUrl)}
                      alt={request.title}
                      width={58}
                      height={78}
                      className="rounded-md object-cover ring-1 ring-black/5"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="title">{request.title}</p>
                      <div className="author">
                        <p>By {request.author}</p>
                        <div />
                        <p>{request.genre}</p>
                      </div>
                      <div className="user">
                        <div className="avatar">
                          <div className="request-avatar">{getInitials(request.userName)}</div>
                          <p>{request.userName}</p>
                        </div>
                        <div className="borrow-date">
                          <CalendarDays className="size-3.5 text-light-500" />
                          <p>{formatDate(request.borrowDate)}</p>
                        </div>
                      </div>
                    </div>
                    <Button asChild variant="ghost" size="icon" className="request-view-btn">
                      <Link href={`/admin/books/${request.bookId}`} aria-label="View request">
                        <Eye className="size-4 text-dark-700" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </article>

          <article className="dashboard-panel">
            <div className="panel-heading">
              <h3>Account Requests</h3>
              <Button asChild className="view-btn">
                <Link href="/admin/account-requests">View all</Link>
              </Button>
            </div>
            {accountRequests.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state_illustration">
                  <Image src="/icons/admin/user.svg" alt="user icon" width={42} height={42} />
                </div>
                <p className="empty-state_title">No Pending Account Requests</p>
                <p className="empty-state_text">
                  There are currently no account requests awaiting approval.
                </p>
              </div>
            ) : (
              <div className="account-requests-grid">
                {accountRequests.map((account) => (
                  <div key={account.id} className="request-user-card">
                    <div className="request-user-avatar">{getInitials(account.fullName)}</div>
                    <p className="name">{account.fullName}</p>
                    <p className="email">{account.email}</p>
                  </div>
                ))}
              </div>
            )}
          </article>
        </div>

        <article className="dashboard-panel recently-panel">
          <div className="panel-heading">
            <h3>Recently Added Books</h3>
            <Button asChild className="view-btn">
              <Link href="/admin/books">View all</Link>
            </Button>
          </div>

          <Link href="/admin/books/new" className="add-new-book_btn">
            <div>
              <Plus className="size-6 text-green-800" />
            </div>
            <p>Add New Book</p>
          </Link>

          <div className="recent-list hide-scrollbar">
            {recentBooks.map((book) => (
              <div key={book.id} className="recent-book-item">
                <Image
                  src={resolveImageUrl(book.coverUrl)}
                  alt={book.title}
                  width={56}
                  height={78}
                  className="recent-book-cover"
                />
                <div className="recent-book-content">
                  <p className="recent-book-title">{book.title}</p>
                  <div className="recent-book-meta">
                    <span>By {book.author}</span>
                    <span className="dot" />
                    <span>{book.genre}</span>
                  </div>
                  <p className="recent-book-date">
                    <CalendarDays className="size-3.5" />
                    {formatDate(book.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
};

export default page;
