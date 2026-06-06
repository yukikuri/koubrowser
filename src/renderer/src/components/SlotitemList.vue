<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { svdata } from '@renderer/store/svdata'
import StarImage from '@renderer/assets/img/star.svg'
import LockImage from '@renderer/assets/img/lock.svg'
import { ApiRange, ApiShip, type ApiSlotitem, KcsUtil, type MstSlotitem, SlotitemImgType, SlotitemType } from '@common/kcs'
import { SlotitemRareTextMap, SyateiText } from '@common/locale'
import { RUtil } from '@renderer/util'
import { SlotImg } from '@renderer/stuff/imgs/slot'

/////////////////////////////////////////////////////////////////////////////////////
// デバッグログ
const DEBUG = 0;

const debug = (...args: any[]) => {
  if (DEBUG) console.debug("[SlotitemList]", ...args);
};

/**
 * 全フィルタcheck
 */
function checkAllFilters(): void {
  filterGroup.value = Object.values(FilterKey) as FilterKey[];
  currentPage.value = 1;
}

/**
 * フィルタクリア
 */
function clearFilters(): void {
  filterGroup.value = [];
  currentPage.value = 1;
}

// -----------------------------------------------------------------
const FilterKey = {
  smallGun: 10,
  smallAaGun: 20,
  mediumGun: 30,
  mediumAaGun: 40,
  largeGun: 50,
  secondaryGun: 60,
  secondaryAaGun: 70,
  torpedo: 80,
  fighter: 90,
  diveBomber: 100,
  torpedoBomber: 110,
  recAircraft: 120,
  recSeaplane: 130,
  seaplaneFighter: 140,
  seaplaneBomber: 150,
  radar: 160,
  aaShell: 170,
  apShell: 180,
  emergencyRepair: 190,
  aaGun: 200,
  sonar: 210,
  depthCharge: 220,
  engineImp: 230,
  landingCraft: 240,
  autogyro: 250,
  aswAircraft: 260,
  bulge: 270,
  searchlight: 280,
  drumcan: 290,
  repairFacility: 300,
  starShell: 310,
  commandFacility: 320,
  aviationPersonnel: 330,
  aaDirector: 340,
  antiGroundEquipment: 350,
  shipPersonnel: 360,
  largeFlyingBoat: 370,
  combatRation: 380,
  supplies: 390,
  landBasedFighter: 400,
  landBasedAttackAircraft: 410,
  landBasedRecAircraft: 420,
  submarineEquipment: 430,
  smokeScreen: 440,
  //barrageBalloon: 450, // 数が多くsmoke screen側に表示する
} as const
type FilterKey = (typeof FilterKey)[keyof typeof FilterKey]

// -----------------------------------------------------------------

const currentPage = ref<number>(1);
const slotitemNameFilter = ref<string>('');
const filterGroup = ref<Array<FilterKey>>([
  // for test
  //FilterKey.fighter,
  //FilterKey.seaplaneBomber
  //FilterKey.aviationPersonnel
  //FilterKey.secondaryGun
  //FilterKey.sonar
  //FilterKey.landBasedAttackAircraft
  //FilterKey.largeGun
]);
watch(filterGroup, () => {
  currentPage.value = 1;
}, { 
  immediate: false, 
  deep: false
});
watch(slotitemNameFilter, () => {
  currentPage.value = 1;
}, {
  immediate: false,
  deep: false,
});

function getTypeImgSrc(imgType: SlotitemImgType): string {
  return SlotImg.getTypeSrc(imgType);
}

function getTypeImgSrcFromMst(mst: MstSlotitem): string {
  return getTypeImgSrc(KcsUtil.slotitemImgType(mst));
}

function getSlotitemImgSrc(data: SlotItemData): string {
  return getTypeImgSrcFromMst(data.mst);
}

function getSlotitemALevelImg(data: SlotItemData): string {
  return RUtil.slotALevelImg(data.api.api_alv ?? 0)
}

interface SlotItemData {
  api: ApiSlotitem
  mst: MstSlotitem 
  key: FilterKey
  internalDetail: number
}

function getLevelText(data: SlotItemData): string {
  const level = data.api.api_level ?? 0
  if (level <= 0) {
    return ''
  }
  return level == 10 ? 'MAX' : '+'+level
}

function getRareText(data: SlotItemData): string {
  return SlotitemRareTextMap[data.mst.api_rare] || ''
}

const getRangeText = (leng: ApiRange): string => {
  return SyateiText[leng] || ''
}

const RangeClassMap: { [key: number]: string } = {
  0: '',
  1: 'tan',
  2: 'tyuu',
  3: 'tyou',
  4: 'tyoutyou',
  5: 'tyoutyou-plus',
}

const remodelFloor = (val: number): number => {
  return Math.floor(val * 10) / 10;
}

const BuildHtmlName = {
  fire: 'houg',
  hit: 'houm',
  tor: 'raig',
  tor_hit: 'raim',
  bom: 'baku',
  aa: 'tyku',
  kb: 'kb',
  kt: 'kt',
  asw: 'tais',
  asw_hit: 'asw_hit',
  ev: 'houk',
  raik: 'raik',
  los: 'saku',
  armor: 'souk',
} as const
export type BuildHtmlName = (typeof BuildHtmlName)[keyof typeof BuildHtmlName]

interface HtmlParts {
  remodels: string[]
  basics: string[]
}

const buildHtmlMap: { [key: string]: {
  displayName: string
  className: string
  levelFunc: (mst: MstSlotitem, level: number | undefined) => number
 } } = {
  'houg': {
    displayName: '火力',
    className: 'fire',
    levelFunc: KcsUtil.fireFromLevel,
  },
  'houm': {
    displayName: '命中',
    className: 'hit',
    levelFunc: KcsUtil.hitFromLevel,
  },
  'raig': {
    displayName: '雷装',
    className: 'tor',
    levelFunc: KcsUtil.torFromLevel,
  },
  'raim': {
    displayName: '雷命',
    className: 'torHit',
    levelFunc: KcsUtil.torHitFromLevel,
  },
  'baku': {
    displayName: '爆装',
    className: 'bom',
    levelFunc: KcsUtil.bomFromLevel,
  },
  'tyku': {
    displayName: '対空',
    className: 'aa',
    levelFunc: KcsUtil.aaFromLevel,
  },
  'kb': {
    displayName: '艦防',
    className: 'kb',
    levelFunc: KcsUtil.kbFromLevel,
  },
  'kt': {
    displayName: '加重',
    className: 'kt',
    levelFunc: KcsUtil.ktFromLevel,
  },
  'tais': {
    displayName: '対潜',
    className: 'asw',
    levelFunc: KcsUtil.aswFromLevel,
  },
  'asw_hit': {
    displayName: '対命',
    className: 'asw_hit',
    levelFunc: KcsUtil.hitAswFromLevel,
  },

  'houk': {
    displayName: '回避',
    className: 'ev',
    levelFunc: KcsUtil.evFromLevel,
  },
  'raik': {
    displayName: '雷回',
    className: 'raik',
    levelFunc: KcsUtil.evTorFromLevel,
  },
  'saku': {
    displayName: '索敵',
    className: 'los',
    levelFunc: KcsUtil.losFromLevel,
  },
  'souk': {
    displayName: '装甲',
    className: 'armor',
    levelFunc: KcsUtil.armorFromLevel,
  }
}

const getBaseParam = (mst: MstSlotitem, name: BuildHtmlName): number => {
  if (name === 'kb') {
    return KcsUtil.kbFromMst(mst);
  }
  if (name === 'kt') {
    return KcsUtil.ktFromMst(mst);
  }
  if (name == 'raim') {
    // invalid api data
    return 0;
  }
  return (mst as any)['api_'+name] ?? 0
}

const buildParamHtml = (
  data: SlotItemData, 
  parts: HtmlParts, 
  name: BuildHtmlName,
  remodelNames: BuildHtmlName[]): void => {
  const stuff = buildHtmlMap[name]
  if (! stuff) {
    return
  }  
  const api = data.api
  const mst = data.mst
  const add = stuff.levelFunc(mst, api.api_level);
  const param = getBaseParam(mst, name)
  const value = remodelFloor(param + add)
  if (! value) {
    return 
  }

  const className = add ? 'nowrap-text plus-color' : 'nowrap-text'
  const plus_minus = value < 0 ? '' : '+'
  const html = `<span class="${stuff.className} ${className}">${stuff.displayName}<span>${plus_minus}${value}</span></span>`
  const isRemodelName = remodelNames.includes(name)
  if (isRemodelName) {
    parts.remodels.push(html)
  } else {
    parts.basics.push(html)
  }
}

