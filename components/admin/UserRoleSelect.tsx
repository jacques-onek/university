"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateUserRole } from "@/lib/admin/actions/user";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import React, { useTransition } from "react";

interface Props {
  userId: string;
  role: "USER" | "ADMIN";
  disabled?: boolean;
}

const UserRoleSelect = ({ userId, role, disabled }: Props) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const currentRoleClass = role === "ADMIN" ? "admin-role-chip" : "user-role-chip";

  const onRoleChange = (nextRole: "USER" | "ADMIN") => {
    startTransition(async () => {
      await updateUserRole(userId, nextRole);
      router.refresh();
    });
  };

  return (
    <Select
      value={role}
      onValueChange={onRoleChange}
      disabled={disabled || isPending}
    >
      <SelectTrigger className={cn("user-role-trigger", currentRoleClass)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="borrow-status-content">
        <SelectItem value="USER" className="user-role-chip">
          User
        </SelectItem>
        <SelectItem value="ADMIN" className="admin-role-chip">
          Admin
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

export default UserRoleSelect;

