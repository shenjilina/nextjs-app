import Link from "next/link";
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  if (error) {
    throw new Error("Home page error");
  }

  return (
    <div className="min-h-screen p-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="mx-auto max-w-3xl text-center space-y-4">
        <h1 className="text-3xl sm:text-4xl font-bold">欢迎来到示例站点</h1>
        <p className="text-gray-600">
          使用按钮快速跳转到各页面，体验 App Router。
        </p>
        <Link
          href="/chat"
          className="inline-block px-6 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition-colors"
        >
          跳转到聊天页面
        </Link>
      </div>
    </div>
  );
}
