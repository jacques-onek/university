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
  selectedCard?: string;
}

const AccountRequestsFilters = ({ selectedCard }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setFilter = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "all") {
      params.delete("card");
    } else {
      params.set("card", value);
    }

    const next = params.toString();
    router.push(next ? `${pathname}?${next}` : pathname);
  };

  return (
    <div className="requests-filters">
      <Select
        value={selectedCard && selectedCard.length > 0 ? selectedCard : "all"}
        onValueChange={setFilter}
      >
        <SelectTrigger className="books-filter-select">
          <SelectValue placeholder="ID Card" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All ID cards</SelectItem>
          <SelectItem value="with">With ID card</SelectItem>
          <SelectItem value="without">Without ID card</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default AccountRequestsFilters;
