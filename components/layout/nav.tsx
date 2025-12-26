"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import { BookOpen, Info, GlobeIcon } from "lucide-react";

export default function Nav() {
  const pathname = usePathname();
  const blogActive = pathname.startsWith("/blog");
  const aboutActive = pathname.startsWith("/about");

  return (
    <nav>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild variant={blogActive ? "default" : "secondary"}>
          <Link href="/blog" aria-current={blogActive ? "page" : undefined}>
            <BookOpen />
            博客
          </Link>
        </Button>
        <Button asChild variant={aboutActive ? "default" : "secondary"}>
          <Link href="/about" aria-current={aboutActive ? "page" : undefined}>
            <Info />
            关于
          </Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/chat">
            <GlobeIcon />
            聊天
          </Link>
        </Button>
      </div>
    </nav>
  );
}
