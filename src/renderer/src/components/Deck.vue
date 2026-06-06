<script setup lang="ts">
import {
  KcsUtil,
  ApiDeckPort,
  SenseiTaisenType,
  THCutin,
  THCutinState,
  SenseiTaisenState,
  SenseiRaigekiState,
  TKCutinState,
  TKCutin,
  TKCutinConsts,
  ShipInfo,
  ShipInfoSp,
  Slot,
  YCutin
} from '@common/kcs'
import { svdata } from '@renderer/store/svdata'
import {
  SokuText,
  FACutinText,
  AACutinText,
  SenseiTaisenText,
  isMaxYCutins,
  getYCutinText,
  getYSCutinText
} from '@common/locale'
import ShipBanner from '@renderer/components/ShipBanner.vue'
import { computed, ref, onMounted } from 'vue'
import { MathUtil } from '@common/math'
import { RUtil } from '@renderer/util'

interface TKEntry {
  ship: ShipInfo
  tk: TKCutin
}

interface TKRate {
  ship: ShipInfo | undefined
  tk: TKCutin
  rate: number
  left: number
}

interface SlotDisp {
  readonly type_img: string
  readonly onslot_html: string
  readonly level_html: string
}

interface DeckShip {
  readonly ship: ShipInfoSp
  readonly slot_disps: SlotDisp[]
  readonly stype: string
  readonly hpClassTT: object
  readonly hpClass: object
  readonly condClass: string
  readonly fualClass: string
  readonly bullClass: string
  readonly fual_per: number
  readonly bull_per: number
  readonly sokuClass: string
  readonly soku_text: string
  readonly hitClass: string
  readonly hit: number
  readonly evClass: string
  readonly ev: number
  readonly boku_text: string
  readonly sp_html: string
  readonly escaped: boolean
}

const shipSlotDips = (ship: ShipInfoSp): SlotDisp[] => {
  return ship.slots.map((slot, index) => {
    return {
      type_img: RUtil.slotTypeImg(slot),
      onslot_html: onslotHtml(ship, index, slot),
      level_html: levelHtml(slot)
    }
  })
}

type Props = {
  deck: ApiDeckPort
  show_rate?: boolean
  tooltip_ship_id?: number
  tooltip_ship_show?: boolean
}

const props = withDefaults(defineProps<Props>(), { show_rate: true })

const emit = defineEmits<{
  (e: 'update:tooltip_ship_id', v: number): void
  (e: 'update:tooltip_ship_show', v: boolean): void
}>()

const tkHoverShipId = ref('')
const tkHoverTk = ref('')
const tktipActive = ref(false)

onMounted(() => {
  console.log('deck mounted', props.deck)
})

const shipSps = computed<ShipInfoSp[]>(() => svdata.shipInfoSps(props.deck.api_ship))

const shipsData = computed<DeckShip[]>(() => {
  const sps = shipSps.value
  return sps.map((ship, index) => ({
    ship,
    slot_disps: shipSlotDips(ship),
    stype: svdata.mstStypeFromSafe(ship.mst),
    hpClassTT: RUtil.hpClassesTT(ship.api),
    hpClass: RUtil.hpClasses(ship.api),
    condClass: RUtil.condClass(ship.api),
    fualClass: RUtil.fualClass(ship),
    bullClass: RUtil.bullClass(ship),
    fual_per: Math.floor((ship.api.api_fuel / ship.mst.api_fuel_max) * 100.0),
    bull_per: Math.floor((ship.api.api_bull / ship.mst.api_bull_max) * 100.0),
    sokuClass: RUtil.sokuClass(ship.api),
    soku_text: SokuText[ship.api.api_soku / 5] ?? '',
    syateiClass: RUtil.syateiClass(ship),
    syatei_text: RUtil.syateiText(ship),
    hitClass: RUtil.condClass(ship.api),
    hit: MathUtil.floor(KcsUtil.shipHit(ship).hit, 0),
    evClass: RUtil.evClass(ship),
    ev: MathUtil.floor(KcsUtil.shipKaihi(ship).kaihi, 0),
    boku_text: shipBouku(sps, ship),
    sp_html: shipSpHtml(sps, ship),
    escaped: svdata.isShipEscaped(props.deck, index)
  }))
})

