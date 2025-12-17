"use client";

import { useState, useEffect } from "react";
import { useAppSelector } from "@/types/redux";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { UserRound } from "lucide-react";
import { User } from "@/types/users";
import useFetch from "@/lib/hooks/useFetch";
import UserModalDialog from "./UserModalDialog";
import LoginModalDialog from "./LoginModelDialog";

type UserLoginProps = {
  collapsed: boolean;
};

export default function UserLogin({ collapsed }: UserLoginProps) {
  const { t } = useI18n();
  const { get } = useFetch();
  const userStore = useAppSelector((s) => s.user.userInfo);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    get("/api/v1/users", { query: { id: "u_1" } })
      .then((data) => {
        setUser(data as User);
      })
      .catch(() => {});
  }, []);

  const initial = (user?.name?.[0] ?? "S").toUpperCase();
  const planLabel = user?.plan ? t(user?.plan) : "free";

  const [open, setOpen] = useState(false);
  const handleUserInfo = () => {
    setOpen(true);
  };
  return (
    <>
      {userStore ? (
        <div className={cn("flex items-center gap-3 cursor-pointer hover:bg-muted p-3", collapsed && "justify-center")} onClick={() => handleUserInfo()}>
          <div className="flex items-center gap-2">
            <span className="inline-flex size-7 items-center justify-center rounded-full bg-orange-600 text-white text-xs">{initial}</span>
            {!collapsed && (
              <div className="leading-tight">
                <span className="text-sm">{user?.name ?? "..."}</span>
                <div className="text-xs text-muted-foreground">{planLabel}</div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          className={cn("group flex items-center gap-3 cursor-pointer p-3 hover:bg-muted transition-colors", collapsed && "justify-center")}
          onClick={() => setOpen(true)}
        >
          <span className="inline-flex size-7 items-center justify-center rounded-full bg-sky-500 text-white">
            <UserRound className="size-4" />
          </span>
          {!collapsed && (
            <div className="flex flex-1 items-center justify-between">
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-medium text-foreground">{t("login")}</span>
                <span className="text-xs text-muted-foreground">{t("loginDescription")}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {userStore ? (
        <UserModalDialog open={open} onOpenChange={setOpen} user={userStore} initial={initial} />
      ) : (
        <LoginModalDialog open={open} onOpenChange={setOpen} />
      )}
    </>
  );
}
