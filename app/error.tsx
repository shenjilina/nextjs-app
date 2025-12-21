'use client'

import { useEffect } from "react"

export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">出现错误</h2>
      <p className="text-gray-600">发生了意外错误，请重试。</p>
      <button onClick={() => reset()} className="px-3 py-2 rounded bg-blue-600 text-white">重试</button>
    </div>
  )
}