const shipsRow = computed<(DeckShip | null)[]>(() => {
  const rows = shipsData.value.concat()
  if (rows.length < 6) rows.push(...new Array(6 - rows.length).fill(null))
  return rows as (DeckShip | null)[]
})

const tktipHtml = computed<string>(() => {
  if (!tkHoverShipId.value || !tkHoverTk.value) return ''
  const shipId = parseInt(tkHoverShipId.value)
  const tk = parseInt(tkHoverTk.value) as TKCutin
  const ship = shipsData.value.find((s) => s.ship.api.api_id === shipId)
  if (!ship || !tk) return ''
  const header = `Lv: ${ship.ship.api.api_lv} ${ship.ship.mst.api_name}`
  const tktag = TipTKCiTag({ entry: [], type: [tk] })
  const src = RUtil.shipBannerImg(ship.ship.api.api_ship_id, false, true)
  const rate = MathUtil.floor(KcsUtil.rateTK(tk) * 100.0, 1)
  const tkconst = TKCutinConsts[tk]
  return `<div>${header}</div><img class="img" src="${src}"><div>${tktag} ${rate}%</div><div>固定:${tkconst.kotei} 変動:${tkconst.hendou}</div>`
})

const tkrateHover = (event: Event): void => {
  const dataset = (event.currentTarget as HTMLElement).dataset
  if (dataset.shipId) tkHoverShipId.value = dataset.shipId
  if (dataset.tk) {
    tkHoverTk.value = dataset.tk
    tktipActive.value = true
  } else {
    tktipActive.value = false
  }
}

const tkrateLeave = (_ev: Event): void => {
  tktipActive.value = false
}

const isTkrateActive = computed<boolean>(() => tktipActive.value)

const tkRates = computed<TKRate[]>(() => {
  const sps = shipSps.value
  let tks: TKEntry[] = []
  const atlantas = filterShips(sps, KcsUtil.isAtlantaType)
  const fletchers = filterShips(sps, KcsUtil.isFletcherType)
  const normals = filterShips(sps, isNotSpecialTkShip)
  atlantas.forEach((ship) => {
    if (ship.sp.tk) ship.sp.tk.type.forEach((v) => tks.push({ ship, tk: v }))
  })
  fletchers.forEach((ship) => {
    if (ship.sp.tk) ship.sp.tk.type.forEach((v) => tks.push({ ship, tk: v }))
  })
  tks = tks.concat(
    normals
      .reduce<{ ship: ShipInfoSp; tk: TKCutin }[]>((acc, ship) => {
        const tk = ship.sp.tk
        if (tk) tk.type.forEach((v) => acc.push({ ship, tk: v }))
        return acc
      }, [])
      .sort((a, b) => b.tk - a.tk)
  )
  const totalRate = MathUtil.totalRate(tks.map((e) => KcsUtil.rateTK(e.tk)))
  const rates: TKRate[] = Array(Math.max(15, tks.length))
  let left = 0
  rates.fill({ ship: undefined, tk: TKCutin.none, rate: 0.0, left: 0 })
  totalRate.rates.forEach((rate, index) => {
    rates[index] = { ship: tks[index].ship, tk: tks[index].tk, rate, left }
    left += rate
  })
  return rates
})

