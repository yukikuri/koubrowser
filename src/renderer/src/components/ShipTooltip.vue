<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { svdata } from '@renderer/store/svdata'
import {
  ApiShip,
  MstShip,
  Slot,
  KcsUtil,
  MstSlotitem,
  Bouku,
  Kaihi,
  ShipInfo,
  Hit,
  THCutin,
  THCutinState,
  SenseiTaisenState,
  SenseiRaigekiState,
  TKCutinState,
  ShipInfoSp,
  YCutin
} from '@common/kcs'
import { MathUtil } from '@common/math'
import { RUtil } from '@renderer/util'
import {
  SokuText,
  SyateiText,
  FACutinText,
  AACutinText,
  SenseiTaisenText,
  isMaxYCutins,
  getYCutinText,
  getYSCutinText
} from '@common/locale'

type Props = { ship_id: number }
const props = defineProps<Props>()

const rootEl = ref<HTMLElement | null>(null)

const remodelText = (slots: Slot[], func: (mst: MstSlotitem, level: number) => number): string => {
  const add = slots.reduce((acc, slot) => {
    if (slot && slot.api.api_level) {
      acc += func(slot.mst, slot.api.api_level)
    }
    return acc
  }, 0)
  return add ? `+${MathUtil.floor(add, 2)}` : ''
}

const api = computed<ApiShip>(() => svdata.ship(props.ship_id)!)
const mst = computed<MstShip>(() => svdata.mstShip(api.value.api_ship_id)!)
const slots = computed<Slot[]>(() => svdata.slots(api.value))
const shipInfo = computed<ShipInfo>(() => ({
  api: api.value,
  mst: mst.value,
  slots: slots.value,
  onslotMax: mst.value.api_maxeq.filter((el) => el > 0)
}))
const deckShipIds = computed<number[]>(() => {
  const deck = svdata.deckPorts.find((d) => d.api_ship.includes(props.ship_id))
  return deck ? deck.api_ship : [props.ship_id]
})
const shipSps = computed<ShipInfoSp[]>(() => svdata.shipInfoSps(deckShipIds.value))
const shipSp = computed<ShipInfoSp | undefined>(() => shipSps.value.find((s) => s.api.api_id === props.ship_id))

const sokuText = computed(() => SokuText[api.value.api_soku / 5] ?? '')
const syateiText = computed(() => SyateiText[api.value.api_leng] ?? '')

const remodelFire = computed(() => remodelText(slots.value, KcsUtil.fireFromLevel))
const remodelTor = computed(() => remodelText(slots.value, KcsUtil.torFromLevel))
const remodelEv = computed(() => remodelText(slots.value, KcsUtil.evFromLevel))
const remodelArmor = computed(() => remodelText(slots.value, KcsUtil.armorFromLevel))
const remodelAsw = computed(() => remodelText(slots.value, KcsUtil.aswFromLevel))
const remodelLos = computed(() => remodelText(slots.value, KcsUtil.losFromLevel))

const shipBouku = computed<Bouku>(() => KcsUtil.shipBouku(shipInfo.value))
const kajuTaiku = computed<string>(() => shipBouku.value.kt.toString())
const remodelKTHtml = computed<string>(() => {
  const b = shipBouku.value
  if (b.ktRemodel) {
    return `(${MathUtil.floor(b.ktRaw, 2)}+<span class="remodel">${MathUtil.floor(b.ktRemodel, 2)}</span>)`
  }
  return ''
})
const remodelBoukuHtml = computed<string>(() => {
  const b = shipBouku.value
  if (b.ktbRemodel) {
    return `(${MathUtil.floor(b.ktbRaw, 2)}+<span class="remodel">${MathUtil.floor(b.ktbRemodel, 2)}</span>)`
  }
  return ''
})

const shipKaihi = computed<Kaihi>(() => KcsUtil.shipKaihi(shipInfo.value))
const kaihi = computed<number>(() => MathUtil.floor(shipKaihi.value.kaihi, 2))
const remodelKaihiHtml = computed<string>(() => {
  const k = shipKaihi.value
  if (k.kaihiRemodel) {
    return `(${MathUtil.floor(k.kaihi - k.kaihiRemodel, 2)}+<span class="remodel">${MathUtil.floor(k.kaihiRemodel, 2)}</span>)`
  }
  return ''
})

