import BookForm from "@/components/admin/Forms/BookForm";
import { Button } from "@/components/ui/button";
import { db } from "@/database/drizzle";
import { books } from "@/database/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import React from "react";

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const [book] = await db.select().from(books).where(eq(books.id, id)).limit(1);

  if (!book) notFound();

  return (
    <>
      <Button asChild className="back-btn">
        <Link href={`/admin/books/${book.id}`}>Go back</Link>
      </Button>

      <section className="w-full max-w-2xl">
        <BookForm
          type="update"
          id={book.id}
          title={book.title}
          description={book.description}
          author={book.author}
          genre={book.genre}
          rating={book.rating}
          totalCopies={book.totalCopies}
          coverUrl={book.coverUrl}
          coverColor={book.coverColor}
          videoUrl={book.videoUrl}
          summary={book.summary}
          availableCopies={book.availableCopies}
        />
      </section>
    </>
  );
};

export default page;

