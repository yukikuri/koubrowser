import shipNames from './ship-names.json'
import shipSuffixes from './ship-suffixes.json'
import korean from './ko.json'
import confirmedTerms from './terms.json'

export const supportedLanguages = ['ja', 'ko'] as const
export type Language = (typeof supportedLanguages)[number]
export type MessageValues = readonly (string | number | boolean | null | undefined)[]

/** Older settings and unsupported values always retain the original Japanese UI. */
export function normalizeLanguage(value: unknown): Language {
  return value === 'ko' ? 'ko' : 'ja'
}

const messages: Readonly<Record<string, string>> = korean
const terms: Readonly<Record<string, string>> = confirmedTerms

/** Exact, reviewed names only. Never rewrite server data or guess partial name matches. */
export function translateTerm(language: Language, source: string): string {
  return language === 'ko' && Object.hasOwn(terms, source) ? terms[source] : source
}

/** Japanese source strings are stable keys and the fallback for every new message. */
export function translate(
  language: Language,
  source: string,
  values: MessageValues = [],
  context?: string
): string {
  const key = context ? `${context}::${source}` : source
  let message = source
  if (language === 'ko') {
    if (context && Object.hasOwn(messages, key)) message = messages[key]
    else if (Object.hasOwn(terms, source)) message = terms[source]
    else if (Object.hasOwn(messages, source)) message = messages[source]
  }
  // Resolve terminology before values so user/server values are never interpreted as keys.
  message = message.replace(/\{term:([^{}]+)\}/g, (_, term: string) => translateTerm(language, term))
  return message.replace(/\{(\d+)\}/g, (match, index: string) => {
    const value = values[Number(index)]
    return Number(index) >= values.length ? match : String(value)
  })
}

// Ship base names and remodel suffixes are composed only in ship-name display contexts.
const names: Readonly<Record<string, string>> = shipNames
const suffixes: Readonly<Record<string, string>> = shipSuffixes
const nameKeys = Object.keys(names).sort((a, b) => b.length - a.length)
const suffixKeys = Object.keys(suffixes).sort((a, b) => b.length - a.length)

export function translateShipName(language: Language, source: string): string {
  if (language !== 'ko') return source
  const exact = translateTerm(language, source)
  if (exact !== source) return exact
  const base = nameKeys.find((name) => source.startsWith(name))
  if (!base) return source
  let rest = source.slice(base.length)
  let result = Object.hasOwn(terms, base) ? terms[base] : names[base]
  while (rest) {
    const suffix = suffixKeys.find((value) => rest.startsWith(value))
    if (!suffix) return source
    result += suffixes[suffix]
    rest = rest.slice(suffix.length)
  }
  return result
}
