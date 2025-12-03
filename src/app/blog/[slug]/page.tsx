import Link from "next/link"
import { notFound } from "next/navigation"

const posts = [
  { slug: "hello-world", title: "你好，世界", body: "这是第一篇示例博文。" },
  { slug: "next-15", title: "Next.js 15 示例", body: "演示 App Router 与动态路由。" },
]

export default async function Page({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug)
  if (!post) notFound()

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">{post.title}</h1>
      <p className="text-gray-700">{post.body}</p>
      <Link href="/blog" className="text-blue-600 hover:underline">返回博客列表</Link>
    </div>
  )
}