const buildRangeHtml = (data: SlotItemData, parts: HtmlParts): void => {
  const mst = data.mst
  if (! mst.api_leng) {
    return 
  }
  const className = RangeClassMap[mst.api_leng] || ''
  const rangeText = getRangeText(mst.api_leng)
  const html = `<span class="range nowrap-text">射程 <span class="${className}">${rangeText}</span></span>`
  parts.basics.push(html)
}

function detailsClass(data: SlotItemData) : string {
  return `filter-key-${data.key}`;
}

function getDetailHtml(data: SlotItemData): string {
  const parts: HtmlParts = {
    remodels: [],
    basics: [],
  }
  const buildOrder = getBuildParamOrder(data);
  const remodelNames = getRemodelNames(data);
  buildOrder.forEach((name) => {
    buildParamHtml(data, parts, name, remodelNames);
  })
  buildRangeHtml(data, parts)
  if (! parts.remodels.length && ! parts.basics.length) {
    return `<div class="basics"><div class="detail-line">-</div></div>`;
  }
  let html = '';
  const sepTag = '<span class="param-separator">/</span>';
  if (parts.remodels.length) {
    html += `<div class="remodels"><div class="detail-line">${parts.remodels.join(sepTag)}</div></div>`;
  }
  if (parts.basics.length) {
    html += `<div class="basics"><div class="detail-line">${parts.basics.join(sepTag)}</div></div>`;
  }
  return html;
}

// -----------------------------------------------------------------
// filter
const equipCache = new Map<number, ApiShip | null>() // slotitem_id -> ship
const filterCounter: Map<FilterKey, number> = new Map<FilterKey, number>() // key: FilterKey, count: number

const isMatch = (filters: FilterCheckboxInfo[], mst: MstSlotitem): number => {
  const itemType = KcsUtil.slotitemType(mst);
  return filters.findIndex((filter) => {
    const typeMatched = filter.types.find((type) => type === itemType)
    if (! typeMatched) {
      return false;
    }
    if (typeMatched && filter.imgTypes) {
      const imgType = KcsUtil.slotitemImgType(mst);
      const imgMatched = filter.imgTypes.find((it) => it === imgType)
      return !! imgMatched
    }
    return true;
  })
}

const datas = computed<SlotItemData[]>(() => {
  debug('get datas called')
  filterCounter.clear()
  equipCache.clear()

  const ret: SlotItemData[] = []
  const list = svdata.slotitems;//.slice(0,10);
  const filters = getFilterTypes()

  console.time('filter slotitem datas')
  if (! filters.length) {
    console.timeEnd('filter slotitem datas')
    return [];
  }

  // init counter
  filters.forEach((filter) => {
    filterCounter.set(filter.key, 0)
  })

  // do filter
  list.forEach((api) => {
    const mst = svdata.mstSlotitem(api.api_slotitem_id)
    if (!mst) {
      return
    }

    const index = isMatch(filters, mst)
    if (index < 0) {
      return ;
    }
    const filter = filters[index]
    filterCounter.set(filter.key, filterCounter.get(filter.key)! + 1)

    let internalDetail = -filter.key*1000000
    if (filter.internalDetailCalc) {
      internalDetail += filter.internalDetailCalc(mst, api)
    }
    ret.push({ api, mst, key: filter.key, internalDetail })
  })
  console.timeEnd('filter slotitem datas')
  debug(filterCounter)

  // no sort. Sorting is handled by b-table.
  //
  // console.time('filter slotitem datas(sort)')
  // ret.sort((i1, i2) => {
  //   if (i1.mst.api_type[2] === i2.mst.api_type[2]) {
  //     if (i1.api.api_slotitem_id === i2.api.api_slotitem_id) {
  //       return (i2.api.api_level ?? 0) - (i1.api.api_level ?? 0)
  //     }
  //     return i1.api.api_slotitem_id - i2.api.api_slotitem_id
  //   }
  //   return i1.mst.api_type[2] - i2.mst.api_type[2]
  // })
  // console.timeEnd('filter slotitem datas(sort)')

  return ret
})

interface SlotitemNameCandidate {
  mst: MstSlotitem
  count: number
}

const slotitemNameCandidates = computed<SlotitemNameCandidate[]>(() => {
  const nameCounts = new Map<number, number>()
  datas.value.forEach((data) => {
    nameCounts.set(data.mst.api_id, (nameCounts.get(data.mst.api_id) ?? 0) + 1)
  })
  return [...nameCounts.entries()].map(([id, count]) => ({ mst: svdata.mstSlotitem(id)!, count }))
})

const filteredSlotitemNameCandidates = computed<SlotitemNameCandidate[]>(() => {
  const nameFilter = slotitemNameFilter.value.trim()
  if (!nameFilter) {
    const ret = slotitemNameCandidates.value
    return [...ret].sort((c1, c2) => c1.mst.api_sortno - c2.mst.api_sortno)
  }
  const ret = slotitemNameCandidates.value.filter((candidate) => candidate.mst.api_name.includes(nameFilter))
  return [...ret].sort((c1, c2) => c1.mst.api_sortno - c2.mst.api_sortno)
})

const filteredDatas = computed<SlotItemData[]>(() => {
  const nameFilter = slotitemNameFilter.value.trim()
  if (!nameFilter) {
    return datas.value
  }
  return datas.value.filter((data) => data.mst.api_name.includes(nameFilter))
})

function onSelectSlotitemNameCandidate(candidate: SlotitemNameCandidate | null): void {
  if (!candidate) {
    return
  }
  slotitemNameFilter.value = candidate.mst.api_name
}

function getCachedEquipShip(slotitem_id: number): ApiShip | undefined {
  // check cached
  const cached = equipCache.get(slotitem_id)
  if (cached === null) {
    return undefined
  } else if (cached !== undefined) {
    return cached
  }

  // search ship
  const api = svdata.ships.find((ship) => {
    if (ship.api_slot.includes(slotitem_id)) {
      return true
    }
    if (ship.api_slot_ex === slotitem_id) {
      return true
    }
    return false
  })
  if (! api) {
    equipCache.set(slotitem_id, null)
    return undefined
  }
  equipCache.set(slotitem_id, api)
  return api;
}

function getEquipShipExists(data: SlotItemData): boolean {
  const api = getCachedEquipShip(data.api.api_id)
  return !! api
}

function getEquipShipTitle(data: SlotItemData): string {
  const api = getCachedEquipShip(data.api.api_id)
  if (! api) {
    return ''
  }
  return `Lv: ${api.api_lv} ${getEquipShipName(data)}`
}

function getEquipShipName(data: SlotItemData): string {
  const api = getCachedEquipShip(data.api.api_id)
  if (! api) {
    return ''
  }
  const mst = svdata.mstShip(api.api_ship_id)
  return mst ? mst.api_name : ''
}

function getEquipShipDeckNo(data: SlotItemData): string {
  const api = getCachedEquipShip(data.api.api_id)
  if (! api) {
    return ''
  }
  const deckNo = svdata.deckPorts.findIndex((deck) => 
    deck.api_ship.includes(api.api_id))
  if (deckNo < 0) {
    return ''
  }
  return `第${deckNo + 1}艦隊`
}

function getEquipShipLv(data: SlotItemData): string {
  const api = getCachedEquipShip(data.api.api_id)
  if (! api) {
    return ''
  }
  return api.api_lv.toString()
}

const listHeight = computed<number>(() => {
  return 745;
})
const perPage = ref<number>(26);

// -----------------------------------------------------------------
// counter
interface CounterItem {
  imgType: SlotitemImgType
  count: number
}
const counters = computed<CounterItem[]>(() => {
  debug('counters called', filterCounter.size)
  //debug(filterCounter)
  datas.value; // trigger recompute
  const ret: CounterItem[] = []
  filterCounter.forEach((count, key) => {
    const filterInfos = filterCheckboxInfos().find((info) => info.key === key)
    if (filterInfos) {
      ret.push({
        imgType: filterInfos.checkboxImgType,
        count,
      })
    }
  })
  return ret;
})

// -----------------------------------------------------------------
// sorting state
const defaultSort = ref<string>('internalDetail')
const currentSortField = ref<string>('')
const currentSortOrder = ref<'asc' | 'desc' | ''>('')

