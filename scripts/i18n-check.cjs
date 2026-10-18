const fs = require('node:fs')
const path = require('node:path')
const root = path.resolve(__dirname, '..')
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'))
const ko = read('src/common/i18n/ko.json')
const terms = read('src/common/i18n/terminology.json')
const runtime = read('src/common/i18n/terms.json')
const seen = new Set()
const errors = []
const placeholders = (text) => [...text.matchAll(/\{(\d+)\}/g)].map((match) => match[1]).sort().join(',')
for (const [source, text] of Object.entries(ko)) {
  if (!text || placeholders(source) !== placeholders(text)) errors.push(`Invalid message parameters: ${source}`)
}
for (const term of terms) {
  if (seen.has(term.source)) errors.push(`Duplicate term: ${term.source}`)
  seen.add(term.source)
  if (!['review', 'confirmed'].includes(term.status)) errors.push(`Invalid status: ${term.source}`)
  if (term.status === 'confirmed') {
    if (!term.korean || !['namuwiki', 'translation', 'user'].includes(term.basis)) errors.push(`Missing confirmation basis: ${term.source}`)
    if (term.kind !== 'suffix' && runtime[term.source] !== term.korean) errors.push(`Stale runtime term: ${term.source}`)
  } else if (Object.hasOwn(runtime, term.source)) errors.push(`Unconfirmed term in runtime: ${term.source}`)
}
for (const source of Object.keys(runtime)) if (!seen.has(source)) errors.push(`Runtime term without glossary: ${source}`)
for (const text of Object.values(ko)) {
  for (const match of text.matchAll(/\{term:([^{}]+)\}/g)) if (!seen.has(match[1])) errors.push(`Missing terminology reference: ${match[1]}`)
}
// Every UI source literal must be translated or explicitly represented in the review queue.
const inventory = read('docs/localization/ja-inventory.json')
for (const entry of inventory) {
  if (entry.uses.some((use) => use.file.startsWith('src/renderer/')) && !Object.hasOwn(ko, entry.source) && !seen.has(entry.source)) errors.push(`Untracked UI string: ${entry.source}`)
}
if (errors.length) { console.error(errors.slice(0,20).join('\n'), errors.length > 20 ? `... ${errors.length} errors total` : ''); process.exitCode = 1 }
else console.log(`Localization check passed: ${Object.keys(ko).length} UI messages, ${Object.keys(runtime).length} confirmed terms, ${terms.filter((term) => term.status !== 'confirmed').length} explicit fallbacks.`)