const shipHit = computed<Hit>(() => KcsUtil.shipHit(shipInfo.value))
const hit = computed<number>(() => MathUtil.floor(shipHit.value.hit, 2))
const remodelHitHtml = computed<string>(() => {
  const h = shipHit.value
  if (h.hitRemodel) {
    return `(${MathUtil.floor(h.hit - h.hitRemodel, 2)}+<span class="remodel">${MathUtil.floor(h.hitRemodel, 2)}</span>)`
  }
  return ''
})

const bouku = computed<number>(() => KcsUtil.shipBouku(shipInfo.value).ktb)

const slotTypeImg = (slot: Slot): string => RUtil.slotTypeImg(slot)
const slotAlvImg = (slot: Slot): string => RUtil.slotALevelImg(slot!.api.api_alv!)
const slotOnSlotText = (slot: Slot, index: number): string => {
  if (tousai.value === 0) return ''
  const onslot = api.value.api_onslot[index] ?? -1
  const maxslot = shipInfo.value.onslotMax[index] ?? -1
  if (onslot >= 0 && maxslot > -1) return `${onslot}/${maxslot}`
  if (onslot > 0) return `${onslot}`
  return ''
}
const slotLevelText = (slot: Slot): string => {
  const level = slot!.api.api_level
  return level === 10 ? 'MAX' : level!.toString()
}

const toNaNTxt = (v: number): string => {
  return isNaN(v) ? '?' : v.toString()
}

const THCutinTag = (ships: ShipInfoSp[], st: THCutinState): string => {
  const kongos: THCutin[] = [THCutin.Kongou, THCutin.Hiei, THCutin.Haruna, THCutin.Kirisima]
  const name = kongos.includes(st.type) ? '夜戦突撃' : '特殊砲撃'
  const rate = KcsUtil.rateTH(st, ships)
  const rateV = MathUtil.floor((rate?.rate ?? NaN) * 100.0, 1)
  return `<span class="sp"><span class="tag ${st.enable ? 'is-danger is-tokuhou' : 'is-disable'} ">${name}</span><span class="sp-rate">${toNaNTxt(rateV)}%</span></span>`
}

const TKCutinTag = (tk: TKCutinState): string => {
  const rates = tk.type.map((el) => toNaNTxt(MathUtil.floor(KcsUtil.rateTK(el) * 100.0, 1)) + '%')
  return `<span class="sp"><span class="tag is-info">${tk.type.join('/')}種 対空CI</span><span class="sp-rate">${rates.join(' ')}</span></span>`
}

const SenseiTaisenTag = (st: SenseiTaisenState): string => {
  return `<span class="sp"><span class="tag ${st.enable ? 'is-info' : 'is-disable'}">${SenseiTaisenText[st.type]}</span></span>`
}

const SenseiRaigekiTag = (_st: SenseiRaigekiState): string => {
  return '<span class="sp"><span class="tag is-info">先制雷撃</span></span>'
}

const FunsindanmakuTag = (ship: ShipInfoSp): string => {
  const fdrate = KcsUtil.rateFD(ship)
  let rateTxt = '?'
  if (fdrate) {
    rateTxt = toNaNTxt(MathUtil.floor(fdrate.rate * 100, 1))
  }
  return `<span class="sp"><span class="tag is-primary">噴弾</span><span class="sp-rate">${rateTxt}%</span></span>`
}

const YateiTag = (ship: ShipInfoSp): string => {
  const rate = KcsUtil.rateYatei(ship, [])
  let rate_txt = '?'
  if (rate) {
    rate_txt = toNaNTxt(MathUtil.floor(rate.rate * 100, 1))
  }
  return `<span class="sp"><span class="tag is-dark">夜偵</span><span class="sp-rate">${rate_txt}%</span></span>`
}