function onSort(field: string, order:'asc' | 'desc'): void {
  debug('slotitem list onSort sorting:', order, 'sorting.field:', field)
  currentSortField.value = field
  currentSortOrder.value = order
}

function isSortedField(field: string): boolean {
  return currentSortField.value === field
}

function getOrderText(): string {
  if (currentSortOrder.value === 'asc') {
    return '▲'
  } else if (currentSortOrder.value === 'desc') {
    return '▼'
  }
  return ''
}

const emptyText = computed<string>(() => {
  if (filterGroup.value.length === 0) {
    return '表示する装備種別を選択してください';
  }
  return '該当する装備が見つかりません';
})

interface FilterCheckboxInfo {
  key: FilterKey
  title: string
  checkboxImgType: SlotitemImgType
  types: SlotitemType[]
  imgTypes?: [SlotitemImgType]
  internalDetailCalc?: (mst: MstSlotitem, api: ApiSlotitem) => number
}

const internalDetailFire = (mst: MstSlotitem, api: ApiSlotitem): number => {
  return KcsUtil.fireFromLevel(mst, api.api_level) + mst.api_houg;
}

const internalDetailFireForMainGun = (mst: MstSlotitem, api: ApiSlotitem): number => {
  return (KcsUtil.fireFromLevel(mst, api.api_level) + mst.api_houg)*100 +
    (KcsUtil.hitFromLevel(mst, api.api_level) + mst.api_houm)
}

const internalDetailKb = (mst: MstSlotitem, api: ApiSlotitem): number => {
  return KcsUtil.kbFromLevel(mst, api.api_level) + KcsUtil.kbFromMst(mst)
}

const internalDetailTor = (mst: MstSlotitem, api: ApiSlotitem): number => {
  return KcsUtil.torFromLevel(mst, api.api_level) + mst.api_raig;
}

const internalDetailAa = (mst: MstSlotitem, api: ApiSlotitem): number => {
  return KcsUtil.aaFromLevel(mst, api.api_level) + mst.api_tyku;
}

const internalDetailBom = (mst: MstSlotitem, api: ApiSlotitem): number => {
  return (KcsUtil.bomFromLevel(mst, api.api_level) + mst.api_baku)
}

const internalDetailBomAa = (mst: MstSlotitem, api: ApiSlotitem): number => {
  return (KcsUtil.bomFromLevel(mst, api.api_level) + mst.api_baku) +
    (KcsUtil.aaFromLevel(mst, api.api_level) + mst.api_tyku);    
}

const internalDetailBomTorForLandAttacker = (mst: MstSlotitem, api: ApiSlotitem): number => {
  return ((KcsUtil.bomFromLevel(mst, api.api_level) + mst.api_baku) +
    (KcsUtil.torFromLevel(mst, api.api_level) + mst.api_raig))*100 +
    (KcsUtil.aaFromLevel(mst, api.api_level) + mst.api_tyku);
}

const internalDetailHit = (mst: MstSlotitem, api: ApiSlotitem): number => {
  return KcsUtil.hitFromLevel(mst, api.api_level) + mst.api_houm;
}

const internalDetailLos = (mst: MstSlotitem, api: ApiSlotitem): number => {
  return KcsUtil.losFromLevel(mst, api.api_level) + mst.api_saku;
}

const internalDetailAsw = (mst: MstSlotitem, api: ApiSlotitem): number => {
  return KcsUtil.aswFromLevel(mst, api.api_level) + mst.api_tais;
}

const internalDetailEv = (mst: MstSlotitem, api: ApiSlotitem): number => {
  return KcsUtil.evFromLevel(mst, api.api_level) + mst.api_houk;
}

const internalDetailArmor = (mst: MstSlotitem, api: ApiSlotitem): number => {
  return KcsUtil.armorFromLevel(mst, api.api_level) + mst.api_souk;
}

const internalDetailKt = (mst: MstSlotitem, api: ApiSlotitem): number => {
  return KcsUtil.ktFromLevel(mst, api.api_level) + KcsUtil.ktFromMst(mst)
}

