import { NextResponse } from "next/server"

type User = {
  id: string
  name: string
  email: string
  plan: "free" | "pro"
  language: "zh" | "en"
  theme: "system" | "light" | "dark"
}

const USERS: User[] = [
  {
    id: "u_1",
    name: "Shen Jilin",
    email: "shen@example.com",
    plan: "free",
    language: "zh",
    theme: "light",
  },
  {
    id: "u_2",
    name: "Alice",
    email: "alice@example.com",
    plan: "pro",
    language: "en",
    theme: "dark",
  },
]

export async function GET(req: Request) {
  const url = new URL(req.url)
  const id = url.searchParams.get("id")
  if (id) {
    const user = USERS.find((u) => u.id === id)
    if (!user) return NextResponse.json({ error: "not_found" }, { status: 404 })
    return NextResponse.json(user, {
      headers: {
        "cache-control": "private, max-age=0, must-revalidate",
      },
    })
  }
  return NextResponse.json(USERS, {
    headers: {
      "cache-control": "private, max-age=0, must-revalidate",
    },
  })
}

export const dynamic = "force-static"