const tkrateTotal = computed<number>(() => tkRates.value.reduce((acc, r) => acc + r.rate, 0.0))
const tknorateText = computed<string>(() => {
  const total = tkrateTotal.value
  if (total === 0) return '対空CIなし'
  const v = MathUtil.floor((1.0 - total) * 100.0, 1)
  return `${v <= 12.0 ? '' : '不発: '}${v}%`
})
const tknorateStyle = computed(() => ({
  '--left': `${tkrateTotal.value}`,
  '--width': `${1.0 - tkrateTotal.value}`
}))
const totalTkrateText = computed<string>(() => MathUtil.floor(tkrateTotal.value * 100.0, 1) + '%')
const tkrateStyle = (rate: TKRate) => ({ '--left': `${rate.left}`, '--width': `${rate.rate}` })
const tkrateText = (rate: TKRate): string => {
  const v = MathUtil.floor(rate.rate * 100.0, 1)
  const prefix = v > 12.0 ? `${rate.tk}種: ` : ''
  return `${prefix}${v}%`
}
const deckKTBText = computed(() => KcsUtil.shipsSeiku(shipsData.value.map((s) => s.ship)))

const shipMouseEnter = (event: Event): void => {
  const dataset = (event.currentTarget as HTMLElement).dataset
  const id = parseInt(dataset.shipId!)
  emit('update:tooltip_ship_id', id)
  emit('update:tooltip_ship_show', true)
}
const shipMouseLeave = (): void => {
  emit('update:tooltip_ship_show', false)
}
const filterShips = (ships: ShipInfoSp[], type: (id: number) => boolean): ShipInfoSp[] => {
  return ships.filter((ship) => type(ship.mst.api_id))
}

const isNotSpecialTkShip = (id: number): boolean => {
  return !KcsUtil.isSpecialTkShipType(id)
}

const onslotHtml = (ship: ShipInfo, index: number, slot: Slot): string => {
  let cls = 'slot-inner'
  let txt = ''
  let img = ''
  const onslot = ship.api.api_onslot[index] ?? 0
  if (onslot && !slot) {
    // no equip
    cls += ' onslot-text'
    txt = onslot.toString()
  } else {
    if (slot && KcsUtil.hasOnSlot(KcsUtil.slotitemType(slot.mst))) {
      cls += ' onslot-text'
      if (!onslot) {
        // red
        cls += ' red'
      }
      const alv = slot.api.api_alv ?? 0
      if (alv) {
        img = `<img class="alv-img" src="${RUtil.slotALevelImg(alv)}">`
        cls += ' has-alv'
      }
      txt += onslot.toString()
    }
  }
  return `<span class="${cls}">${txt}</span>${img}`
}

const levelHtml = (slot: Slot): string => {
  let cls = 'slot-inner'
  let txt = ''
  const level = slot?.api.api_level
  if (level) {
    cls += ' level-text'
    if (10 === level) {
      txt = '★'
      cls += ' max'
    } else {
      txt = level.toString()
    }
    return `<span class="${cls}">${txt}</span>`
  }

  return ''
}

const toNaNTxt = (v: number): string => {
  return isNaN(v) ? '?' : v.toString()
}

const THCutinTag = (ships: ShipInfoSp[], st: THCutinState): string => {
  const kongos: THCutin[] = [THCutin.Kongou, THCutin.Hiei, THCutin.Haruna, THCutin.Kirisima];
  const name = kongos.includes(st.type)  ? '夜戦突撃' : '特殊砲撃'
  const rate = KcsUtil.rateTH(st, ships)
  const rate_v = MathUtil.floor((rate?.rate ?? NaN) * 100.0, 1)
  return `<span class="sp"><span class="tag ${st.enable ? 'is-danger is-tokuhou' : 'is-disable'} ">${name}</span><span class="sp-rate">${toNaNTxt(rate_v)}%</span></span>`
}

const TKCutinTag = (tk: TKCutinState): string => {
  const rates = tk.type.map((el) => toNaNTxt(MathUtil.floor(KcsUtil.rateTK(el) * 100.0, 1)) + '%')
  return `<span class="sp"><span class="tag is-info">${tk.type.join('/')}種 対空CI</span><span class="sp-rate">${rates.join(' ')}</span></span>`
}

