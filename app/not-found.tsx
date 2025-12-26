import Link from "next/link";

export default function NotFound() {
  return (
    <div className="p-6 space-y-3">
      <h1 className="text-2xl font-bold">页面未找到</h1>
      <p className="text-gray-600">你访问的页面不存在或已被移除。</p>
      <Link href="/" className="inline-block text-blue-600 hover:underline">
        返回首页
      </Link>
    </div>
  );
}