const FACutinTag = (ship: ShipInfoSp, ships: ShipInfoSp[]): string => {
  const rates = KcsUtil.rateFA(ship, ships)
  if (!rates.length) return ''

  let totalHtml = ''
  if (rates.length > 1) {
    const calcRates: number[][] = [[], []]
    rates.forEach((rate) => {
      calcRates[0].push(rate.rate[0])
      calcRates[1].push(rate.rate[1])
    })
    const totalKakuho = MathUtil.floor(MathUtil.totalRate(calcRates[0]).total * 100, 1)
    const totalYuusei = MathUtil.floor(MathUtil.totalRate(calcRates[1]).total * 100, 1)
    totalHtml = `<span class="sp"><span class="tag is-danger">合計</span><span class="sp-rate">${toNaNTxt(totalKakuho)}%/${toNaNTxt(totalYuusei)}%</span></span>`
  }

  const html = rates.reduce((acc, rate) => {
    const rateKakuho = MathUtil.floor(rate.rate[0] * 100, 1)
    const rateYuusei = MathUtil.floor(rate.rate[1] * 100, 1)
    acc += `<span class="sp"><span class="tag ${rate.enable ? 'is-danger' : 'is-disable'}">${FACutinText[rate.type]}</span><span class="sp-rate">${toNaNTxt(rateKakuho)}%/${toNaNTxt(rateYuusei)}%</span></span>`
    return acc
  }, '')

  return totalHtml + html
}

const AACutinTag = (ship: ShipInfoSp, ships: ShipInfoSp[]): string => {
  const rates = KcsUtil.rateAA(ship, ships)
  if (!rates.length) return ''

  let totalHtml = ''
  if (rates.length > 1) {
    const calcRates: number[][] = [[], []]
    rates.forEach((rate) => {
      calcRates[0].push(rate.rate[0])
      calcRates[1].push(rate.rate[1])
    })
    const totalKakuho = MathUtil.floor(MathUtil.totalRate(calcRates[0]).total * 100, 1)
    const totalYuusei = MathUtil.floor(MathUtil.totalRate(calcRates[1]).total * 100, 1)
    totalHtml = `<span class="sp"><span class="tag is-danger">合計</span><span class="sp-rate">${toNaNTxt(totalKakuho)}%/${toNaNTxt(totalYuusei)}%</span></span>`
  }

  const html = rates.reduce((acc, rate) => {
    const rateKakuho = MathUtil.floor(rate.rate[0] * 100, 1)
    const rateYuusei = MathUtil.floor(rate.rate[1] * 100, 1)
    acc += `<span class="sp"><span class="tag ${rate.enable ? 'is-danger' : 'is-disable'}">${AACutinText[rate.type]}</span><span class="sp-rate">${toNaNTxt(rateKakuho)}%/${toNaNTxt(rateYuusei)}%</span></span>`
    return acc
  }, '')

  return totalHtml + html
}

const YCutinTag = (ship: ShipInfoSp, ships: ShipInfoSp[]): string => {
  const rates = KcsUtil.rateY(ship, ships)
  if (!rates.length) return ''

  let totalHtml = ''
  const multiCi = rates.filter((rate) => rate.type !== YCutin.COMMON_RENGEKI)
  if (multiCi.length > 1) {
    const calcRates: number[] = multiCi.map((rate) => rate.rate)
    const total = MathUtil.floor(MathUtil.totalRate(calcRates).total * 100, 1)
    totalHtml = `<span class="sp"><span class="tag is-dark">合計</span><span class="sp-rate">${toNaNTxt(total)}%</span></span>`
  }


  const html = rates.reduce((acc, rate) => {
    const isMaxClass = isMaxYCutins.includes(rate.type) ? ' is-max' : ''
    const rateTxt = MathUtil.floor(rate.rate * 100, 1)
    acc += `<span class="sp"><span class="tag is-dark${isMaxClass}">${getYCutinText(rate.type, false)}</span><span class="sp-rate">${toNaNTxt(rateTxt)}%</span></span>`
    return acc
  }, '')
  return totalHtml + html
}

