import { Button } from "@/components/ui/button";
import { db } from "@/database/drizzle";
import { books } from "@/database/schema";
import { resolveImageUrl } from "@/lib/imagekit";
import { eq } from "drizzle-orm";
import { CalendarDays, Pencil } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import React from "react";

const formatDate = (date: Date | string | null) => {
  if (!date) return "--";
  const parsedDate = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(parsedDate);
};

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const [book] = await db.select().from(books).where(eq(books.id, id)).limit(1);

  if (!book) notFound();

  return (
    <>
      <Button asChild className="back-btn">
        <Link href="/admin/books">Go back</Link>
      </Button>

      <section className="book-detail-wrap">
        <div className="book-detail-top">
          <div className="book-detail-cover-box">
            <Image
              src={resolveImageUrl(book.coverUrl)}
              alt={book.title}
              width={220}
              height={320}
              className="book-detail-cover"
            />
          </div>

          <div className="book-detail-meta">
            <p className="book-created-date">
              Created at:
              <span>
                <CalendarDays className="size-4" />
                {formatDate(book.createdAt)}
              </span>
            </p>

            <h1 className="book-detail-title">{book.title}</h1>
            <p className="book-detail-author">By {book.author}</p>
            <p className="book-detail-genre">{book.genre}</p>

            <Button asChild className="book-detail-edit-btn">
              <Link href={`/admin/books/${book.id}/edit`}>
                <Pencil className="size-4" />
                Edit Book
              </Link>
            </Button>
          </div>
        </div>

        <div className="book-detail-content">
          <div>
            <h3 className="book-detail-section-title">Summary</h3>
            <p className="book-detail-summary">{book.summary}</p>
          </div>

          <div>
            <h3 className="book-detail-section-title">Video</h3>
            <div className="book-detail-video-box">
              <video
                src={resolveImageUrl(book.videoUrl)}
                controls
                className="book-detail-video"
                poster={resolveImageUrl(book.coverUrl)}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default page;
