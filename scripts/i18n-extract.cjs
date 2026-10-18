// Inventory Japanese literals without executing application or game code.
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
const { parse } = require('@vue/compiler-sfc')
const dom = require('@vue/compiler-dom')
const root = path.resolve(__dirname, '..')
const entries = new Map()
const japanese = /[\u3040-\u30ff\u3400-\u9fff]/
function add(source, file, line, kind) {
  if (!japanese.test(source)) return
  if (!entries.has(source)) entries.set(source, { source, uses: [] })
  entries.get(source).uses.push({ file, line, kind })
}
function script(source, file, offset = 0) {
  if (!source) return
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true)
  function visit(node) {
    const line = () => offset + ast.getLineAndCharacterOfPosition(node.getStart()).line + 1
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      add(node.text, file, line(), 'literal')
    } else if (ts.isTemplateExpression(node)) {
      let text = node.head.text
      node.templateSpans.forEach((span, i) => { text += `{${i}}${span.literal.text}` })
      add(text, file, line(), 'template')
    }
    ts.forEachChild(node, visit)
  }
  visit(ast)
}
function walk(dir) {
  for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const file = `${dir}/${entry.name}`
    if (entry.isDirectory()) {
      if (!/(__tests__|generated|orval|assets|\/i18n)$/.test(file)) walk(file)
      continue
    }
    if (!/\.(ts|vue|json)$/.test(file)) continue
    const source = fs.readFileSync(path.join(root, file), 'utf8')
    if (file.endsWith('.vue')) {
      const descriptor = parse(source).descriptor
      for (const block of [descriptor.script, descriptor.scriptSetup]) {
        if (block) script(block.content, file, block.loc.start.line - 1)
      }
      const template = descriptor.template
      if (template) {
        function visit(node) {
          const line = node.loc.start.line + template.loc.start.line - 1
          if (node.type === 2) add(node.content.trim(), file, line, 'text')
          if (node.type === 5) script(node.content.content, file, line - 1)
          for (const prop of node.props ?? []) {
            if (prop.type === 6 && prop.value) add(prop.value.content, file, line, 'attribute')
            if (prop.type === 7 && prop.exp) script(prop.exp.content, file, line - 1)
          }
          for (const child of node.children ?? []) visit(child)
        }
        visit(dom.parse(template.content))
      }
    } else if (file.endsWith('.json')) {
      function visit(value) {
        if (typeof value === 'string') add(value, file, 0, 'data')
        else if (value && typeof value === 'object') Object.values(value).forEach(visit)
      }
      visit(JSON.parse(source))
    } else script(source, file)
  }
}
walk('src')
walk('resources')
const result = [...entries.values()].sort((a, b) => a.source.localeCompare(b.source, 'ja'))
fs.writeFileSync(path.join(root, 'docs/localization/ja-inventory.json'), JSON.stringify(result, null, 2) + '\n')
console.log(`Inventoried ${result.length} Japanese source strings (includes internal diagnostics).`)
