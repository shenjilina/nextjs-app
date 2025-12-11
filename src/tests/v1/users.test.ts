import { GET } from '@/app/api/v1/users/route'
import { NextRequest } from 'next/server'

describe('GET /api/v1/users', () => {
  it('should return a list of users', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/users', {
      method: 'GET',
    })

    const res = await GET(req)
    expect(res.status).toBe(200)
  })
})