const SenseiTaisenTag = (st: SenseiTaisenState): string => {
  let issmall = ''
  if (SenseiTaisenType.auto === st.type) {
    issmall = 'small'
  }
  return `<span class="sp">`+
    `<span class="${issmall} tag ${st.enable ? 'is-info' : 'is-disable'}">${SenseiTaisenText[st.type]}</span>`+
    `<span class="sp-rate">&nbsp;</span></span>`
}

const SenseiRaigekiTag = (st: SenseiRaigekiState): string => {
  return '<span class="sp"><span class="tag is-info">先制雷撃</span><span class="sp-rate">&nbsp;</span></span>'
}

const FunsindanmakuTag = (ship: ShipInfoSp): string => {
  const fdrate = KcsUtil.rateFD(ship)
  let rate_txt = '?'
  if (fdrate) {
    rate_txt = toNaNTxt(MathUtil.floor(fdrate.rate * 100, 1))
  }
  return `<span class="sp"><span class="small tag is-primary">噴弾</span><span class="sp-rate">${rate_txt}%</span></span>`
}

const YateiTag = (ship: ShipInfoSp, ships: ShipInfoSp[]): string => {
  const rate = KcsUtil.rateYatei(ship, ships)
  let rate_txt = '?'
  if (rate) {
    rate_txt = toNaNTxt(MathUtil.floor(rate.rate * 100, 1))
  }
  let disableCls = ''
  let title = ''
  if (rate && !rate.enable) {
    disableCls = 'is-disable'
    title = '艦隊に制空戦装備なし'
  }
  return `<span class="sp"><span class="small tag is-dark ${disableCls}" title="${title}">夜偵</span><span class="sp-rate">${rate_txt}%</span></span>`
}

const FACutinTag = (ship: ShipInfoSp, ships: ShipInfoSp[], isReduce: boolean): string => {
  const rates = KcsUtil.rateFA(ship, ships)
  if (!rates.length) {
    return ''
  }

  let total_html = ''
  if (rates.length > 1) {
    let calc_rates: number[][] = [[], []]
    rates.forEach((rate) => {
      calc_rates[0].push(rate.rate[0])
      calc_rates[1].push(rate.rate[1])
    })
    const total_kakuho = MathUtil.floor(MathUtil.totalRate(calc_rates[0]).total * 100, 1)
    const total_yuusei = MathUtil.floor(MathUtil.totalRate(calc_rates[1]).total * 100, 1)
    total_html = `<span class="sp"><span class="tag is-danger">合計</span><span class="sp-rate">${toNaNTxt(total_kakuho)}%/${toNaNTxt(total_yuusei)}%</span></span>`
  }

  let html;
  if (isReduce && rates.length > 1) {
    const htmls = rates.reduce<string[]>((acc, rate, index) => {
      if (index && (index % 2) === 0) {
        acc.push('</span>')
        acc.push('<span class="sp">')
      }
      acc.push(`<span class="tag ${rate.enable ? 'is-danger' : 'is-disable'}">${FACutinText[rate.type]}</span>`);    
      return acc
    }, ['<span class="sp">'])
    if (rates.length % 2) {
      htmls.push('<span class="sp-rate">&nbsp;</span>')
    }
    htmls.push('</span>')
    html = htmls.join('')
  } else {
    html = rates.reduce((acc, rate) => {
      const rate_kakuho = MathUtil.floor(rate.rate[0] * 100, 1)
      const rate_yuusei = MathUtil.floor(rate.rate[1] * 100, 1)
      acc += `<span class="sp"><span class="tag ${rate.enable ? 'is-danger' : 'is-disable'}">${FACutinText[rate.type]}</span><span class="sp-rate">${toNaNTxt(rate_kakuho)}%/${toNaNTxt(rate_yuusei)}%</span></span>`
      return acc
    }, '')
  }

  return total_html + html
}

