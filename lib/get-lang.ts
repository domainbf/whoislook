import { cookies } from 'next/headers'
import { DEFAULT_LANG, LANGS, type Lang } from './i18n'

/** 在服务端组件中读取当前语言（来自 cookie，默认中文） */
export async function getLang(): Promise<Lang> {
  const store = await cookies()
  const v = store.get('lang')?.value as Lang | undefined
  return v && (LANGS as string[]).includes(v) ? v : DEFAULT_LANG
}
