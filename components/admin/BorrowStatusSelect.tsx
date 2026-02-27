"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateBorrowRecordStatus } from "@/lib/admin/actions/request";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import React, { useTransition } from "react";

interface Props {
  recordId: string;
  status: "BORROWED" | "RETURNED";
  isLate: boolean;
}

const BorrowStatusSelect = ({ recordId, status, isLate }: Props) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const value = isLate ? "LATE_RETURN" : status;
  const statusClass =
    value === "RETURNED" ? "returned-chip" : value === "LATE_RETURN" ? "late-chip" : "borrowed-chip";

  const onValueChange = (next: "BORROWED" | "RETURNED" | "LATE_RETURN") => {
    if (next === "LATE_RETURN") return;

    startTransition(async () => {
      await updateBorrowRecordStatus(recordId, next);
      router.refresh();
    });
  };

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={isPending}
    >
      <SelectTrigger className={cn("borrow-status-trigger", statusClass)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="borrow-status-content">
        <SelectItem value="BORROWED" className="borrowed-chip">
          Borrowed
        </SelectItem>
        <SelectItem value="RETURNED" className="returned-chip">
          Returned
        </SelectItem>
        <SelectItem value="LATE_RETURN" className="late-chip" disabled>
          Late Return
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

export default BorrowStatusSelect;