const AACutinTag = (ship: ShipInfoSp, ships: ShipInfoSp[], isReduce: boolean): string => {
  const rates = KcsUtil.rateAA(ship, ships)
  if (!rates.length) {
    return ''
  }

  let total_html = ''
  if (rates.length > 1) {
    let calc_rates: number[][] = [[], []]
    rates.forEach((rate) => {
      calc_rates[0].push(rate.rate[0])
      calc_rates[1].push(rate.rate[1])
    })
    const total_kakuho = MathUtil.floor(MathUtil.totalRate(calc_rates[0]).total * 100, 1)
    const total_yuusei = MathUtil.floor(MathUtil.totalRate(calc_rates[1]).total * 100, 1)
    total_html = `<span class="sp"><span class="tag is-danger">合計</span><span class="sp-rate">${toNaNTxt(total_kakuho)}%/${toNaNTxt(total_yuusei)}%</span></span>`
  }

  let html;
  if (isReduce && rates.length > 1) {
    const htmls = rates.reduce<string[]>((acc, rate, index) => {
      if (index && (index % 2) === 0) {
        acc.push('</span>')
        acc.push('<span class="sp">')
      }
      acc.push(`<span class="tag ${rate.enable ? 'is-danger' : 'is-disable'}">${AACutinText[rate.type]}</span>`);    
      return acc
    }, ['<span class="sp">'])
    if (rates.length % 2) {
      htmls.push('<span class="sp-rate">&nbsp;</span>')
    }
    htmls.push('</span>')
    html = htmls.join('')
  } else {
    html = rates.reduce((acc, rate) => {
      const rate_kakuho = MathUtil.floor(rate.rate[0] * 100, 1)
      const rate_yuusei = MathUtil.floor(rate.rate[1] * 100, 1)
      acc += `<span class="sp"><span class="tag ${rate.enable ? 'is-danger' : 'is-disable'}">${AACutinText[rate.type]}</span><span class="sp-rate">${toNaNTxt(rate_kakuho)}%/${toNaNTxt(rate_yuusei)}%</span></span>`
      return acc
    }, '')
  }

  return total_html + html
}

const YCutinTag = (ship: ShipInfoSp, ships: ShipInfoSp[], isReduce: boolean): string => {
  const rates = KcsUtil.rateY(ship, ships)
  if (!rates.length) {
    return ''
  }

  let total_html = ''
  const multiCi = rates.filter((rate) => rate.type !== YCutin.COMMON_RENGEKI)
  if (multiCi.length > 1) {
    const calc_rates: number[] = multiCi.map((rate) => rate.rate)
    const total = MathUtil.floor(MathUtil.totalRate(calc_rates).total * 100, 1)
    total_html = `<span class="sp"><span class="tag is-dark">合計</span><span class="sp-rate">${toNaNTxt(total)}%</span></span>`
  }

  let html;
  if (isReduce && multiCi.length > 1) {

    // 夜間瑞雲カットインは名前文字数順で表示する
    let reOrder = rates;
    if (rates.some(rate => rate.type === YCutin.YAKAN_ZUIUN1_DEN) &&
      rates.some(rate => rate.type === YCutin.YAKAN_ZUIUN2_DEN)) {
        reOrder = rates.sort((a, b) => {
          const aIsZuiun = a.type === YCutin.YAKAN_ZUIUN1_DEN || a.type === YCutin.YAKAN_ZUIUN2_DEN
          const bIsZuiun = b.type === YCutin.YAKAN_ZUIUN1_DEN || b.type === YCutin.YAKAN_ZUIUN2_DEN
          if (aIsZuiun && !bIsZuiun) {
            return -1
          } else if (!aIsZuiun && bIsZuiun) {
            return 1
          }
          return 0
        })
    }
  
    const htmls = rates.reduce<string[]>((acc, rate, index) => {
      if (index && (index % 2) === 0) {
        acc.push('</span>')
        acc.push('<span class="sp">')
      }
      const isMaxClass = isMaxYCutins.includes(rate.type) ? ' is-max' : ''
      acc.push(`<span class="tag is-dark${isMaxClass}">${getYCutinText(rate.type, true)}</span>`);    
      return acc
    }, ['<span class="sp">'])
    if (rates.length % 2) {
      htmls.push('<span class="sp-rate">&nbsp;</span>')
    }
    htmls.push('</span>')
    html = htmls.join('')
  } else {
    html = rates.reduce((acc, rate, index) => {
      const isMaxClass = isMaxYCutins.includes(rate.type) ? ' is-max' : ''
      const rate_txt = MathUtil.floor(rate.rate * 100, 1)
      acc += `<span class="sp"><span class="tag is-dark${isMaxClass}">`+
        `${getYCutinText(rate.type, false)}</span><span class="sp-rate">${toNaNTxt(rate_txt)}%</span></span>`
      return acc
    }, '')
  }
  return total_html + html
}

