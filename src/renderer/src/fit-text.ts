/**
 * Korean names are usually wider than the Japanese ones these columns were sized for.
 * Text that does not fit is condensed slightly; longer overflows also use a slightly smaller
 * font so the text is not squeezed too much. Text that still does not fit is clipped or
 * ellipsized as in the original layout.
 */
const TARGETS = [
  '.deck-map .cell-name .name',
  '.enemy-list .cell-name .name',
  '.ship-list-root td.ship-name .name-content > .name',
  '.slotitem-list-root .equiped > .name',
  '.battle-history-root td.battle-area > span',
  '.battle-history-root .ship-header',
  '.mission-state-detail .ship-content .ship-name'
].join(',')
const MIN_SCALE = 0.58 // overall, font size times horizontal scale
const MIN_FONT = 0.76
const GAP = 2 // keep condensed text off the next column
const STYLES = ['transform', 'transform-origin', 'width', 'min-width', 'max-width', 'margin-right', 'font-size', 'line-height']
const fitted = new Set<HTMLElement>()
let started = false

export function startTextFit(): void {
  if (started || typeof MutationObserver === 'undefined' || !document.body) return
  started = true
  let queued = false
  const schedule = (): void => {
    if (queued) return
    queued = true
    requestAnimationFrame(() => {
      queued = false
      fitAll()
    })
  }
  new MutationObserver(schedule).observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['class']
  })
  window.addEventListener('resize', schedule)
  schedule()
}

function fitAll(): void {
  for (const el of fitted) {
    for (const name of STYLES) el.style.removeProperty(name)
  }
  fitted.clear()
  const targets = [...document.querySelectorAll<HTMLElement>(TARGETS)]
  // Read every size before writing so the layout is computed once.
  const sizes = targets.map((el) => {
    const style = getComputedStyle(el)
    // Keep the line height when the font gets smaller so rows do not move.
    const line = style.lineHeight === 'normal' ? `${el.clientHeight}px` : style.lineHeight
    return { box: el.clientWidth, natural: el.scrollWidth, visible: visibleWidth(el), font: style.fontSize, line }
  })
  targets.forEach((el, index) => {
    const { box, natural, visible, font, line } = sizes[index]
    const available = Math.min(box, visible)
    if (available <= 0 || natural <= available) return
    // scrollWidth is rounded, so leave a pixel for the fractional text width.
    const fit = (width: number): number => width / (natural + 1)
    const width = fit(available - GAP) >= MIN_SCALE ? available - GAP : available
    const ratio = Math.max(MIN_SCALE, fit(width))
    const shrink = ratio >= 0.9 ? 1 : Math.max(MIN_FONT, Math.sqrt(ratio))
    const scale = ratio / shrink
    if (shrink < 1) {
      el.style.lineHeight = line
      el.style.fontSize = `${parseFloat(font) * shrink}px`
    }
    el.style.transformOrigin = 'left center'
    el.style.transform = `scaleX(${scale.toFixed(3)})`
    // Widen the box so the text fits, and keep its layout width unchanged.
    const wide = width / scale
    el.style.width = `${wide}px`
    el.style.minWidth = `${wide}px`
    el.style.maxWidth = `${wide}px`
    el.style.marginRight = `${box - wide}px`
    fitted.add(el)
  })
}

/** Width of the element that is not hidden by ancestors that clip their content (e.g. a column at the table edge). */
function visibleWidth(el: HTMLElement): number {
  const left = el.getBoundingClientRect().left
  let visible = Infinity
  for (let parent = el.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
    const overflow = getComputedStyle(parent).overflowX
    if (overflow !== 'hidden' && overflow !== 'clip') continue
    const rect = parent.getBoundingClientRect()
    visible = Math.min(visible, rect.left + parent.clientLeft + parent.clientWidth - left)
  }
  return visible
}