const YSCutinTag = (ship: ShipInfoSp, ships: ShipInfoSp[]): string => {
  const rates = KcsUtil.rateYS(ship, ships)
  if (!rates.length) return ''

  let totalHtml = ''
  if (rates.length > 1) {
    const calcRates: number[] = rates.map((rate) => rate.rate)
    const total = MathUtil.floor(MathUtil.totalRate(calcRates).total * 100, 1)
    totalHtml = `<span class="sp"><span class="tag is-dark">合計</span><span class="sp-rate">${toNaNTxt(total)}%</span></span>`
  }

  const html = rates.reduce((acc, rate) => {
    const rateTxt = MathUtil.floor(rate.rate * 100, 1)
    acc += `<span class="sp"><span class="tag is-dark">${getYSCutinText(rate.type, false)}</span><span class="sp-rate">${toNaNTxt(rateTxt)}%</span></span>`
    return acc
  }, '')
  return totalHtml + html
}

// ----------------------------------------------------------------------------------
// HT
const htmlTH = computed<string>(() => {
  const ship = shipSp.value
  if (!ship) return ''

  const sp = ship.sp
  if (!sp || ! sp.th) return ''

  const ret: string[] = []
  sp.th.forEach((th) => {
    ret.push(THCutinTag(shipSps.value, th))
  })
  return ret.join('')
})

// ----------------------------------------------------------------------------------
// FA
const htmlFA = computed<string>(() => {
  const ship = shipSp.value
  if (!ship) return ''

  const ret: string[] = []
  ret.push(FACutinTag(ship, shipSps.value))
  return ret.join('')
})

// ----------------------------------------------------------------------------------
//  AA
const htmlAA = computed<string>(() => {
  const ship = shipSp.value
  if (!ship) return ''

  const ret: string[] = []
  ret.push(AACutinTag(ship, shipSps.value))
  return ret.join('')
})

// ----------------------------------------------------------------------------------
//  TK
const htmlTK = computed<string>(() => {
  const ship = shipSp.value
  if (!ship) return ''

  if (! ship.sp.tk) return ''

  const ret: string[] = []
  ret.push(TKCutinTag(ship.sp.tk))
  return ret.join('')
})

// ----------------------------------------------------------------------------------
//  Etc
const htmlEtc = computed<string>(() => {
  const ship = shipSp.value
  if (!ship) return ''

  const sp = ship.sp
  const ret: string[] = []
  if (sp.st) ret.push(SenseiTaisenTag(sp.st))
  if (sp.sr) ret.push(SenseiRaigekiTag(sp.sr))
  if (sp.fd) ret.push(FunsindanmakuTag(ship))
  if (sp.yt) ret.push(YateiTag(ship))
  return ret.join('')
})

// ----------------------------------------------------------------------------------
//  YC
const htmlYC = computed<string>(() => {
  const ship = shipSp.value
  if (!ship) return ''

  const ret: string[] = []
  ret.push(YCutinTag(ship, shipSps.value))
  return ret.join('')
})

// ----------------------------------------------------------------------------------
//  YS
const htmlYS = computed<string>(() => {
  const ship = shipSp.value
  if (!ship) return ''

  const ret: string[] = []
  ret.push(YSCutinTag(ship, shipSps.value))
  return ret.join('')
})

/////////////////////////////////////////////////////////////////////////////////////
// check has sp
const hasSp = computed<boolean>(() => {
  if (! shipSp.value) return false
  return KcsUtil.getShipSpCount(shipSp.value) > 0
})

const tousai = computed<number>(() => api.value.api_onslot.reduce((acc, onslot) => acc + onslot, 0))

onMounted(() => {
  queueMicrotask(() => {
    if (rootEl.value) rootEl.value.classList.add('ani-start')
  })
})
</script>