function filterCheckboxInfos(): FilterCheckboxInfo[] {
  return [
    // 小口径主砲
    {
      key: FilterKey.smallGun,
      title: '小口径主砲',
      checkboxImgType: SlotitemImgType.syuhou_syou,
      types: [
        SlotitemType.SmallMainGun,
      ],
      imgTypes: [
        SlotitemImgType.syuhou_syou,
      ],
      internalDetailCalc: internalDetailFireForMainGun,
    },
    // 小口径主砲(高角砲)
    {
      key: FilterKey.smallAaGun,
      title: '小口径主砲(高角砲)',
      checkboxImgType: SlotitemImgType.koukakuhou,
      types: [
        SlotitemType.SmallMainGun,
      ],
      imgTypes: [
        SlotitemImgType.koukakuhou,
      ],
      internalDetailCalc: internalDetailKb,
    },
    // 中口径主砲
    {
      key: FilterKey.mediumGun,
      title: '中口径主砲',
      checkboxImgType: SlotitemImgType.syuhou_tyuu,
      types: [
        SlotitemType.MediumMainGun,
      ],
      imgTypes: [
        SlotitemImgType.syuhou_tyuu,
      ],
      internalDetailCalc: internalDetailFireForMainGun,
    },
    // 中口径主砲(高角砲)
    {
      key: FilterKey.mediumAaGun,
      title: '中口径主砲(高角砲)',
      checkboxImgType: SlotitemImgType.koukakuhou,
      types: [
        SlotitemType.MediumMainGun,
      ],
      imgTypes: [
        SlotitemImgType.koukakuhou,
      ],
      internalDetailCalc: internalDetailKb,
    },
    // 大口径主砲
    {
      key: FilterKey.largeGun,
      title: '大口径主砲',
      checkboxImgType: SlotitemImgType.syuhou_dai,
      types: [
        SlotitemType.LargeMainGun,
      ],
      internalDetailCalc: internalDetailFireForMainGun,
    },
    // 副砲
    {
      key: FilterKey.secondaryGun,
      title: '副砲',
      checkboxImgType: SlotitemImgType.fukuhou,
      types: [
        SlotitemType.SecondaryGun,
      ],
      imgTypes: [
        SlotitemImgType.fukuhou,
      ],
      internalDetailCalc: internalDetailFireForMainGun,
    },
    // 副砲(高角砲)
    {
      key: FilterKey.secondaryAaGun,
      title: '副砲(高角砲)',
      checkboxImgType: SlotitemImgType.koukakuhou,
      types: [
        SlotitemType.SecondaryGun,
      ],
      imgTypes: [
        SlotitemImgType.koukakuhou,
      ],
      internalDetailCalc: internalDetailKb,
    },
    // 魚雷
    {
      key: FilterKey.torpedo,
      title: '魚雷/甲標的/潜水艦魚雷',
      checkboxImgType: SlotitemImgType.gyorai,
      types: [
        SlotitemType.Torpedo,
        SlotitemType.MidgetSubmarine,
        SlotitemType.SubmarineTorpedo,
      ],
      internalDetailCalc: internalDetailTor,
    },
    // 艦上戦闘機
    {
      key: FilterKey.fighter,
      title: '艦上戦闘機',
      checkboxImgType: SlotitemImgType.kanjyou_sentouki,
      types: [
        SlotitemType.Fighter,
      ],
      internalDetailCalc: internalDetailAa,
    },
    // 艦上爆撃機
    {
      key: FilterKey.diveBomber,
      title: '艦上爆撃機',
      checkboxImgType: SlotitemImgType.kanjyou_bakugekiki,
      types: [
        SlotitemType.DiveBomber,
      ],
      internalDetailCalc: internalDetailBomAa,
    },
    // 艦上攻撃機
    {
      key: FilterKey.torpedoBomber,
      title: '艦上攻撃機',
      checkboxImgType: SlotitemImgType.kanjyou_kougekiki,
      types: [
        SlotitemType.TorpedoBomber,
      ],
      internalDetailCalc: internalDetailTor,
    },
    // 艦上偵察機
    {
      key: FilterKey.recAircraft,
      title: '艦上偵察機', 
      checkboxImgType: SlotitemImgType.kanjyou_teisatuki,
      types: [
        SlotitemType.RecAircraft,
      ],
      internalDetailCalc: internalDetailLos,
    },
    // 水上偵察機
    {
      key: FilterKey.recSeaplane,
      title: '水上偵察機',
      checkboxImgType: SlotitemImgType.suitei,
      types: [
        SlotitemType.RecSeaplane,
      ],
      internalDetailCalc: internalDetailLos,
    },
    // 水上戦闘機
    {
      key: FilterKey.seaplaneFighter,
      title: '水上戦闘機',
      checkboxImgType: SlotitemImgType.suijyou_sentouki,
      types: [
        SlotitemType.SeaplaneFighter,
      ],
      internalDetailCalc: internalDetailAa,
    },
    // 水上爆撃機
    {
      key: FilterKey.seaplaneBomber,
      title: '水上爆撃機',
      checkboxImgType: SlotitemImgType.suitei,
      types: [
        SlotitemType.SeaplaneBomber,
      ],
      internalDetailCalc: internalDetailBom,
    },
    // 電探
    {
      key: FilterKey.radar,
      title: '電探',
      checkboxImgType: SlotitemImgType.dentan,
      types: [
        SlotitemType.SmallRadar,
        SlotitemType.LargeRadar,
      ],
      internalDetailCalc: internalDetailHit,
    },
    // 対空強化弾
    {
      key: FilterKey.aaShell,
      title: '対空強化弾',
      checkboxImgType: SlotitemImgType.sansikidan,
      types: [
        SlotitemType.AAShell,
      ],
      internalDetailCalc: internalDetailFire
    },
    // 対艦強化弾
    {
      key: FilterKey.apShell,
      title: '対艦強化弾',
      checkboxImgType: SlotitemImgType.tekoudan,
      types: [
        SlotitemType.APShell,
      ],
      internalDetailCalc: internalDetailFire
    },
    // ダメコン
    {
      key: FilterKey.emergencyRepair,
      title: 'ダメコン',
      checkboxImgType: SlotitemImgType.damekon,
      types: [
        SlotitemType.EmergencyRepair,
      ]
    },
    // 機銃
    {
      key: FilterKey.aaGun,
      title: '機銃',
      checkboxImgType: SlotitemImgType.kijyu,
      types: [
        SlotitemType.AAGun,
      ],
      internalDetailCalc: internalDetailKt,
    },
    // ソナー
    {
      key: FilterKey.sonar,
      title: 'ソナー',
      checkboxImgType: SlotitemImgType.sonar,
      types: [
        SlotitemType.Sonar,
        SlotitemType.LargeSonar,
      ],
      internalDetailCalc: internalDetailAsw,
    },
    // 爆雷
    {
      key: FilterKey.depthCharge,
      title: '爆雷',
      checkboxImgType: SlotitemImgType.bakurai,
      types: [
        SlotitemType.DepthCharge,
      ],
      internalDetailCalc: internalDetailAsw,
    },
    // 機関部強化
    {
      key: FilterKey.engineImp,
      title: '機関部強化',
      checkboxImgType: SlotitemImgType.engine,
      types: [
        SlotitemType.EngineImp,
      ],
      internalDetailCalc: internalDetailEv,
    },
    // 上陸用舟艇
    {
      key: FilterKey.landingCraft,
      title: '上陸用舟艇',
      checkboxImgType: SlotitemImgType.daihatu,
      types: [
        SlotitemType.LandingCraft,
        SlotitemType.SpecialATank,
        SlotitemType.LandingForce,
      ],
      internalDetailCalc: internalDetailFire,
    },
    // オートジャイロ
    {
      key: FilterKey.autogyro,
      title: 'オートジャイロ',  
      checkboxImgType: SlotitemImgType.heri,
      types: [
        SlotitemType.Autogyro,
      ],
      internalDetailCalc: internalDetailAsw,
    },
    // 対潜哨戒機
    {
      key: FilterKey.aswAircraft,
      title: '対潜哨戒機',
      checkboxImgType: SlotitemImgType.taisensyoukaiki,
      types: [
        SlotitemType.ASBAircraft,
      ],
      internalDetailCalc: internalDetailAsw,
    },
    // バルジ
    {
      key: FilterKey.bulge,
      title: 'バルジ',
      checkboxImgType: SlotitemImgType.bulge,
      types: [
        SlotitemType.ExtraArmor,
        SlotitemType.MediumExtraArmor,
        SlotitemType.LargeExtraArmor,
      ],
      internalDetailCalc: internalDetailArmor,
    },
    // 探照灯
    {
      key: FilterKey.searchlight,
      title: '探照灯',
      checkboxImgType: SlotitemImgType.tansyoutou,
      types: [
        SlotitemType.Searchlight,
        SlotitemType.LargeSearchlight,
      ],
      internalDetailCalc: internalDetailFire,
    },
    // ドラム缶
    {
      key: FilterKey.drumcan,
      title: 'ドラム缶',
      checkboxImgType: SlotitemImgType.drumcan,
      types: [
        SlotitemType.STContainer,
      ]
    },
    // 艦艇修理施設
    {
      key: FilterKey.repairFacility,
      title: '艦艇修理施設',
      checkboxImgType: SlotitemImgType.syuurisisetu,
      types: [
        SlotitemType.RepairFacility,
      ]
    },
    // 照明弾
    {
      key: FilterKey.starShell,
      title: '照明弾',
      checkboxImgType: SlotitemImgType.syoumeidan,
      types: [
        SlotitemType.StarShell,
      ]
    },
    // 司令部施設
    {
      key: FilterKey.commandFacility,
      title: '司令部施設',
      checkboxImgType: SlotitemImgType.sireibu,
      types: [
        SlotitemType.CommandFacility,
      ],
      internalDetailCalc: internalDetailFire,
    },
    // 航空要員
    {
      key: FilterKey.aviationPersonnel,
      title: '航空要員',
      checkboxImgType: SlotitemImgType.supana,
      types: [
        SlotitemType.AviationPersonnel,
      ],
      internalDetailCalc: internalDetailFire,
    },
    // 高射装置
    {
      key: FilterKey.aaDirector,
      title: '高射装置',
      checkboxImgType: SlotitemImgType.kousyasouti,
      types: [
        SlotitemType.AADirector,
      ],
      internalDetailCalc: internalDetailKt,
    },
    // 対地装備
    {
      key: FilterKey.antiGroundEquipment,
      title: '対地装備',
      checkboxImgType: SlotitemImgType.taiti,
      types: [
        SlotitemType.AntiGroundEquipment,
      ],
      internalDetailCalc: internalDetailFire,
    },
    // 水上艦要員
    {
      key: FilterKey.shipPersonnel,
      title: '水上艦要員',
      checkboxImgType: SlotitemImgType.mihariin,
      types: [
        SlotitemType.ShipPersonnel,
      ],
      internalDetailCalc: internalDetailFire,
    },
    // 大型飛行艇
    {
      key: FilterKey.largeFlyingBoat,
      title: '大型飛行艇',
      checkboxImgType: SlotitemImgType.oogata_hikoutei,
      types: [
        SlotitemType.LargeFlyingBoat,
      ],
      internalDetailCalc: internalDetailLos,
    },
    // 戦闘糧食
    {
      key: FilterKey.combatRation,
      title: '戦闘糧食',
      checkboxImgType: SlotitemImgType.sentouryousyoku,
      types: [
        SlotitemType.CombatRation,
      ]
    },
    // 補給物資
    {
      key: FilterKey.supplies,
      title: '補給物資',
      checkboxImgType: SlotitemImgType.hokyuubussi,
      types: [
        SlotitemType.Supplies,
      ]
    },
    // 陸戦
    {
      key: FilterKey.landBasedFighter,
      title: '陸上戦闘機',
      checkboxImgType: SlotitemImgType.rikusen,
      types: [
        SlotitemType.LandFighter,
      ],
      internalDetailCalc: internalDetailAa,
    },
    // naikatei: 36, // 内火艇
    // 陸攻
    {
      key: FilterKey.landBasedAttackAircraft,
      title: '陸上攻撃機',
      checkboxImgType: SlotitemImgType.rikukou,
      types: [
        SlotitemType.LandAttackAircraft,
      ],
      internalDetailCalc: internalDetailBomTorForLandAttacker,
    },
    // kyokusen: 38, // 局戦
    // 陸戦
    // kyokusen: 38, // 局戦
    // 噴式戦闘爆撃機
    {
      key: FilterKey.landBasedRecAircraft,
      title: '噴式戦闘爆撃機',
      checkboxImgType: SlotitemImgType.funsiki1,
      types: [
        SlotitemType.JetFighter,
        SlotitemType.JetFighterBomber,
      ]
    },
    // funsiki2: 40, // 噴式戦闘爆撃機
    // 輸送資材
    // {
    //   key: FilterKey.surfaceShipEquipment,
    //   checkboxImgType: SlotitemImgType.yusoukizai,
    //   types: [
    //     SlotitemType.TransMaterial,
    //   ]
    // },
    // 55:  防空気球
    // {
    //   checkboxImgType: SlotitemImgType.bouku_kikyu,
    //   types: [
    //     SlotitemType.SubmarineEquipment,
    //   ]
    // },
    // 潜水艦装備
    {
      key: FilterKey.submarineEquipment,
      title: '潜水艦装備',
      checkboxImgType: SlotitemImgType.sensui_soubi,
      types: [
        SlotitemType.SubmarineEquipment,
      ],
      internalDetailCalc: internalDetailEv,
    },
    // yasen: 45, // 夜間戦闘機
    // yakou: 46, // 夜間攻撃機
    // rikutaisen: 47, // 対潜哨戒機
    // rikukou_oogata: 48, // 大型陸上機
    // rikukou_jyuubaku: 49, // 大型陸上機(重爆)
    // yatei: 50, // 夜偵
    // yakan_zuiun: 51 // 夜間瑞雲

    // 発煙装置(気球込み)
    {
      key: FilterKey.smokeScreen,
      title: '発煙装置/防空気球',
      checkboxImgType: SlotitemImgType.hatuensouti,
      types: [
        SlotitemType.SurfaceShipEquipment,
      ],
      internalDetailCalc: internalDetailFire,
    },
    // {
    //   key: FilterKey.barrageBalloon,
    //   checkboxImgType: SlotitemImgType.bouku_kikyu,
    //   types: [
    //     SlotitemType.SurfaceShipEquipment,
    //   ],
    //   imgTypes: [
    //     SlotitemImgType.bouku_kikyu,
    //   ]
    // },
  ] 
}

