import { readonly, ref } from 'vue'
import { normalizeLanguage, translate, translateTerm, translateShipName, type MessageValues } from '@common/i18n'
import { startTextFit } from '@renderer/fit-text'

const currentLanguage = ref(normalizeLanguage(undefined))
export const language = readonly(currentLanguage)

/** Called when opening a window. Language changes in Settings apply after restart. */
export function initializeLanguage(value: unknown): void {
  currentLanguage.value = normalizeLanguage(value)
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
  return translate(currentLanguage.value, source, values, context)
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
