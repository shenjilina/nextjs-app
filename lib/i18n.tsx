"use client"

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react"
import zhDefault from "@/locales/zh.json"
import enDefault from "@/locales/en.json"

export type Lang = "zh" | "en"
export type Dict = Record<string, string>

type I18nCtx = {
  lang: Lang
  t: (key: keyof Dict | string) => string
  setLanguage: (lang: Lang) => void
}

const I18nContext = createContext<I18nCtx | null>(null)

// 获取初始语言（SSR 默认 zh，CSR 读取 localStorage）
function getInitialLang(): Lang {
  // 为避免 SSR/CSR 初始渲染不一致导致水合失败，这里始终返回服务器默认语言
  // 客户端在挂载后再读取本地偏好并更新
  return "zh"
}

// 加载指定语言的资源文件（动态导入）
async function loadLocale(lang: Lang): Promise<Dict> {
  try {
    const mod = await import(`@/locales/${lang}.json`)
    return (mod.default ?? {}) as Dict
  } catch (err) {
    // 保持兼容，不抛出到上层；记录错误并返回空字典
    console.error("[i18n] failed to load locale:", lang, err)
    return {}
  }
}

// 创建翻译函数
function createTranslator(dict: Dict) {
  return (key: string) => dict[key] ?? key
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const initialLang = getInitialLang()
  const initialDict: Dict = initialLang === "en" ? enDefault : zhDefault

  const [lang, setLang] = useState<Lang>(initialLang)
  const [dict, setDict] = useState<Dict>(initialDict)

  // 首次挂载：读取并应用用户偏好语言（如果存在）
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("app-lang") as Lang | null
      if (saved === "en" || saved === "zh") {
        setLang(saved)
      }
    } catch (err) {
      console.error("[i18n] failed to read saved language", err)
    }
  }, [])

  // 变更语言后持久化（跳过首次渲染，避免覆盖用户偏好）
  const mountedRef = useRef(false)
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      return
    }
    try {
      window.localStorage.setItem("app-lang", lang)
    } catch (err) {
      console.error("[i18n] failed to persist language", err)
    }
  }, [lang])

  // 语言变更时动态加载资源
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const next = await loadLocale(lang)
      if (!cancelled) setDict(next)
    })()
    return () => {
      cancelled = true
    }
  }, [lang])

  const value = useMemo<I18nCtx>(() => {
    const t = createTranslator(dict)
    return { lang, t, setLanguage: setLang }
  }, [lang, dict])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error("I18nProvider missing")
  return ctx
}