function getFilterTypes(): FilterCheckboxInfo[] {
  const ret: FilterCheckboxInfo[] = []
  const infos = filterCheckboxInfos()
  const checked = filterGroup.value;
  infos.forEach((info) => {
    const found = checked.find((key) => key === info.key)
    if (found) {
      ret.push(info)
    }
  })
  return ret
}

const defOrder: BuildHtmlName[] = [
  BuildHtmlName.fire,
  BuildHtmlName.hit,
  BuildHtmlName.tor,
  BuildHtmlName.tor_hit,
  BuildHtmlName.bom,
  BuildHtmlName.aa,
  BuildHtmlName.kb,
  BuildHtmlName.kt,
  BuildHtmlName.asw,
  BuildHtmlName.asw_hit,
  BuildHtmlName.ev,
  BuildHtmlName.raik,
  BuildHtmlName.los,
  BuildHtmlName.armor,
];

const MainGunOrder: BuildHtmlName[] = [
  BuildHtmlName.fire,
  BuildHtmlName.hit,
  BuildHtmlName.aa,
  BuildHtmlName.ev,
  BuildHtmlName.armor,
  BuildHtmlName.kb,
  BuildHtmlName.kt,
  BuildHtmlName.asw,
  BuildHtmlName.asw_hit,
  BuildHtmlName.tor,
  BuildHtmlName.tor_hit,
  BuildHtmlName.bom,
  BuildHtmlName.raik,
  BuildHtmlName.los,
];

const AaGunOrder: BuildHtmlName[] = [
  BuildHtmlName.kt,
  BuildHtmlName.fire,
  BuildHtmlName.tor,
  BuildHtmlName.tor_hit,
  BuildHtmlName.aa,
  BuildHtmlName.kb,
  BuildHtmlName.ev,
  BuildHtmlName.raik,
  BuildHtmlName.los,
  BuildHtmlName.armor,
  BuildHtmlName.hit,
  BuildHtmlName.bom,
  BuildHtmlName.asw,
  BuildHtmlName.asw_hit,
];

const AaDirectorOrderKt: BuildHtmlName[] = [
  BuildHtmlName.kt,
  BuildHtmlName.kb,
  BuildHtmlName.fire,
  BuildHtmlName.hit,
  BuildHtmlName.aa,
  BuildHtmlName.ev,
  BuildHtmlName.raik,
  BuildHtmlName.los,
  BuildHtmlName.armor,
  BuildHtmlName.bom,
  BuildHtmlName.asw,
  BuildHtmlName.asw_hit,
  BuildHtmlName.tor,
  BuildHtmlName.tor_hit,
];

const AviationPersonnelOrder: BuildHtmlName[] = [
  BuildHtmlName.fire,
  BuildHtmlName.hit,
  BuildHtmlName.bom,
  BuildHtmlName.aa,
  BuildHtmlName.kb,
  BuildHtmlName.kt,
  BuildHtmlName.asw,
  BuildHtmlName.asw_hit,
  BuildHtmlName.ev,
  BuildHtmlName.raik,
  BuildHtmlName.los,
  BuildHtmlName.armor,
  BuildHtmlName.tor,
  BuildHtmlName.tor_hit,
];

const AaDirectorOrderKb: BuildHtmlName[] = [
  BuildHtmlName.kb,
  BuildHtmlName.kt,
  BuildHtmlName.fire,
  BuildHtmlName.hit,
  BuildHtmlName.aa,
  BuildHtmlName.ev,
  BuildHtmlName.raik,
  BuildHtmlName.los,
  BuildHtmlName.armor,
  BuildHtmlName.bom,
  BuildHtmlName.asw,
  BuildHtmlName.asw_hit,
  BuildHtmlName.tor,
  BuildHtmlName.tor_hit,
];

const TorpedoOrder: BuildHtmlName[] =
[
  BuildHtmlName.tor,
  BuildHtmlName.tor_hit,
  BuildHtmlName.fire,
  BuildHtmlName.hit,
  BuildHtmlName.bom,
  BuildHtmlName.aa,
  BuildHtmlName.kb,
  BuildHtmlName.kt,
  BuildHtmlName.asw,
  BuildHtmlName.asw_hit,
  BuildHtmlName.ev,
  BuildHtmlName.raik,
  BuildHtmlName.los,
  BuildHtmlName.armor,        
];

const FighterBuildOrder: BuildHtmlName[] = [
  BuildHtmlName.aa,
  BuildHtmlName.ev,
  BuildHtmlName.hit,
  BuildHtmlName.raik,
  BuildHtmlName.los,
  BuildHtmlName.armor,  
  BuildHtmlName.fire,
  BuildHtmlName.bom,
  BuildHtmlName.tor,
  BuildHtmlName.tor_hit,
  BuildHtmlName.asw,
  BuildHtmlName.asw_hit,
  BuildHtmlName.kb,
  BuildHtmlName.kt,
];

const DiveBomberOrder: BuildHtmlName[] = [
  BuildHtmlName.bom,
  BuildHtmlName.aa,
  BuildHtmlName.asw,
  BuildHtmlName.fire,
  BuildHtmlName.hit,
  BuildHtmlName.tor,
  BuildHtmlName.tor_hit,
  BuildHtmlName.kb,
  BuildHtmlName.kt,
  BuildHtmlName.asw_hit,
  BuildHtmlName.ev,
  BuildHtmlName.raik,
  BuildHtmlName.los,
  BuildHtmlName.armor,
];

const TorpedoBomberOrder: BuildHtmlName[] = [
  BuildHtmlName.tor,
  BuildHtmlName.asw,
  BuildHtmlName.fire,
  BuildHtmlName.hit,
  BuildHtmlName.aa,
  BuildHtmlName.bom,
  BuildHtmlName.tor_hit,
  BuildHtmlName.kb,
  BuildHtmlName.kt,
  BuildHtmlName.asw_hit,
  BuildHtmlName.ev,
  BuildHtmlName.raik,
  BuildHtmlName.los,
  BuildHtmlName.armor,
];

const SeaplaneBuildOrder: BuildHtmlName[] = [
  BuildHtmlName.los,
  BuildHtmlName.tor,
  BuildHtmlName.asw,
  BuildHtmlName.fire,
  BuildHtmlName.hit,
  BuildHtmlName.aa,
  BuildHtmlName.bom,
  BuildHtmlName.tor_hit,
  BuildHtmlName.kb,
  BuildHtmlName.kt,
  BuildHtmlName.asw_hit,
  BuildHtmlName.ev,
  BuildHtmlName.raik,
  BuildHtmlName.armor,
];