const YSCutinTag = (ship: ShipInfoSp, ships: ShipInfoSp[], isReduce: boolean): string => {
  const rates = KcsUtil.rateYS(ship, ships)
  if (!rates.length) {
    return ''
  }

  let total_html = ''
  if (rates.length > 1) {
    const calc_rates: number[] = rates.map((rate) => rate.rate)
    const total = MathUtil.floor(MathUtil.totalRate(calc_rates).total * 100, 1)
    total_html = `<span class="sp"><span class="tag is-dark">合計</span><span class="sp-rate">${toNaNTxt(total)}%</span></span>`
  }

  let html
  if (isReduce && rates.length > 1) {
    const htmls = rates.reduce<string[]>((acc, rate, index) => {
      if (index && (index % 2) === 0) {
        acc.push('</span>')
        acc.push('<span class="sp">')
      }
      acc.push(`<span class="tag is-dark">${getYSCutinText(rate.type, true)}</span>`);    
      return acc
    }, ['<span class="sp">'])
    if (rates.length % 2) {
      htmls.push('<span class="sp-rate">&nbsp;</span>')
    }
    htmls.push('</span>')
    html = htmls.join('')
  } else {
      html = rates.reduce((acc, rate) => {
      const rate_txt = MathUtil.floor(rate.rate * 100, 1)
      acc += `<span class="sp"><span class="tag is-dark">${getYSCutinText(rate.type, false)}</span><span class="sp-rate">${toNaNTxt(rate_txt)}%</span></span>`
      return acc
    }, '')
  }
  return total_html + html
}

const shipSpHtml = (ships: ShipInfoSp[], ship: ShipInfoSp): string => {
  const ret: string[] = []
  const sp = ship.sp
  const spCount = KcsUtil.getShipSpCount(ship)
  const isReduce = spCount > 5;

  // thcutin
  if (sp.th) {
    sp.th.forEach((th) => {
      ret.push(THCutinTag(ships, th))
    })
  }

  // facutin
  ret.push(FACutinTag(ship, ships, isReduce))

  // aacutin
  ret.push(AACutinTag(ship, ships, isReduce))

  // tkcutin
  if (sp.tk) {
    ret.push(TKCutinTag(sp.tk))
  }

  // sensei taisen
  if (sp.st) {
    ret.push(SenseiTaisenTag(sp.st))
  }

  // sensei raigeki
  if (sp.sr) {
    ret.push(SenseiRaigekiTag(sp.sr))
  }

  // funsindanmaku
  if (sp.fd) {
    ret.push(FunsindanmakuTag(ship))
  }

  // yatei
  if (sp.yt) {
    ret.push(YateiTag(ship, ships))
  }

  // ycutin
  ret.push(YCutinTag(ship, ships, isReduce))

  // yscutin
  ret.push(YSCutinTag(ship, ships, isReduce))

  return ret.join('')
}

