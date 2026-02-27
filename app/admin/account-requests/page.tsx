import AccountRequestsFilters from "@/components/admin/AccountRequestsFilters";
import { Button } from "@/components/ui/button";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import {
  approveAccountRequest,
  rejectAccountRequest,
} from "@/lib/admin/actions/request";
import { resolveImageUrl } from "@/lib/imagekit";
import { getInitials } from "@/lib/utils";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { ArrowUpDown, Eye, X } from "lucide-react";
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
  searchParams: Promise<{ sort?: string; q?: string; card?: string }>;
}) => {
  const { sort, q, card } = await searchParams;
  const oldestFirst = sort === "oldest";
  const searchQuery = q?.trim();
  const cardFilter = card === "with" || card === "without" ? card : "";
  const nextSortParams = new URLSearchParams();
  if (q) nextSortParams.set("q", q);
  if (cardFilter) nextSortParams.set("card", cardFilter);
  if (!oldestFirst) nextSortParams.set("sort", "oldest");
  const sortHref = `/admin/account-requests${
    nextSortParams.toString() ? `?${nextSortParams.toString()}` : ""
  }`;

  const searchFilter = searchQuery
    ? or(
        ilike(users.fullName, `%${searchQuery}%`),
        ilike(users.email, `%${searchQuery}%`),
        sql<boolean>`${users.universityId}::text ilike ${`%${searchQuery}%`}`
      )
    : undefined;

  const cardCondition =
    cardFilter === "with"
      ? sql<boolean>`${users.universityCard} is not null and ${users.universityCard} <> ''`
      : cardFilter === "without"
      ? sql<boolean>`${users.universityCard} is null or ${users.universityCard} = ''`
      : sql<boolean>`true`;

  const requests = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      universityId: users.universityId,
      universityCard: users.universityCard,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(
      and(eq(users.status, "PENDING"), searchFilter ?? sql`true`, cardCondition)
    )
    .orderBy(oldestFirst ? asc(users.createdAt) : desc(users.createdAt));

  return (
    <section className="requests-wrap">
      <div className="requests-header">
        <h2>Account Registration Requests</h2>
        <Button asChild variant="ghost" className="sort-btn">
          <Link href={sortHref}>
            {oldestFirst ? "Oldest to Recent" : "Recent to Oldest"}
            <ArrowUpDown className="size-4" />
          </Link>
        </Button>
      </div>

      <AccountRequestsFilters selectedCard={cardFilter} />

      <div className="requests-table">
        <div className="account-requests-row account-requests-row_head">
          <p>Name</p>
          <p>Date Joined</p>
          <p>University ID No</p>
          <p>University ID Card</p>
          <p>Actions</p>
        </div>

        {requests.map((item) => (
          <div key={item.id} className="account-requests-row">
            <div className="request-user">
              <div className="request-user-avatar small">{getInitials(item.fullName)}</div>
              <div>
                <p className="name">{item.fullName}</p>
                <p className="email">{item.email}</p>
              </div>
            </div>

            <p>{formatDate(item.createdAt)}</p>
            <p>{item.universityId}</p>

            <div>
              {item.universityCard ? (
                <a
                  href={resolveImageUrl(item.universityCard)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="id-card-link"
                >
                  <Eye className="size-4" />
                  View ID Card
                </a>
              ) : (
                <p className="text-light-500">Unavailable</p>
              )}
            </div>

            <div className="account-actions">
              <form
                action={async () => {
                  "use server";
                  await approveAccountRequest(item.id);
                }}
              >
                <Button className="approve-btn">Approve Account</Button>
              </form>

              <form
                action={async () => {
                  "use server";
                  await rejectAccountRequest(item.id);
                }}
              >
                <Button type="submit" variant="ghost" size="icon" className="reject-btn">
                  <X className="size-4" />
                </Button>
              </form>
            </div>
          </div>
        ))}

        {requests.length === 0 && (
          <div className="all-books-empty">
            <p>No account requests found.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default page;