const RecSeaplaneBuildOrder: BuildHtmlName[] = [
  BuildHtmlName.los,
  BuildHtmlName.hit,
  BuildHtmlName.ev,
  BuildHtmlName.aa,
  BuildHtmlName.fire,
  BuildHtmlName.bom,
  BuildHtmlName.tor,
  BuildHtmlName.tor_hit,
  BuildHtmlName.asw,
  BuildHtmlName.asw_hit,
  BuildHtmlName.raik,
  BuildHtmlName.armor,
  BuildHtmlName.kb,
  BuildHtmlName.kt,
];

const SeaplaneBomberBuildOrder: BuildHtmlName[] = [
  BuildHtmlName.bom,
  BuildHtmlName.los,
  BuildHtmlName.aa,
  BuildHtmlName.ev,
  BuildHtmlName.fire,
  BuildHtmlName.hit,
  BuildHtmlName.tor,
  BuildHtmlName.tor_hit,
  BuildHtmlName.kb,
  BuildHtmlName.kt,
  BuildHtmlName.asw,
  BuildHtmlName.asw_hit,
  BuildHtmlName.raik,
  BuildHtmlName.armor,
];

const RadarBuildOrder: BuildHtmlName[] = [
  BuildHtmlName.hit,
  BuildHtmlName.los,
  BuildHtmlName.kb,
  BuildHtmlName.aa,
  BuildHtmlName.kt,
  BuildHtmlName.ev,
  BuildHtmlName.fire,
  BuildHtmlName.tor,
  BuildHtmlName.tor_hit,
  BuildHtmlName.bom,
  BuildHtmlName.asw,
  BuildHtmlName.asw_hit,
  BuildHtmlName.raik,
  BuildHtmlName.armor,
];

const SonarBuildOrder: BuildHtmlName[] = [
  BuildHtmlName.asw,
  BuildHtmlName.asw_hit,
  BuildHtmlName.fire,
  BuildHtmlName.raik,
  BuildHtmlName.hit,
  BuildHtmlName.tor,
  BuildHtmlName.tor_hit,
  BuildHtmlName.bom,
  BuildHtmlName.aa,
  BuildHtmlName.kb,
  BuildHtmlName.kt,
  BuildHtmlName.ev,
  BuildHtmlName.los,
  BuildHtmlName.armor,
];

const EngineBuildOrder: BuildHtmlName[] = [
  BuildHtmlName.ev,
  BuildHtmlName.fire,
  BuildHtmlName.hit,
  BuildHtmlName.tor,
  BuildHtmlName.tor_hit,
  BuildHtmlName.bom,
  BuildHtmlName.aa,
  BuildHtmlName.kb,
  BuildHtmlName.kt,
  BuildHtmlName.asw,
  BuildHtmlName.asw_hit,
  BuildHtmlName.raik,
  BuildHtmlName.los,
  BuildHtmlName.armor,
];

const AutogyroOrder: BuildHtmlName[] = [
  BuildHtmlName.asw,
  BuildHtmlName.hit,
  BuildHtmlName.fire,
  BuildHtmlName.los,
  BuildHtmlName.asw_hit,
  BuildHtmlName.ev,
  BuildHtmlName.tor,
  BuildHtmlName.tor_hit,
  BuildHtmlName.bom,
  BuildHtmlName.aa,
  BuildHtmlName.kb,
  BuildHtmlName.kt,
  BuildHtmlName.raik,
  BuildHtmlName.armor,
];

const AntiSubmarinePatrolAircraftOrder: BuildHtmlName[] = [
  BuildHtmlName.asw,
  BuildHtmlName.los,
  BuildHtmlName.asw_hit,
  BuildHtmlName.hit,
  BuildHtmlName.fire,
  BuildHtmlName.bom,
  BuildHtmlName.ev,
  BuildHtmlName.tor,
  BuildHtmlName.tor_hit,
  BuildHtmlName.aa,
  BuildHtmlName.kb,
  BuildHtmlName.kt,
  BuildHtmlName.raik,
  BuildHtmlName.armor,
];

const ExtraArmorOrder: BuildHtmlName[] = [
  BuildHtmlName.armor,
  BuildHtmlName.fire,
  BuildHtmlName.hit,
  BuildHtmlName.tor,
  BuildHtmlName.tor_hit,
  BuildHtmlName.bom,
  BuildHtmlName.aa,
  BuildHtmlName.kb,
  BuildHtmlName.kt,
  BuildHtmlName.asw,
  BuildHtmlName.asw_hit,
  BuildHtmlName.ev,
  BuildHtmlName.raik,
  BuildHtmlName.los,
];

const CommandFacilityOrder: BuildHtmlName[] = [
  BuildHtmlName.fire,
  BuildHtmlName.hit,
  BuildHtmlName.los,
  BuildHtmlName.ev,
  BuildHtmlName.aa,
  BuildHtmlName.kb,
  BuildHtmlName.kt,
  BuildHtmlName.raik,
  BuildHtmlName.armor,  
  BuildHtmlName.bom,
  BuildHtmlName.tor,
  BuildHtmlName.tor_hit,
  BuildHtmlName.asw,
  BuildHtmlName.asw_hit,
];

const LandbasedFighterBuildOrder: BuildHtmlName[] = [
  BuildHtmlName.aa,
  BuildHtmlName.ev,
  BuildHtmlName.hit,
  BuildHtmlName.kb,
  BuildHtmlName.kt,
  BuildHtmlName.raik,
  BuildHtmlName.los,
  BuildHtmlName.armor,  
  BuildHtmlName.fire,
  BuildHtmlName.bom,
  BuildHtmlName.tor,
  BuildHtmlName.tor_hit,
  BuildHtmlName.asw,
  BuildHtmlName.asw_hit,
];

const LandAttackAircraftOrder: BuildHtmlName[] = [
  BuildHtmlName.bom,
  BuildHtmlName.tor,
  BuildHtmlName.aa,
  BuildHtmlName.fire,
  BuildHtmlName.asw,
  BuildHtmlName.los,
  BuildHtmlName.hit,
  BuildHtmlName.tor_hit,
  BuildHtmlName.kb,
  BuildHtmlName.kt,
  BuildHtmlName.asw_hit,
  BuildHtmlName.ev,
  BuildHtmlName.raik,
  BuildHtmlName.armor,
];

const SubmarineEquipmentOrder: BuildHtmlName[] = [
  BuildHtmlName.ev,
  BuildHtmlName.hit,
  BuildHtmlName.los,
  BuildHtmlName.armor,        
  BuildHtmlName.tor,
  BuildHtmlName.tor_hit,
  BuildHtmlName.bom,
  BuildHtmlName.fire,
  BuildHtmlName.kb,
  BuildHtmlName.kt,
  BuildHtmlName.asw,
  BuildHtmlName.asw_hit,
  BuildHtmlName.aa,
  BuildHtmlName.raik,
];

const buildParamOrderMapById: Map<number, BuildHtmlName[]> = new Map<number, BuildHtmlName[]>([
  // 224: 爆装一式戦 隼III型改(65戦隊)
  [
    224,
    LandAttackAircraftOrder,
  ]
])

const buildParamOrderMapByType: Map<SlotitemType, BuildHtmlName[]> = new Map<SlotitemType, BuildHtmlName[]>([
  // 11: 水上爆撃機
  [
    SlotitemType.SeaplaneBomber,
    SeaplaneBomberBuildOrder,
  ]
])

