import Link from "next/link";

const posts = [
  { slug: "hello-world", title: "你好，世界" },
  { slug: "next-15", title: "Next.js 15 示例" },
];

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <ul className="list-disc pl-6 space-y-2">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/blog/${p.slug}`}
              className="text-blue-600 hover:underline"
            >
              {p.title}
            </Link>
          </li>
        ))}
      </ul>
      <div>{children}</div>
    </div>
  );
}
