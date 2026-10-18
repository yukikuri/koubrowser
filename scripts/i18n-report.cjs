const fs = require('node:fs')
const path = require('node:path')
const root = path.resolve(__dirname, '..')
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'))
const write = (file, value) => fs.writeFileSync(path.join(root, file), value)
const inventory = read('docs/localization/ja-inventory.json')
const messages = read('src/common/i18n/ko.json')
const previous = read('src/common/i18n/terminology.json')
const bySource = new Map(previous.map((entry) => [entry.source, entry]))
const usesBySource = new Map(inventory.map((entry) => [entry.source, entry.uses]))
const domainFile = /src\/common\/(locale|kcs|kcsetc|enemy_etc|area_name|mission|kcquest|kcquest_formatter)\.ts|^resources\//
const sources = new Set(inventory.filter((entry) =>
  !Object.hasOwn(messages, entry.source) && entry.uses.some((use) => domainFile.test(use.file) || use.file.startsWith('src/renderer/'))
).map((entry) => entry.source))
for (const message of Object.values(messages)) {
  for (const match of message.matchAll(/\{term:([^{}]+)\}/g)) sources.add(match[1])
}
for (const entry of previous) if (entry.status === 'confirmed' || !Object.hasOwn(messages, entry.source)) sources.add(entry.source)

const kinds = {
  system: '게임 용어',
  map: '해역·이벤트',
  expedition: '원정',
  ship: '함선',
  suffix: '함선 이름 접미사',
  abyssal: '심해서함',
  equipment: '장비·아이템',
  quest: '임무 제목·설명',
  ui: '화면 문구'
}
const glossary = [...sources].sort((a, b) => a.localeCompare(b, 'ja')).map((source) => {
  const old = bySource.get(source) ?? {}
  return {
    source,
    korean: old.korean ?? null,
    kind: old.kind ?? 'ui',
    status: old.status ?? 'review',
    ...(old.basis ? { basis: old.basis } : {}),
    ...(old.note ? { note: old.note } : {}),
    uses: usesBySource.get(source) ?? old.uses ?? []
  }
})
write('src/common/i18n/terminology.json', JSON.stringify(glossary, null, 2) + '\n')

const confirmed = glossary.filter((entry) => entry.status === 'confirmed' && entry.korean)
const pending = glossary.filter((entry) => !confirmed.includes(entry))
const toMap = (list) => JSON.stringify(Object.fromEntries(list.map((entry) => [entry.source, entry.korean])), null, 2) + '\n'
write('src/common/i18n/terms.json', toMap(confirmed.filter((entry) => entry.kind !== 'suffix')))
// Base names and suffixes for composing remodel names such as 金剛改二.
write('src/common/i18n/ship-names.json', toMap(confirmed.filter((entry) => entry.kind === 'ship' || entry.kind === 'abyssal')))
write('src/common/i18n/ship-suffixes.json', JSON.stringify(Object.fromEntries(confirmed.filter((entry) => entry.kind === 'suffix')
  .map((entry) => [entry.source.replace(/^suffix::/, ''), entry.korean])), null, 2) + '\n')

const esc = (text) => String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('|', '\\|').replace(/\r?\n/g, ' ↵ ')
const name = (entry) => entry.source.replace(/^suffix::/, '')
const where = (entry) => [...new Set(entry.uses.map((use) => `\`${use.file.replace(/^src\//, '')}\``))].join(', ') || '게임 데이터'
const section = (list, kind, header, line) => {
  const rows = list.filter((entry) => entry.kind === kind)
  return rows.length ? `\n## ${kinds[kind]} (${rows.length})\n\n${header}\n${rows.map(line).join('\n')}\n` : ''
}

const listed = Object.keys(kinds).filter((kind) => kind !== 'quest' && kind !== 'ui')
write('KOREAN_GLOSSARY.md', `# 한국어 용어집

한국어 표시에 사용하는 게임 용어와 고유명사입니다. 나무위키 표기를 기준으로 합니다.
나무위키에서 확인하지 못한 항목은 일본어로 표시하며 [KOREAN_REVIEW.md](KOREAN_REVIEW.md)에 있습니다.
` + listed.map((kind) => section(confirmed, kind, '| 일본어 | 한국어 |\n| --- | --- |',
  (entry) => `| ${esc(name(entry))} | ${esc(entry.korean)} |`)).join(''))

const pendingQuests = pending.filter((entry) => entry.kind === 'quest').length
const questSummary = pendingQuests ? `\n## ${kinds.quest} (${pendingQuests})\n\n게임에서 받는 임무 제목·설명은 일본어로 표시합니다. 목록은 \`terminology.json\`의 \`kind: "quest"\` 항목입니다.\n` : ''
const translated = confirmed.filter((entry) => entry.basis === 'translation' && entry.note)
write('KOREAN_REVIEW.md', `# 한국어 검수 목록

1. 나무위키에서 표기를 확인하지 못해 관례에 따라 번역한 항목(${translated.length}개)
2. 아직 일본어로 표시하는 항목(${pending.length}개)

표기를 정하면 \`src/common/i18n/terminology.json\`의 해당 항목에 \`korean\`, \`status: "confirmed"\`, \`basis: "user"\`를 입력하고(비고 \`note\`는 삭제) \`npm run i18n:report\`와 \`npm run i18n:check\`를 실행합니다.

# 1. 관례에 따라 번역한 항목
` + Object.keys(kinds).map((kind) => section(translated, kind, '| 일본어 | 한국어 |\n| --- | --- |',
  (entry) => `| ${esc(name(entry))} | ${esc(entry.korean)} |`)).join('') + `
# 2. 일본어로 표시하는 항목
` + Object.keys(kinds).filter((kind) => kind !== 'quest').map((kind) => section(pending, kind, '| 일본어 | 사용 위치 | 비고 |\n| --- | --- | --- |',
  (entry) => `| ${esc(name(entry))} | ${where(entry)} | ${esc(entry.note ?? '')} |`)).join('') + questSummary)
console.log(`Glossary: ${confirmed.length} confirmed, ${pending.length} kept in Japanese; ${Object.keys(messages).length} UI messages.`)