const buildParamOrderMap: Map<SlotitemImgType, BuildHtmlName[]> = new Map<SlotitemImgType, BuildHtmlName[]>([
  // 1: 小口径主砲
  [
    SlotitemImgType.syuhou_syou,
    MainGunOrder,
  ],
  // 2: 中口径主砲
  [
    SlotitemImgType.syuhou_tyuu,
    MainGunOrder,
  ],
  // 3: 大口径主砲
  [
    SlotitemImgType.syuhou_dai,
    MainGunOrder,
  ],
  // 4: 副砲
  [
    SlotitemImgType.fukuhou,
    MainGunOrder,
  ],
  // 5: 魚雷
  [
    SlotitemImgType.gyorai,
    TorpedoOrder,
  ],
  // 6: 艦上戦闘機
  [
    SlotitemImgType.kanjyou_sentouki,
    FighterBuildOrder,
  ],
  // 7: 艦上爆撃機
  [
    SlotitemImgType.kanjyou_bakugekiki,
    DiveBomberOrder,
  ],
  // 8: 艦上攻撃機
  [
    SlotitemImgType.kanjyou_kougekiki,
    TorpedoBomberOrder,
  ],
  // 10: 艦上偵察機
  [
    SlotitemImgType.suitei,
    RecSeaplaneBuildOrder
  ],
  // 11: 電探
  [
    SlotitemImgType.dentan,
    RadarBuildOrder,
  ],
  // 16: 高角砲
  [
    SlotitemImgType.koukakuhou,
    AaDirectorOrderKb,
  ],
  // 17: 爆雷
  [
    SlotitemImgType.bakurai,
    SonarBuildOrder,
  ],
  // 18: ソナー
  [
    SlotitemImgType.sonar,
    SonarBuildOrder,
  ],
  // 19: 機関部強化
  [
    SlotitemImgType.engine,
    EngineBuildOrder,
  ],
  // 21: 回転翼機
  [
    SlotitemImgType.heri,
    AutogyroOrder,
  ],
  // 15: 機銃
  [
    SlotitemImgType.kijyu,
    AaGunOrder,
  ],
  // 22: 対潜哨戒機
  [
    SlotitemImgType.taisensyoukaiki,
    AntiSubmarinePatrolAircraftOrder,
  ],
  // 23: バルジ
  [
    SlotitemImgType.bulge,
    ExtraArmorOrder,
  ],
  // 28: 司令部施設
  [
    SlotitemImgType.sireibu,
    CommandFacilityOrder,
  ],
  // 30: 高射装置
  [
    SlotitemImgType.kousyasouti,
    AaDirectorOrderKt,
  ],
  // 32: 見張り員
  [
    SlotitemImgType.mihariin,
    AviationPersonnelOrder,
  ],
  // 33: 大型飛行艇
  [
    SlotitemImgType.oogata_hikoutei,
    SeaplaneBuildOrder,
  ],
  // 37: 陸上攻撃機
  [
    SlotitemImgType.rikukou,
    LandAttackAircraftOrder,
  ],
  // 38: 局戦
  [
    SlotitemImgType.kyokusen,
    LandbasedFighterBuildOrder,
  ],
  // 42: 潜水艦装備
  [
    SlotitemImgType.sensui_soubi,
    SubmarineEquipmentOrder,
  ],
  // 43: 水上戦闘機
  [
    SlotitemImgType.suijyou_sentouki,
    FighterBuildOrder,
  ],
  // 44: 陸上戦闘機
  [
    SlotitemImgType.rikusen,
    LandbasedFighterBuildOrder,
  ],
  // 45: 夜間戦闘機
  [
    SlotitemImgType.yakan_sentouki,
    FighterBuildOrder,
  ],
  // 46: 夜間攻撃機
  [
    SlotitemImgType.yakan_kougekiki,
    TorpedoBomberOrder,
  ],
  // 48: 陸上攻撃機2
  [
    SlotitemImgType.rikukou2,
    LandAttackAircraftOrder,
  ],
  // 50: 夜偵
  [
    SlotitemImgType.yatei,
    RecSeaplaneBuildOrder,
  ],
  // 56: 局戦2
  [
    SlotitemImgType.kyokusen2,
    LandbasedFighterBuildOrder,
  ],
  // 57: 局戦3
  [
    SlotitemImgType.kyokusen3,
    LandbasedFighterBuildOrder,
  ],
  // 58: 夜間爆撃機
  [
    SlotitemImgType.yakan_bakugekiki,
    DiveBomberOrder,
  ],
])

function getBuildParamOrder(data: SlotItemData): BuildHtmlName[] {
  const orderById = buildParamOrderMapById.get(data.mst.api_id)
  if (orderById) {
    return orderById
  }

  const type = KcsUtil.slotitemType(data.mst)
  const orderByType = buildParamOrderMapByType.get(type)
  if (orderByType) {
    return orderByType
  }
  const imgType = KcsUtil.slotitemImgType(data.mst)
  const order = buildParamOrderMap.get(imgType)
  if (order) {
    return order
  }
  return defOrder
}

const remodelGun: BuildHtmlName[] = [
  BuildHtmlName.fire,
  BuildHtmlName.hit,
];

const remodelRikukou: BuildHtmlName[] =
[
  BuildHtmlName.tor,
  BuildHtmlName.aa,
  BuildHtmlName.bom,
];

const remodelParamMapById: Map<number, BuildHtmlName[]> = new Map<number, BuildHtmlName[]>([
  // 224: 爆装一式戦 隼III型改(65戦隊)
  [
    224,
    remodelRikukou,
  ]
])

const remodelParamMap: Map<SlotitemImgType, BuildHtmlName[]> = new Map<SlotitemImgType, BuildHtmlName[]>([
  [
    SlotitemImgType.syuhou_syou,
    remodelGun,
  ],
  [
    SlotitemImgType.syuhou_tyuu,
    remodelGun,
  ],
  [
    SlotitemImgType.syuhou_dai,
    remodelGun,
  ],
  [
    SlotitemImgType.fukuhou,
    remodelGun,
  ],
  [
    SlotitemImgType.koukakuhou,
    [ BuildHtmlName.fire,
      BuildHtmlName.hit,
      BuildHtmlName.kb,
      BuildHtmlName.kt
    ],
  ],
  [
    SlotitemImgType.gyorai,
    [
      BuildHtmlName.tor,
      BuildHtmlName.tor_hit,
    ],
  ],
  [
    SlotitemImgType.kanjyou_sentouki,
    [ 
      BuildHtmlName.aa 
    ],
  ],
  [
    SlotitemImgType.yakan_sentouki,
    [ 
      BuildHtmlName.aa
    ],
  ],
  [
    SlotitemImgType.kanjyou_bakugekiki,
    [
      BuildHtmlName.bom,
      BuildHtmlName.asw,
      BuildHtmlName.aa,
    ],
  ],
  [
    SlotitemImgType.yakan_bakugekiki,
    [
      BuildHtmlName.bom,
      BuildHtmlName.asw,
      BuildHtmlName.aa,
    ],
  ],
  [
    SlotitemImgType.kanjyou_kougekiki,
    [
      BuildHtmlName.tor,
      BuildHtmlName.asw
    ],
  ],
  [
    SlotitemImgType.yakan_kougekiki,
    [
      BuildHtmlName.tor,
      BuildHtmlName.asw
    ],
  ],
  [
    SlotitemImgType.kanjyou_teisatuki,
    [
      BuildHtmlName.los,
    ],
  ],
  [
    SlotitemImgType.suitei,
    [
      BuildHtmlName.los
    ],
  ],
  [
    SlotitemImgType.yatei,
    [
      BuildHtmlName.los
    ],
  ],
  [
    SlotitemImgType.suijyou_sentouki,
    [ 
      BuildHtmlName.aa
    ],
  ],
  [
    SlotitemImgType.dentan,
    [
      BuildHtmlName.hit,
      BuildHtmlName.los,
      BuildHtmlName.kb,
    ],
  ],
  [
    SlotitemImgType.sansikidan,
    remodelGun,
  ],
  [
    SlotitemImgType.tekoudan,
    remodelGun,
  ],
  [
    SlotitemImgType.kijyu,
    [
      BuildHtmlName.kt,
      BuildHtmlName.tor,
      BuildHtmlName.tor_hit,
      BuildHtmlName.fire,
    ],
  ],
  [
    SlotitemImgType.sonar,
    [
      BuildHtmlName.asw,
      BuildHtmlName.asw_hit,
      BuildHtmlName.raik,
      BuildHtmlName.fire,
    ],
  ],
  [
    SlotitemImgType.bakurai,
    [
      BuildHtmlName.asw,
      BuildHtmlName.asw_hit,
      BuildHtmlName.fire,
    ]
  ],
  [
    SlotitemImgType.engine,
    [
      BuildHtmlName.ev,
    ],
  ],
  [
    SlotitemImgType.daihatu,
    remodelGun,
  ],
  [
    SlotitemImgType.heri,
    [
      BuildHtmlName.asw,
    ],
  ],
  [
    SlotitemImgType.taisensyoukaiki,
    [
      BuildHtmlName.asw,
      BuildHtmlName.los,
    ],
  ],
  [
    SlotitemImgType.bulge,
    [
      BuildHtmlName.armor,
    ],
  ],
  [
    SlotitemImgType.tansyoutou,
    remodelGun,
  ],
  [
    SlotitemImgType.sireibu,
    remodelGun,
  ],
  [
    SlotitemImgType.supana,
    [
      BuildHtmlName.fire,
      BuildHtmlName.hit,
      BuildHtmlName.tor,
      BuildHtmlName.bom,
      BuildHtmlName.aa,
      BuildHtmlName.ev,
    ],
  ],
  [
    SlotitemImgType.kousyasouti,
    [
      BuildHtmlName.kt,
      BuildHtmlName.kb,
      BuildHtmlName.fire,
      BuildHtmlName.hit,
    ],
  ],
  [
    SlotitemImgType.taiti,
    [
      BuildHtmlName.fire
    ],
  ],
  [
    SlotitemImgType.mihariin,
    remodelGun,
  ],
  [
    SlotitemImgType.oogata_hikoutei,
    [
      BuildHtmlName.los,
    ],
  ],
  [
    SlotitemImgType.rikusen,
    [
      BuildHtmlName.aa,
    ],
  ],
  [
    SlotitemImgType.kyokusen,
    [
      BuildHtmlName.aa
    ],
  ],
  [
    SlotitemImgType.kyokusen2,
    [
      BuildHtmlName.aa
    ],
  ],
  [
    SlotitemImgType.kyokusen3,
    [
      BuildHtmlName.aa
    ],
  ],
  [
    SlotitemImgType.rikukou,
    remodelRikukou,
  ],
  [
    SlotitemImgType.rikukou2,
    remodelRikukou,
  ],
  [
    SlotitemImgType.sensui_soubi,
    [
      BuildHtmlName.ev,
    ],
  ],
  [
    SlotitemImgType.hatuensouti,
    remodelGun,
  ]
]);

