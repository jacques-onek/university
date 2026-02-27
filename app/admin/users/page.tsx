import { auth } from "@/auth";
import UserRoleSelect from "@/components/admin/UserRoleSelect";
import { Button } from "@/components/ui/button";
import { db } from "@/database/drizzle";
import { borrowRecords, users } from "@/database/schema";
import { deleteUser } from "@/lib/admin/actions/user";
import { resolveImageUrl } from "@/lib/imagekit";
import { getInitials } from "@/lib/utils";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { ArrowUpDown, ExternalLink, Trash2 } from "lucide-react";
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
  searchParams: Promise<{ sort?: string; q?: string }>;
}) => {
  const session = await auth();
  const currentUserId = session?.user?.id;
  const { sort, q } = await searchParams;
  const isDesc = sort === "desc";
  const searchQuery = q?.trim();

  const whereClauses = [];
  if (searchQuery) {
    whereClauses.push(
      or(
        ilike(users.fullName, `%${searchQuery}%`),
        ilike(users.email, `%${searchQuery}%`),
        sql<boolean>`${users.universityId}::text ilike ${`%${searchQuery}%`}`
      )
    );
  }

  const nextSortParams = new URLSearchParams();
  if (q) nextSortParams.set("q", q);
  nextSortParams.set("sort", isDesc ? "asc" : "desc");
  const sortHref = `/admin/users?${nextSortParams.toString()}`;

  let usersQuery = db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      createdAt: users.createdAt,
      role: users.role,
      universityId: users.universityId,
      universityCard: users.universityCard,
      booksBorrowed: sql<number>`count(${borrowRecords.id})::int`,
    })
    .from(users)
    .leftJoin(borrowRecords, eq(borrowRecords.userId, users.id))
    .groupBy(users.id);

  if (whereClauses.length > 0) {
    usersQuery = usersQuery.where(and(...whereClauses));
  }

  const usersList = await usersQuery.orderBy(
    isDesc ? desc(users.fullName) : asc(users.fullName)
  );

  return (
    <section className="all-users-wrap">
      <div className="all-users-header">
        <h2>All Users</h2>
        <Button asChild variant="ghost" className="sort-btn">
          <Link href={sortHref}>
            {isDesc ? "Z-A" : "A-Z"}
            <ArrowUpDown className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="all-users-table">
        <div className="all-users-row all-users-row_head">
          <p>Profile</p>
          <p>Name</p>
          <p>Email</p>
          <p>Date Joined</p>
          <p>Role</p>
          <p>Books Borrowed</p>
          <p>University ID No</p>
          <p>University ID Card</p>
          <p>Action</p>
        </div>

        {usersList.map((item) => (
          <div key={item.id} className="all-users-row">
            <div className="users-profile-cell">
              <div className="request-user-avatar small">{getInitials(item.fullName)}</div>
            </div>
            <p className="users-name">{item.fullName}</p>
            <p className="users-email">{item.email}</p>

            <p>{formatDate(item.createdAt)}</p>

            <UserRoleSelect
              userId={item.id}
              role={(item.role ?? "USER") as "USER" | "ADMIN"}
              disabled={item.id === currentUserId}
            />

            <p>{item.booksBorrowed}</p>
            <p>{item.universityId}</p>

            <div>
              {item.universityCard ? (
                <a
                  href={resolveImageUrl(item.universityCard)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="id-card-link"
                >
                  View ID Card
                  <ExternalLink className="size-4" />
                </a>
              ) : (
                <p className="text-light-500">Unavailable</p>
              )}
            </div>

            <form
              action={async () => {
                "use server";
                if (item.id === currentUserId) return;
                await deleteUser(item.id);
              }}
            >
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="reject-btn"
                disabled={item.id === currentUserId}
              >
                <Trash2 className="size-4" />
              </Button>
            </form>
          </div>
        ))}

        {usersList.length === 0 && (
          <div className="all-books-empty">
            <p>No users found.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default page;
