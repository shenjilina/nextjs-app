import { NextRequest, NextResponse } from 'next/server'
import { User } from '@/types/users'
import { successResponse, validationError } from '@/lib/api/response'
import { userSchema } from '@/schemas/users.schema'
import { logger } from '@/lib/logger'

const USERS: User[] = [
  {
    id: 'u_1',
    name: 'Shen Jilin',
    email: 'shen@example.com',
    plan: 'free',
    language: 'zh',
    theme: 'light',
  },
  {
    id: 'u_2',
    name: 'Alice',
    email: 'alice@example.com',
    plan: 'pro',
    language: 'en',
    theme: 'dark',
  },
]

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  if (id) {
    const user = USERS.find((u) => u.id === id)
    logger.info('GET user request', user)

    if (!user) return NextResponse.json({ error: 'not_found' }, { status: 404 })
    return NextResponse.json(user, {
      headers: {
        'cache-control': 'private, max-age=0, must-revalidate',
      },
    })
  }
  return NextResponse.json(USERS, {
    headers: {
      'cache-control': 'private, max-age=0, must-revalidate',
    },
  })
}

export async function POST(request: NextRequest) {
  // 📥 解析请求体
  const body = await request.json()
  logger.info('POST create user request', body)
  const result = userSchema.safeParse(body.query)
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors
    return validationError(errors)
  }
  // 操作数据库， TODO
  const user = result.data
  USERS.push(user)
  // ✅ 成功响应
  return successResponse(USERS, 201)
}
