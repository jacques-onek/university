"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";

interface Props {
  selectedStatus?: string;
  selectedDue?: string;
}

const BorrowRequestsFilters = ({ selectedStatus, selectedDue }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setFilter = (key: "status" | "due", value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    const next = params.toString();
    router.push(next ? `${pathname}?${next}` : pathname);
  };

  return (
    <div className="requests-filters">
      <Select
        value={selectedStatus && selectedStatus.length > 0 ? selectedStatus : "all"}
        onValueChange={(value) => setFilter("status", value)}
      >
        <SelectTrigger className="books-filter-select">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All status</SelectItem>
          <SelectItem value="borrowed">Borrowed</SelectItem>
          <SelectItem value="returned">Returned</SelectItem>
          <SelectItem value="late">Late return</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={selectedDue && selectedDue.length > 0 ? selectedDue : "all"}
        onValueChange={(value) => setFilter("due", value)}
      >
        <SelectTrigger className="books-filter-select">
          <SelectValue placeholder="Due" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All due dates</SelectItem>
          <SelectItem value="overdue">Overdue</SelectItem>
          <SelectItem value="on_time">On time</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default BorrowRequestsFilters;
