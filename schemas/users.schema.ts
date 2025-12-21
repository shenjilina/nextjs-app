//  Zod 校验规则
import { z } from 'zod'
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  plan: z.enum(['free', 'pro']),
  language: z.enum(['zh', 'en']),
  theme: z.enum(['system', 'light', 'dark']),
})