const shipBouku = (shipSps: ShipInfoSp[], ship: ShipInfoSp): string => {
  const saitei = 1
  const wariai = MathUtil.floor((ship.bouku.kt / 400.0) * 100.0, 0)
  const kotei = KcsUtil.shipKoteiGekitui(ship, shipSps)
  //const saidai = Math.floor(ship.bouku.kt*66/400.0)+kotei+saitei;
  //return `${saitei}/${wariai}%/${kotei}/${saidai}`;
  //return `${wariai}%/${kotei}/${saidai}`;
  return `${wariai}%/${kotei}`
}

const TipTKCiTag = (st: TKCutinState): string => {
  //return `<span class="sp tag is-info">${st.type.join(' ,')}種対空CI(${st.entry.join(',')})</span>`;
  return `<span class="sp tag is-link">${st.type.join(' ,')}種 対空CI</span>`
}

/////////////////////////////////////////////////////////////////////////////////////
// row class
function rowClass(): string {
  return 'ship-row'
}

</script>

<template>
  <div class="deck">
    <section class="deck-ship-imgs" @mouseleave="shipMouseLeave">
      <span
        class="ship-container"
        @mouseenter="shipMouseEnter"
        :data-ship-id="ship.ship.api.api_id"
        v-for="(ship, index) in shipsData"
        :key="index"
      >
        <!-- todo: load image error draw ship name -->
        <ShipBanner :ship_info="ship.ship" />
        <span v-if="ship.escaped" class="ship-state">退避</span>
        <span class="slots">
          <img
            v-for="(slot, index) in ship.ship.slots"
            :key="index"
            class="slot"
            src="../assets/img/slot/slot.png"
          />
        </span>
        <span class="slots">
          <img
            v-for="(disp, index) in ship.slot_disps"
            :key="index"
            class="slot"
            :src="disp.type_img"
          />
        </span>
        <span class="slots">
          <span
            v-for="(disp, index) in ship.slot_disps"
            :key="index"
            class="slot"
            v-html="disp.onslot_html"
          />
        </span>
        <span class="slots">
          <span
            v-for="(disp, index) in ship.slot_disps"
            :key="index"
            class="slot"
            v-html="disp.level_html"
          />
        </span>
      </span>
    </section>

    <section class="deck-map">
      <b-table
        :data="shipsRow"
        :bordered="false"
        :striped="false"
        :narrowed="false"
        :hoverable="false"
        :mobile-cards="false"
        :row-class="rowClass"
      >
        <b-table-column v-slot="props" label="name" centered cell-class="cell-name">
          <div v-if="props.row !== null" :class="props.row.hpClassTT">
            <div class="stype">{{ props.row.stype }}</div>
            <div class="name">{{ props.row.ship.mst.api_name }}</div>
          </div>
          <div v-else class="ship-empty"></div>
        </b-table-column>
        <b-table-column v-slot="props" label="Lv" centered cell-class="cell-status small">
          <div v-if="props.row !== null">
            <div class="lv">Lv</div>
            <div>
              <span :class="{ 'state-plus': props.row.ship.api.api_lv >= 100 }">{{
                props.row.ship.api.api_lv
              }}</span>
            </div>
          </div>
        </b-table-column>
        <b-table-column v-slot="props" label="hp" centered cell-class="cell-status small">
          <div v-if="props.row !== null">
            <div class="s-icon heart-a2" title="耐久"></div>
            <div>
              <span :class="props.row.hpClass">{{ props.row.ship.api.api_nowhp }}</span>
            </div>
          </div>
        </b-table-column>
        <b-table-column v-slot="props" label="cond" centered cell-class="cell-status small">
          <div v-if="props.row !== null">
            <div class="s-icon cond" :class="props.row.condClass" title="コンディション"></div>
            <div>
              <span :class="props.row.condClass">{{ props.row.ship.api.api_cond }}</span>
            </div>
          </div>
        </b-table-column>
        <b-table-column v-slot="props" label="fual" centered cell-class="cell-status large0">
          <div v-if="props.row !== null">
            <div class="s-icon fuel" title="燃料"></div>
            <div :class="props.row.fualClass">
              <span>{{ props.row.fual_per }}%</span>
            </div>
          </div>
        </b-table-column>
        <b-table-column v-slot="props" label="bull" centered cell-class="cell-status large0">
          <div v-if="props.row !== null">
            <div class="s-icon bull" title="弾薬"></div>
            <div :class="props.row.bullClass">
              <span>{{ props.row.bull_per }}%</span>
            </div>
          </div>
        </b-table-column>
        <b-table-column v-slot="props" label="speed" centered cell-class="cell-status large1">
          <div v-if="props.row !== null">
            <div class="s-icon speed" title="速力"></div>
            <div>
              <span :class="props.row.sokuClass">{{ props.row.soku_text }}</span>
            </div>
          </div>
        </b-table-column>
        <b-table-column v-slot="props" label="range" centered cell-class="cell-status large1">
          <div v-if="props.row !== null">
            <div class="s-icon range" title="射程"></div>
            <div>
              <span :class="props.row.syateiClass">{{ props.row.syatei_text }}</span>
            </div>
          </div>
        </b-table-column>
        <b-table-column v-slot="props" label="hit" centered cell-class="cell-status large0">
          <div v-if="props.row !== null">
            <div class="s-icon hit" title="命中項"></div>
            <div :class="props.row.hitClass">{{ props.row.hit }}%</div>
          </div>
        </b-table-column>
        <b-table-column v-slot="props" label="ev" centered cell-class="cell-status large0">
          <div v-if="props.row !== null">
            <div class="s-icon ev" title="回避項"></div>
            <div :class="props.row.evClass">{{ props.row.ev }}%</div>
          </div>
        </b-table-column>
        <b-table-column v-slot="props" label="boku" cell-class="cell-status large_aa">
          <div v-if="props.row !== null">
            <div class="s-icon aa" title="撃墜 割合/固定"></div>
            <div class="status-txt">{{ props.row.boku_text }}</div>
          </div>
        </b-table-column>
        <b-table-column v-slot="props" label="slot" cell-class="cell-sps">
          <div v-if="props.row !== null" class="sp-content" v-html="props.row.sp_html"></div>
        </b-table-column>
      </b-table>
    </section>
    
    <b-tooltip
      always
      :active="isTkrateActive"
      position="is-top"
      type="is-dark"
      :square="true"
      :animated="false"
      class="tktip-root"
    >
      <template #content><span class="tktip" v-html="tktipHtml"></span></template>
      <section class="deck-ship-list tkrate">
        <span class="tkrate1 list-title"
          >対空CI合計: {{ totalTkrateText }} <span>艦防: {{ deckKTBText }}</span></span
        >
        <span class="tkrate2">
          <span class="tkrate-container">
            <span
              class="tkrate-unit"
              :style="tknorateStyle"
              @mouseenter="tkrateHover"
              @mouseleave="tkrateLeave"
            >
              <span class="tkrate-value-container">
                <span class="tkrate-text">{{ tknorateText }}</span>
              </span>
            </span>
            <span
              v-for="(rate, index) in tkRates"
              :key="index"
              class="tkrate-unit"
              :style="tkrateStyle(rate)"
              @mouseenter="tkrateHover"
              @mouseleave="tkrateLeave"
              :data-tk="rate.tk"
              :data-ship-id="rate.ship ? rate.ship.api.api_id : ''"
            >
              <span class="tkrate-value-container">
                <span v-if="rate.ship !== undefined" class="tkrate-text">{{
                  tkrateText(rate)
                }}</span>
              </span>
            </span>
          </span>
        </span>
      </section>
    </b-tooltip>
  </div>
</template>