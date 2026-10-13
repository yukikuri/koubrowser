import { Quest, QuestCounter } from "@common/record"
import { QuestMap, QuestMapCell, QuestMapOrCell } from "@common/kcquest_definition"

/**
 *
 * @param prefixs
 * @param quest
 * @returns
 */
export function detailFormat(prefixs: string[], quest: Quest): string {
  const state = quest.state as QuestCounter
  if (!state) {
    return ''
  }
  return state.count
    .reduce<string[]>((acc, el, index) => {
      const cleared = el === state.countMax[index]
      let classTxt = ''
      if (cleared) {
        classTxt = ' class="cleared"'
      }
      acc.push(`<span${classTxt}>${prefixs[index]}${el}/${state.countMax[index]}</span>`)
      return acc
    }, [])
    .join(' ')
}

function getMapSufix(map: QuestMap | QuestMapCell): string {
  let sufix_txt = ''
  if (map[0] === 5 && map[1] === 6) {
    const map3 = map[3]
    if (Array.isArray(map3) && map3[0] === 43) {
      sufix_txt = '(第3)'
    }
  }
  if (map[0] === 7 && map[1] === 2) {
    const map3 = map[3]
    sufix_txt = '(第1)'
    if (Array.isArray(map3) && map3[0] === 15) {
      sufix_txt = '(第2)'
    }
  }
  if (map[0] === 7 && map[1] === 3) {
    const map3 = map[3]
    sufix_txt = '(第1)'
    if (Array.isArray(map3) && map3.length === 4) {
      sufix_txt = '(第2)'
    }
  }
  if (map[0] === 7 && map[1] === 5) {
    const map3 = map[3];
    sufix_txt = '(第3)'
    if (Array.isArray(map3) && map3[0] === 19) {
      sufix_txt = '(第2)'
    }
  }
  return sufix_txt
}

export function detailFormatByMap(quest: Quest, maps: QuestMapOrCell[], colon: string = '：'): string {
  const state = quest.state as QuestCounter
  if (!state) {
    return ''
  }

  if (!maps.length) {
    return ''
  }

  return state.count
    .reduce<string[]>((acc, el, index) => {
      const cleared = el === state.countMax[index]
      let classTxt = ''
      if (cleared) {
        classTxt = ' class="cleared"'
      }
      const map = maps[index]
      const sufix_txt = getMapSufix(map)
      const mapTxt = `${map[0]}-${map[1]}${map[2]}${sufix_txt}${colon}`
      acc.push(`<span${classTxt}>${mapTxt}${el}/${state.countMax[index]}</span>`)
      return acc
    }, [])
    .join(' ')
}

export function detailFormatOneByMap(quest: Quest, maps: QuestMapOrCell[], colon: string = '：'): string {
  const state = quest.state as QuestCounter
  if (!state) {
    return ''
  }

  if (!maps.length) {
    return ''
  }

  console.log('quest stuff maps', quest.no, quest.quest?.api_title, maps)
  return state.count
    .reduce<string[]>((acc, el, index) => {
      const cleared = el === state.countMax[index]
      let classTxt = ''
      if (cleared) {
        classTxt = ' class="cleared"'
      }
      const txt = el === state.countMax[index] ? '済' : '未'
      const map = maps[index]
      const sufix_txt = getMapSufix(map)
      const mapTxt = `${map[0]}-${map[1]}${map[2]}${sufix_txt}${colon}`
      acc.push(`<span${classTxt}>${mapTxt}${txt}</span>`)
      return acc
    }, [])
    .join(' ')
}

export function detailFormatMaps(quest: Quest, maps: QuestMapOrCell[], colon: string = '：'): string {
  const state = quest.state as QuestCounter
  if (!state) {
    return ''
  }

  if (!maps.length) {
    return ''
  }

  console.log('quest stuff maps', quest.no, quest.quest?.api_title, maps)
  return state.count
    .reduce<string[]>((acc, el, index) => {
      const cleared = el === state.countMax[index]
      let classTxt = ''
      if (cleared) {
        classTxt = ' class="cleared"'
      }
      const map = maps[index]
      const sufix_txt = getMapSufix(map)
      const mapTxt = `${map[0]}-${map[1]}${map[2]}${sufix_txt}${colon}`
      if (1 === state.countMax[index]) {
        const txt = el === state.countMax[index] ? '済' : '未'
        acc.push(`<span${classTxt}>${mapTxt}${txt}</span>`)
      } else {
        acc.push(`<span${classTxt}>${mapTxt}${el}/${state.countMax[index]}</span>`)
      }
      return acc
    }, [])
    .join(' ')
}

export function detailFormatOne(prefixs: string[], quest: Quest): string {
  const state = quest.state as QuestCounter
  if (!state) {
    return ''
  }
  return state.count
    .reduce<string[]>((acc, el, index) => {
      const cleared = el === state.countMax[index]
      let classTxt = ''
      if (cleared) {
        classTxt = ' class="cleared"'
      }
      const txt = el === state.countMax[index] ? '済' : '未'
      acc.push(`<span${classTxt}>${prefixs[index]}${txt}</span>`)
      return acc
    }, [])
    .join(' ')
}
