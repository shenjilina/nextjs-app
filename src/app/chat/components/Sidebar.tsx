'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n'
import useFetch from '@/hooks/useFetch'
import { PenLine, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'
import ModalDialog from './ModalDialog'

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [open, setOpen] = useState(false)
  const { t } = useI18n()
  const { get, post } = useFetch()
  const [user, setUser] = useState<{
    id: string
    name: string
    email: string
    plan: 'free' | 'pro'
    language: 'zh' | 'en'
    theme: 'system' | 'light' | 'dark'
  } | null>(null)

  useEffect(() => {
    get('/api/v1/users', { query: { id: 'u_1' } })
      .then((data) => {
        if (Array.isArray(data) && data?.length) {
          setUser(data[0] as any)
        }
      })
      .catch(() => {})
    post('/api/v1/users', {
      query: {
        email: 'shen@example.com',
        id: 'u_1',
        language: 'zh',
        name: 'Shen Jilin',
        plan: 'free',
        theme: 'light',
      },
    })
      .then((data) => {
        console.log(data, 'post')
      })
      .catch(() => {})
  }, [])

  const initial = (user?.name?.[0] ?? 'S').toUpperCase()
  const planLabel = user?.plan === 'free' ? t('free') : 'Pro'

  // Memoize navigation items to avoid unnecessary re-renders
  const nav = useMemo(() => [{ label: t('newChat'), icon: PenLine, href: '/chat' }], [t])

  // Sample chat list; titles are user-generated and not translated
  const chats = useMemo(
    () => [
      { id: '1', title: 'OSError WinError 1114解决...', href: '/chat/c1' },
      { id: '2', title: '智能知识库项目开发', href: '/chat/c2' },
    ],
    [],
  )

  const handleUserInfo = () => {
    setOpen(true)
  }

  return (
    <>
      <aside className={cn('h-full bg-background', collapsed ? 'w-16' : 'w-64')}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-3">
            {!collapsed && (
              <div className={cn('flex items-center gap-2', collapsed && 'justify-center w-full')}>
                <span className="inline-flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Sparkles className="size-4" />
                </span>
              </div>
            )}
            {!collapsed && (
              <Button size="icon" variant="ghost" onClick={() => setCollapsed(true)}>
                <ChevronLeft />
              </Button>
            )}
            {collapsed && (
              <Button size="icon" variant="ghost" onClick={() => setCollapsed(false)}>
                <ChevronRight />
              </Button>
            )}
          </div>

          <div className="px-3 space-y-2">
            {nav.map((item) => {
              const Icon = item.icon
              const active = pathname.startsWith(item.href)
              return (
                <Button
                  key={item.href}
                  asChild
                  variant="secondary"
                  className={cn('w-full justify-start', collapsed && 'justify-center px-0')}
                >
                  <Link href={item.href} aria-current={active ? 'page' : undefined}>
                    <Icon />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </Button>
              )
            })}
          </div>

          {!collapsed && (
            <div className="px-3 pt-4 text-xs text-muted-foreground">{t('yourChats')}</div>
          )}

          <div className="px-3 space-y-1">
            {chats.map((c) => {
              const active = pathname === c.href
              return (
                <Button
                  key={c.id}
                  asChild
                  variant={active ? 'secondary' : 'ghost'}
                  className={cn('w-full justify-start', collapsed && 'justify-center px-0')}
                >
                  <Link href={c.href}>
                    {!collapsed && <span className="truncate max-w-[180px]">{c.title}</span>}
                  </Link>
                </Button>
              )
            })}
          </div>

          <div className="mt-auto">
            <div
              className={cn(
                'flex items-center gap-3 cursor-pointer hover:bg-muted p-3',
                collapsed && 'justify-center',
              )}
              onClick={() => handleUserInfo()}
            >
              <div className="flex items-center gap-2">
                <span className="inline-flex size-7 items-center justify-center rounded-full bg-orange-600 text-white text-xs">
                  {initial}
                </span>
                {!collapsed && (
                  <div className="leading-tight">
                    <span className="text-sm">{user?.name ?? '...'}</span>
                    <div className="text-xs text-muted-foreground">{planLabel}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>
      <ModalDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
