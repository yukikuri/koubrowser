import { createI18n } from 'vue-i18n'
import jaKey from '@common/i18n/ja-key.json'
import ko from '@common/i18n/ko.json'
import koKey from '@common/i18n/ko-key.json'
import { readonly, ref } from 'vue'
import { 
  normalizeLanguage, 
  translate, 
  translateTerm, 
  translateShipName, 
  type MessageValues
} from '@common/i18n'
import { startTextFit } from '@renderer/fit-text'

const currentLanguage = ref(normalizeLanguage(undefined))
export const language = readonly(currentLanguage)

/** Apply the display language when opening a window or receiving a language change. */
export function initializeLanguage(value: unknown): void {
  currentLanguage.value = normalizeLanguage(value)

  // todo set lang in renderer main.ts
  i18n.global.locale.value = currentLanguage.value
  
  if (typeof document === 'undefined') return
  document.documentElement.lang = currentLanguage.value
  for (const [name, text] of Object.entries(styleTexts())) {
    document.documentElement.style.setProperty(name, JSON.stringify(text))
  }
  if (currentLanguage.value === 'ko') startTextFit()
}

/** Texts that stylesheets show with `content: var(...)`. */
function styleTexts(): Record<string, string> {
  return {
    '--text-sortie': t('出撃中'),
    '--text-escaped': t('退避'),
    '--text-mission-failed': t('失敗'),
    '--text-mission-succeeded': t('成功'),
    '--text-mission-succeeded2': t('大成功'),
    '--text-titlebar-ship': t('艦'),
    '--text-titlebar-slotitem': t('装')
  }
}

export function t(source: string, values?: MessageValues, context?: string): string {

  // vue i18n trans
  const key = context ? `${context}::${source}` : source
  try {
    const ret = i18n.global.t(key, [...(values ?? [])])
    console.log(`i18n trans key: ${key}, ret: ${ret}`)
    return ret
  } catch (e) {
    console.error(`i18n translation failed for key: ${context ? `${context}::${source}` : source}`, e)
    
    // default trans
    const ret = translate(currentLanguage.value, source, values, context)
    console.log(`default trans key:${key} ret: ${ret}`)
    return ret
  }
}

/** For game-provided names: deliberately separate from ordinary interface messages. */
export function gameText(source: string | null | undefined): string {
  return translateTerm(currentLanguage.value, source ?? '')
}

export function shipText(source: string | null | undefined): string {
  return translateShipName(currentLanguage.value, source ?? '')
}

/** Localize the app's generated quest-counter markup, never the game webview. */
export function localizeProgressHtml(source: string): string {
  if (currentLanguage.value !== 'ko' || !source) return source
  const fragment = document.createElement('template')
  fragment.innerHTML = source
  const walker = document.createTreeWalker(fragment.content, NodeFilter.SHOW_TEXT)
  let node = walker.nextNode()
  while (node) {
    const text = node.nodeValue ?? ''
    const count = /^(.*?)(\d+\/\d+)(.*)$/.exec(text)
    const state = /^(.*?)(済|未)$/.exec(text) // e.g. "2-5S：済"
    // Korean labels use a half-width colon; untranslated Japanese stays as it is.
    const label = (value: string): string => {
      const text = t(value)
      return /[\u3040-\u30ff\u3400-\u9fff]/.test(text) ? text : text.replace(/：/g, ':')
    }
    node.nodeValue = count
      ? label(count[1]) + count[2] + t(count[3])
      : state
        ? label(state[1]) + t(state[2], [], 'progress')
        : t(text)
    node = walker.nextNode()
  }
  return fragment.innerHTML
}

function messageResolver(obj: unknown, path: string): string | null {

  console.log(`messageResolver called with path: ${path}, obj:`, obj)

  if (typeof obj !== 'object' || obj === null) return null

  // まず、キー全体の完全一致で探す
  if (Object.hasOwn(obj, path)) {
    const value = (obj as Record<string, unknown>)[path]
    return typeof value === 'string' ? value : null
  }

  // なければ、ドット区切りで階層をたどる
  let value: unknown = obj

  for (const key of path.split('.')) {
    if (
      typeof value !== 'object' ||
      value === null ||
      !Object.hasOwn(value, key)
    ) {
      return null
    }

    value = (value as Record<string, unknown>)[key]
  }

  return typeof value === 'string' ? value : null
}

export const i18n = createI18n({
  legacy: false,
  locale: 'ja',
  fallbackLocale: 'ja',
  messageResolver,
  messages: {
    ja: jaKey,
    ko: {
      ...ko,
      ...koKey
    }
  }
})
