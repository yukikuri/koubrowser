// Verify localization does not change the upstream Vue template structure in Japanese.
const fs = require('node:fs')
const { execFileSync } = require('node:child_process')
const { parse } = require('@vue/compiler-sfc')
const dom = require('@vue/compiler-dom')
const ts = require('typescript')
const ref = process.argv[2] || 'fe80aa3'
function expression(source) {
  const ast = ts.createSourceFile('expression.ts', `(${source})`, ts.ScriptTarget.Latest, true)
  function node(n) {
    if (ts.isParenthesizedExpression(n)) return node(n.expression)
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) return ['string', n.text]
    if (ts.isIdentifier(n)) return ['identifier', n.text]
    if (ts.isNumericLiteral(n)) return ['number', n.text]
    if (ts.isTemplateExpression(n)) {
      let key = n.head.text
      n.templateSpans.forEach((span, i) => { key += `{${i}}${span.literal.text}` })
      return ['template', key, n.templateSpans.map((span) => node(span.expression))]
    }
    if (ts.isCallExpression(n) && ts.isIdentifier(n.expression)) {
      if (['gameText', 'shipText'].includes(n.expression.text)) return node(n.arguments[0])
      if (n.expression.text === 't' && ts.isStringLiteral(n.arguments[0])) {
        const key = n.arguments[0].text
        const values = n.arguments[1]
        return values && ts.isArrayLiteralExpression(values) && values.elements.length
          ? ['template', key, values.elements.map(node)] : ['string', key]
      }
    }
    const children = []
    ts.forEachChild(n, (child) => { children.push(node(child)) })
    return [n.kind, ...children]
  }
  return node(ast.statements[0].expression)
}
function canonicalTemplate(source, allowLanguageControl) {
  const descriptor = parse(source).descriptor
  function children(list) {
    const result = []
    for (const child of list) {
      const value = node(child)
      if (!value) continue
      if (value[0] === 'text' && result.at(-1)?.[0] === 'text') result.at(-1)[1] += value[1]
      else result.push(value)
    }
    return result.filter((value) => value[0] !== 'text' || value[1].trim()).map((value) => value[0] === 'text' ? ['text', value[1].replace(/\s+/g, ' ')] : value)
  }
  function isLanguageControl(n) {
    if (!allowLanguageControl || n.type !== 1) return false
    if (n.props.some((p) => p.type === 6 && p.name === 'class' && p.value?.content === 'section-title') && n.children.some((c) => c.type === 5 && JSON.stringify(expression(c.content.content)) === JSON.stringify(['string', '言語']))) return true
    function containsLanguageSelector(n) {
      return n.type === 1 && (n.props.some((p) => p.type === 6 && p.name === 'id' && p.value?.content === 'interface-language') || n.children.some(containsLanguageSelector))
    }
    return n.props.some((p) => p.type === 6 && p.name === 'class' && p.value?.content === 'option-row option-row-vertical') && containsLanguageSelector(n)
  }
  function node(n) {
    if (n.type === 3 || isLanguageControl(n)) return null
    if (n.type === 0) return ['root', children(n.children)]
    if (n.type === 2) return ['text', n.content]
    if (n.type === 5) {
      const exp = expression(n.content.content)
      return exp[0] === 'string' ? ['text', exp[1]] : ['expression', exp]
    }
    if (n.type === 1) return ['element', n.tag, n.props.map((p) => {
      if (p.type === 6) return ['attribute', p.name, p.value?.content ?? '']
      const exp = p.exp ? expression(p.exp.content) : null
      if (p.name === 'bind' && exp?.[0] === 'string' && !p.modifiers.length) return ['attribute', p.arg?.content, exp[1]]
      return ['directive', p.name, p.arg?.content, p.modifiers.map((m) => m.content), exp]
    }), children(n.children)]
    return [n.type]
  }
  return { template: node(dom.parse(descriptor.template?.content ?? '')), styles: descriptor.styles.map((s) => s.content) }
}
const files = execFileSync('git', ['diff', '--name-only', ref], { encoding: 'utf8' }).trim().split('\n').filter((file) => file.endsWith('.vue'))
const failed = []
for (const file of files) {
  const original = execFileSync('git', ['show', `${ref}:${file}`], { encoding: 'utf8' })
  const current = fs.readFileSync(file, 'utf8')
  const a = canonicalTemplate(original, false)
  const b = canonicalTemplate(current, file.endsWith('/OptionApp.vue'))
  if (JSON.stringify(a) !== JSON.stringify(b)) {
    failed.push(file)
    function diff(a, b, path = '') {
      if (JSON.stringify(a) === JSON.stringify(b)) return
      if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return { path, original: a, current: b }
      for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) { const found = diff(a[key], b[key], path + '/' + key); if (found) return found }
    }
    console.log(file, JSON.stringify(diff(a,b)))
  }
}
if (failed.length) { console.error('Template/style differences:', failed); process.exitCode = 1 }
else console.log(`Japanese template and inline style structure matches upstream in ${files.length} Vue files; only the language control is excluded.`)
