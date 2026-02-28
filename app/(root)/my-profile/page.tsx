import { auth, signOut } from "@/auth";
import BookCover from "@/components/BookCover";
import { Button } from "@/components/ui/button";
import { db } from "@/database/drizzle";
import { books, borrowRecords, users } from "@/database/schema";
import { resolveImageUrl } from "@/lib/imagekit";
import { getInitials } from "@/lib/utils";
import { desc, eq } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const formatDate = (value: Date | string | null) => {
  if (!value) return "--";
  const parsed = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit" }).format(parsed);
};

const getDaysLeft = (dueDate: Date | string | null) => {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  const now = new Date();
  due.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

const page = async () => {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return null;

  const [user, borrowedBooks] = await Promise.all([
    db.select().from(users).where(eq(users.id, userId)).limit(1),
    db
      .select({
        recordId: borrowRecords.id,
        status: borrowRecords.status,
        borrowDate: borrowRecords.borrowDate,
        dueDate: borrowRecords.dueDate,
        returnDate: borrowRecords.returnDate,
        title: books.title,
        author: books.author,
        genre: books.genre,
        coverColor: books.coverColor,
        coverUrl: books.coverUrl,
        bookId: books.id,
      })
      .from(borrowRecords)
      .innerJoin(books, eq(books.id, borrowRecords.bookId))
      .where(eq(borrowRecords.userId, userId))
      .orderBy(desc(borrowRecords.borrowDate)),
  ]);

  const currentUser = user[0];
  const now = new Date();

  return (
    <section className="profile-page">
      <form
        action={async () => {
          "use server";
          await signOut();
        }}
        className="profile-page_logout"
      >
        <Button type="submit">Logout</Button>
      </form>

      <div className="profile-layout">
        <aside className="profile-card">
          <div className="profile-card_head">
            {currentUser?.universityCard ? (
              <Image
                src={resolveImageUrl(currentUser.universityCard)}
                alt="University card"
                width={86}
                height={86}
                className="profile-card_avatar"
              />
            ) : (
              <div className="profile-card_avatar-fallback">{getInitials(currentUser?.fullName ?? "User")}</div>
            )}

            <div>
              <p className="profile-card_badge">
                <span className="profile-card_badge-dot" />
                {currentUser?.status === "APPROVED" ? "Verified Student" : "Pending Verification"}
              </p>
              <h2>{currentUser?.fullName}</h2>
              <p className="profile-card_email">{currentUser?.email}</p>
            </div>
          </div>

          <div className="profile-card_meta">
            <div>
              <p>University</p>
              <h3>BookWise University</h3>
            </div>
            <div>
              <p>Student ID</p>
              <h3>{currentUser?.universityId}</h3>
            </div>
            <div>
              <p>Account role</p>
              <h3>{currentUser?.role}</h3>
            </div>
          </div>
        </aside>

        <div className="profile-borrowed">
          <h2>Borrowed books</h2>

          {borrowedBooks.length > 0 ? (
            <ul className="profile-borrowed_grid">
              {borrowedBooks.map((item) => {
                const daysLeft = getDaysLeft(item.dueDate);
                const isOverdue = item.status === "BORROWED" && item.dueDate && new Date(item.dueDate) < now;
                const isReturned = item.status === "RETURNED";

                return (
                  <li key={item.recordId} className="profile-borrowed_card">
                    <Link href={`/book/${item.bookId}`} className="profile-borrowed_link">
                      <div className="profile-borrowed_cover">
                        <BookCover variant="medium" coverColor={item.coverColor} coverImage={item.coverUrl} />
                      </div>

                      <p className="profile-borrowed_title">
                        {item.title} - By {item.author}
                      </p>
                      <p className="profile-borrowed_genre">{item.genre}</p>
                    </Link>

                    <div className="profile-borrowed_meta">
                      <p>Borrowed on {formatDate(item.borrowDate)}</p>

                      {isReturned ? (
                        <p className="profile-borrowed_ok">Returned on {formatDate(item.returnDate)}</p>
                      ) : isOverdue ? (
                        <p className="profile-borrowed_alert">Overdue Return</p>
                      ) : (
                        <p>
                          {typeof daysLeft === "number" ? `${daysLeft} days left to due` : "Due date unavailable"}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="profile-borrowed_empty">
              <p>No borrowed books yet.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default page;