<template>
  <div class="shipTooltip" ref="rootEl">
    <div>
      Lv. {{ api.api_lv }} <span class="name">{{ mst.api_name }}</span>
      <span class="exp"
        ><span class="next-level-exp">次のレベルまで</span> {{ api.api_exp[1] }}
        <span class="next-level-exp">exp</span></span
      >
    </div>
    <hr class="hr" />
    <div class="status">
      <span class="s-icon fuel">燃料: {{ api.api_fuel }}</span>
      <span class="s-icon bull">弾薬: {{ api.api_bull }}</span>
      <span class="s-icon aa">加重対空: {{ kajuTaiku }}<span v-html="remodelKTHtml"></span></span>
      <span class="s-icon aa">艦隊防空: {{ bouku }}<span v-html="remodelBoukuHtml"></span></span>
      <span class="s-icon range">命中率 {{ hit }}% <span v-html="remodelHitHtml"></span></span>
      <span class="s-icon ev">回避率 {{ kaihi }}% <span v-html="remodelKaihiHtml"></span></span>
    </div>
    <hr class="hr" />
    <div class="status">
      <span class="s-icon hp">耐久: {{ api.api_nowhp }}/{{ api.api_maxhp }}</span>
      <span class="s-icon fire"
        >火力: {{ api.api_karyoku[0] }}<span class="remodel">{{ remodelFire }}</span></span
      >
      <span class="s-icon armor"
        >装甲: {{ api.api_soukou[0] }}<span class="remodel">{{ remodelArmor }}</span></span
      >
      <span class="s-icon tor"
        >雷装: {{ api.api_raisou[0] }}<span class="remodel">{{ remodelTor }}</span></span
      >
      <span class="s-icon ev"
        >回避: {{ api.api_kaihi[0] }}<span class="remodel">{{ remodelEv }}</span></span
      >
      <span class="s-icon aa">対空: {{ api.api_taiku[0] }}</span>
      <span class="s-icon tousai">搭載: {{ tousai }}</span>
      <span class="s-icon asw"
        >対潜: {{ api.api_taisen[0] }}<span class="remodel">{{ remodelAsw }}</span></span
      >
      <span class="s-icon speed">速力: {{ sokuText }}</span>
      <span class="s-icon los"
        >索敵: {{ api.api_sakuteki[0] }}<span class="remodel">{{ remodelLos }}</span></span
      >
      <span class="s-icon range">射程: {{ syateiText }}</span>
      <span class="s-icon luck">運: {{ api.api_lucky[0] }}</span>
    </div>
    <hr class="hr" />
    <div class="slot" v-for="(slot, index) in slots" :key="index">
      <span class="slot-onslot mr-1">{{ slotOnSlotText(slot, index) }}</span>
      <span class="slot-img"><img v-if="slot !== undefined" :src="slotTypeImg(slot)" /></span>
      <span class="slot-text" v-if="slot !== undefined"
        >{{ slot.mst.api_name }}
        <img v-if="!!slot.api.api_alv" class="slot-alv-img" :src="slotAlvImg(slot)" />
        <span v-if="!!slot.api.api_level" class="slot-level">★{{ slotLevelText(slot) }}</span>
      </span>
    </div>
    <hr class="hr" v-if="hasSp"/>
    <div class="sp-parts" v-if="htmlTH">
      <div class="sp-container">
        <div class="sp-title one-line">特殊砲撃</div>
        <div class="sp-content" v-html="htmlTH"></div>
      </div>
    </div>
    <div class="sp-parts" v-if="htmlFA">
      <div class="sp-container">
        <div class="sp-title">弾着<br>観測射撃</div>
        <div class="sp-content" v-html="htmlFA"></div>
      </div>
    </div>
    <div class="sp-parts" v-if="htmlAA">
      <div class="sp-container">
        <div class="sp-title">空母<br>カットイン</div>
        <div class="sp-content" v-html="htmlAA"></div>
      </div>
    </div>
    <div class="sp-parts" v-if="htmlTK">
      <div class="sp-container">
        <div class="sp-title">対空<br>カットイン</div>
        <div class="sp-content" v-html="htmlTK"></div>
      </div>
    </div>
    <div class="sp-parts" v-if="htmlYC">
      <div class="sp-container">
        <div class="sp-title">夜戦<br>カットイン</div>
        <div class="sp-content" v-html="htmlYC"></div>
      </div>
    </div>
    <div class="sp-parts" v-if="htmlYS">
      <div class="sp-container">
        <div class="sp-title">夜襲<br>カットイン</div>
        <div class="sp-content" v-html="htmlYS"></div>
      </div>
    </div>
    <div class="sp-parts" v-if="htmlEtc">
      <div class="sp-container">
        <div class="sp-title one-line">その他</div>
        <div class="sp-content" v-html="htmlEtc"></div>
      </div>
    </div>
  </div>
</template>
