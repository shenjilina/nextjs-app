"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  PenLine,
  Search,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const nav = [
    { label: "新聊天", icon: PenLine, href: "/chat/new" },
    { label: "搜索聊天", icon: Search, href: "/chat/search" },
    // { label: "库", icon: Book, href: "/chat/library" },
    // { label: "项目", icon: FolderOpen, href: "/chat/projects" },
  ];

  const chats = [
    { id: "1", title: "OSError WinError 1114解决...", href: "/chat/c/1" },
    { id: "2", title: "智能知识库项目开发", href: "/chat/c/2" },
  ];

  return (
    <aside className={cn("h-full bg-[#f3f5f6]", collapsed ? "w-16" : "w-64")}>
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between p-3">
          {!collapsed && (
            <div
              className={cn(
                "flex items-center gap-2",
                collapsed && "justify-center w-full"
              )}
            >
              <span className="inline-flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Sparkles className="size-4" />
              </span>
            </div>
          )}
          {!collapsed && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setCollapsed(true)}
            >
              <ChevronLeft />
            </Button>
          )}
          {collapsed && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setCollapsed(false)}
            >
              <ChevronRight />
            </Button>
          )}
        </div>

        <div className="px-3 space-y-2">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Button
                key={item.href}
                asChild
                variant={active ? "default" : "secondary"}
                className={cn(
                  "w-full justify-start",
                  collapsed && "justify-center px-0"
                )}
              >
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </Button>
            );
          })}
        </div>

        {!collapsed && (
          <div className="px-3 pt-4 text-xs text-muted-foreground">
            你的聊天
          </div>
        )}

        <div className="px-3 space-y-1">
          {chats.map((c) => {
            const active = pathname === c.href;
            return (
              <Button
                key={c.id}
                asChild
                variant={active ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  collapsed && "justify-center px-0"
                )}
              >
                <Link href={c.href}>
                  {!collapsed && (
                    <span className="truncate max-w-[180px]">{c.title}</span>
                  )}
                </Link>
              </Button>
            );
          })}
        </div>

        <div className="mt-auto p-3">
          <div
            className={cn(
              "flex items-center gap-3",
              collapsed && "justify-center"
            )}
          >
            <div className="flex items-center gap-2">
              <span className="inline-flex size-7 items-center justify-center rounded-full bg-orange-600 text-white text-xs">
                S
              </span>
              {!collapsed && (
                <div className="leading-tight">
                  <div className="text-sm">shen jilin</div>
                  <div className="text-xs text-muted-foreground">免费版</div>
                </div>
              )}
            </div>
            {!collapsed && (
              <Button size="sm" variant="outline" className="ml-auto">
                升级
              </Button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