function getRemodelNames(data: SlotItemData): BuildHtmlName[] {
  const orderById = remodelParamMapById.get(data.mst.api_id)
  if (orderById) {
    return orderById
  }

  const type = KcsUtil.slotitemType(data.mst)
  if (type === SlotitemType.SeaplaneBomber) {// 11, // 水上爆撃機
    return [
      BuildHtmlName.bom,
      BuildHtmlName.los,
    ]
  }
  const imgType = KcsUtil.slotitemImgType(data.mst)
  return remodelParamMap.get(imgType) ?? []
}

</script>
<template>
  <section class="slotitem-list-root">
    <div class="filter-content">
      <div class="inputs">
        <label v-for="(info, index) in filterCheckboxInfos()" :key="index" 
          class="input-checkbox" :title="info.title">
          <b-checkbox v-model="filterGroup" :native-value="info.key" size="is-small" /><img class="type-img"
            :src="getTypeImgSrc(info.checkboxImgType)" />
        </label>
        <div class="input-buttons" title="フィルタをクリア">
          <div class="this-buttons">
            <b-button size="is-small" @click="checkAllFilters">全チェック</b-button>
            <b-button size="is-small" @click="clearFilters">クリア</b-button>
          </div>
        </div>
      </div>
    </div>
    <b-table
      :data="filteredDatas"
      :paginated="true"
      :per-page="perPage"
      icon-pack="fa"
      v-model:current-page="currentPage"
      :pagination-simple="false"
      :pagination-position="'bottom'"
      :pagination-rounded="false"
      :page-input="false"
      :show-detail-icon="false"
      :bordered="false"
      :striped="true"
      :narrowed="false"
      :hoverable="false"
      :mobile-cards="false"
      :sticky-header="true"
      :default-sort="defaultSort"
      default-sort-direction="desc"
      aria-next-label="Next page"
      aria-previous-label="Previous page"
      aria-page-label="Page"
      aria-current-label="Current page"
      :height="listHeight"
      @sort="onSort"
    >
      <b-table-column centered sortable field="mst.api_id"
        header-class="slotitem-id" 
        cell-class="slotitem-id"
      >
        <template #header>
          <span>ID<span v-if="isSortedField('mst.api_id')" class="order-text">{{ getOrderText() }}</span></span>
        </template>
        <template #default="props">
          <span :title="'内部ID: '+props.row.api.api_id">{{ props.row.mst.api_id }}</span>
        </template>
      </b-table-column>

      <b-table-column centered sortable field="api.api_locked"
        header-class="slotitem-locked" 
        cell-class="slotitem-locked">
        <template #header>
          <span><LockImage /><span v-if="isSortedField('api.api_locked')" class="order-text">{{ getOrderText() }}</span></span>
        </template>
        <template #default="props">
          <span><LockImage v-if="!!props.row.api.api_locked" /></span>
        </template>
      </b-table-column>

      <b-table-column centered sortable field="api.api_level"
        header-class="slotitem-star"
        cell-class="slotitem-star"
        >
        <template #header>
          <span><StarImage /><span v-if="isSortedField('api.api_level')" class="order-text">{{ getOrderText() }}</span></span>
        </template>
        <template #default="props">
          <span :class="{ 'is-max': props.row.api.api_level == 10 }">{{ getLevelText(props.row) }}</span>
        </template>
      </b-table-column>

      <b-table-column sortable field="mst.api_name"
        header-class="slotitem-name" 
        cell-class="slotitem-name"
        >
        <template #header>
          <div class="name-header" @click.stop>
            <span>装備名<span v-if="isSortedField('mst.api_name')" class="order-text">{{ getOrderText() }}</span></span>
            <b-autocomplete
              v-model="slotitemNameFilter"
              size="is-small"
              :data="filteredSlotitemNameCandidates"
              field="name"
              open-on-focus
              clearable
              icon-pack="fa"
              placeholder="装備名で絞り込み"
              @click.stop
              @select="onSelectSlotitemNameCandidate"
            >
              <template v-slot="props">
                <div class="slotitem-autocomplete-option">
                  <span class="type-img-content"><img 
                    class="type-img" 
                      :src="getTypeImgSrcFromMst(props.option.mst)" /></span><span>{{ props.option.mst.api_name }}</span><span 
                      class="slotitem-count">装備数：{{ props.option.count }}</span>
                </div>
              </template>
            </b-autocomplete>
          </div>
        </template>
        <template #default="props">
          <div class="name-content" :title="props.row.mst.api_name"><span 
            class="type-img-content"><img class="type-img" :src="getSlotitemImgSrc(props.row)" /><img 
            v-if="props.row.api.api_alv > 0" class="alv-img" :src="getSlotitemALevelImg(props.row)" /></span><span 
            class="name">{{ props.row.mst.api_name }}</span></div>
        </template>
      </b-table-column>

      <b-table-column centered sortable field="mst.api_rare"
        header-class="slotitem-rare"
        cell-class="slotitem-rare"
        >
        <template #header>
          <span>レア<span v-if="isSortedField('mst.api_rare')" class="order-text">{{ getOrderText() }}</span></span>
        </template>
        <template #default="props">
          <span>{{ getRareText(props.row) }}</span>
        </template>
      </b-table-column>

      <b-table-column sortable field="internalDetail"
        header-class="slotitem-detail"
        cell-class="slotitem-detail"
        >
        <template #header>
          <span>アイテム詳細<span v-if="isSortedField('internalDetail')" class="order-text">{{ getOrderText() }}</span></span>
        </template>
        <template #default="props">
          <div class="detail-content"><span 
            class="details" :class="detailsClass(props.row)" v-html="getDetailHtml(props.row)"></span></div>
        </template>
      </b-table-column>

      <b-table-column header-class="slotitem-equiped" cell-class="slotitem-equiped">
        <template #header>
          <span>装備艦</span>
        </template>
        <template #default="props">
          <div class="equiped" v-if="getEquipShipExists(props.row)" 
            :title="getEquipShipTitle(props.row)"><div 
              class="lv">Lv {{ getEquipShipLv(props.row) }} {{ getEquipShipDeckNo(props.row) }}</div><div 
              class="name">{{ getEquipShipName(props.row) }}</div></div>
        </template>
      </b-table-column>

      <div class="counter">
        <div v-for="(count, index) in counters" :key="index" class="counter-item">
          <img class="type-img" :src="getTypeImgSrc(count.imgType)" />
          <div>{{count.count}}</div>
        </div>
      </div>

      <template #empty>
        <div class="has-text-centered">{{emptyText}}</div>
      </template>

    </b-table>
  </section>
</template>
