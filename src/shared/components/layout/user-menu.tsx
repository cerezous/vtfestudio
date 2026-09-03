"use client";

import { LogOut, UserRound } from "lucide-react";

import { signOutAction } from "@/modules/auth/actions";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { ROLE_LABELS } from "@/shared/lib/constants";
import { getInitials } from "@/shared/lib/utils";

export function UserMenu({
  fullName,
  email,
  role,
}: {
  fullName: string;
  email: string;
  role: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto rounded-full p-1 pr-2">
          <Avatar size="sm">
            <AvatarFallback>{getInitials(fullName)}</AvatarFallback>
          </Avatar>
          <span className="hidden text-left text-sm font-medium md:block">
            {fullName}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 rounded-2xl">
        <DropdownMenuLabel className="space-y-1">
          <p>{fullName}</p>
          <p className="text-xs font-normal text-muted-foreground">{email}</p>
          <p className="text-xs font-normal text-muted-foreground">
            {ROLE_LABELS[role] ?? role}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <UserRound className="size-4" />
          Perfil
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            void signOutAction();
          }}
        >
          <LogOut className="size-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
