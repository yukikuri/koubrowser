<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { ApiKyoukaIndex, ApiShip, ApiShipType, ApiShipTypeHojoClasses, ApiShipTypeJyujyunClasses, ApiShipTypeKaiboukanClasses, ApiShipTypeKeijyunClasses, ApiShipTypeKuboClasses, ApiShipTypeKutikukanClasses, ApiShipTypeSenkanClasses, ApiShipTypeSensuikanClasses, ApiSpEffectItemKind, KcsConst, KcsUtil, MstShip, SlotWithOnSlot } from '@common/kcs'
import { svdata } from '@renderer/store/svdata'
import SlotItem from '@renderer/components/SlotItem.vue'
import RibbonImg from '@assets/img/ribbon.svg'

const inEvent = (): boolean => {
  return svdata.inEvent
}

const shipNameClassName = computed<string>(() => {
  return inEvent() ? 'ship-name in-event' : 'ship-name'
})

interface ShipInfoData  {
  api: ApiShip
  mst: MstShip
  ship_fire: number
  ship_armor: number
  ship_tor: number
  ship_ev: number
  ship_aa: number
  ship_asw: number
  ship_los: number
  ship_luck: number
}

const getSallyAreaText = (data: ShipInfoData): string => {
  return data.api.api_sally_area ? '札'+data.api.api_sally_area : '-'
}

const getTypeName = (data: ShipInfoData): string => {
  return KcsUtil.getShipTypeName(data.mst.api_stype).longName
}

const isDeckShip = (data: ShipInfoData): boolean => {
  return !!svdata.deckPorts.find((deck) => {
    return deck.api_ship.includes(data.api.api_id)
  })
}

const getDeckNo = (data: ShipInfoData): number => {
  return 1+svdata.deckPorts.findIndex((deck) => {
    return deck.api_ship.includes(data.api.api_id)
  })
}

const isPlusedFire = (data: ShipInfoData): boolean => {
  return KcsUtil.isSpEffectStatusPlus(data.api, 'api_houg')
}

const plusedFireValue = (data: ShipInfoData): number => {
  return KcsUtil.getSpEffectStatus(data.api, 'api_houg')
}

const isPlusedTor = (data: ShipInfoData): boolean => {
  return KcsUtil.isSpEffectStatusPlus(data.api, 'api_raig')
}

const plusedTorValue = (data: ShipInfoData): number => {
  return KcsUtil.getSpEffectStatus(data.api, 'api_raig')
}

const isPlusedEv = (data: ShipInfoData): boolean => {
  return KcsUtil.isSpEffectStatusPlus(data.api, 'api_kaih')
}

const plusedEvValue = (data: ShipInfoData): number => {
  return KcsUtil.getSpEffectStatus(data.api, 'api_kaih')
}

const isPlusedArmor = (data: ShipInfoData): boolean => {
  return KcsUtil.isSpEffectStatusPlus(data.api, 'api_souk')
}

const plusedArmorValue = (data: ShipInfoData): number => {
  return KcsUtil.getSpEffectStatus(data.api, 'api_souk')
}

const getSpEffectKind = (data: ShipInfoData): ApiSpEffectItemKind | undefined => {
  const effect = data.api.api_sp_effect_items
  if (! effect || effect.length === 0) {
    return ;
  }
  return effect[0].api_kind
}

const hasSpEffect = (data: ShipInfoData): boolean => {
  const kind = getSpEffectKind(data)
  return kind === ApiSpEffectItemKind.white_tasuki || 
    kind === ApiSpEffectItemKind.blue_ribbon  
}

const getSpEffectClassName = (data: ShipInfoData): string => {
  const kind = getSpEffectKind(data)
  return `sp-effect-kind-${kind}`
}

// -----------------------------------------------------------------
// sorting state
const currentSortField = ref<string>('')
const currentSortOrder = ref<'asc' | 'desc' | ''>('')

function onSort(field: string, order:'asc' | 'desc'): void {
  console.log('ship list onSort sorting:', order, 'sorting.field:', field)
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

// -----------------------------------------------------------------

const currentPage = ref<number>(1);

const filterSenkan = ref<boolean>(false);
const filterKuubo = ref<boolean>(false);
const filterJyujyun = ref<boolean>(false);
const filterKeijyun = ref<boolean>(false);
const filterKutikukan = ref<boolean>(false);
const filterKaiboukan = ref<boolean>(false);
const filterSensuikan = ref<boolean>(false);
const filterHojyo = ref<boolean>(false);
const filterKeyword = ref<string>('');

// debounce 用
const debouncedKeyword = ref<string>('')
const debounceMs = 300
let debounceTimer: number | null = null
function onInputKeyword(input) {
  console.log('on keyword input', input)
  if (debounceTimer !== null) {
    clearTimeout(debounceTimer)
  }
  debounceTimer = window.setTimeout(() => {
    debouncedKeyword.value = filterKeyword.value.trim().toLowerCase()
    debounceTimer = null
  }, debounceMs)
}
onUnmounted(() => {
  if (debounceTimer !== null) clearTimeout(debounceTimer)
})

function onFilterClear() {
  filterSenkan.value = false
  filterKuubo.value = false
  filterJyujyun.value = false
  filterKeijyun.value = false
  filterKutikukan.value = false
  filterKaiboukan.value = false
  filterSensuikan.value = false
  filterHojyo.value = false
  filterKeyword.value = ''
  debouncedKeyword.value = ''
}

const emptyText = '該当する艦船が見つかりません';

const getFilterType = (): ApiShipType[] => {
  const types: ApiShipType[] = []
  if (filterSenkan.value) {
    types.push(...ApiShipTypeSenkanClasses)
  }
  if (filterKuubo.value) {
    types.push(...ApiShipTypeKuboClasses);
  }
  if (filterJyujyun.value) {
    types.push(...ApiShipTypeJyujyunClasses);
  }
  if (filterKeijyun.value) {
    types.push(...ApiShipTypeKeijyunClasses);
  }
  if (filterKutikukan.value) {
    types.push(...ApiShipTypeKutikukanClasses)
  }
  if (filterKaiboukan.value) {
    types.push(...ApiShipTypeKaiboukanClasses);
  }
  if (filterSensuikan.value) {
    types.push(...ApiShipTypeSensuikanClasses);
  }
  if (filterHojyo.value) {
    types.push(...ApiShipTypeHojoClasses);
  }
  return types
}

const getSlots = (ship: ShipInfoData): SlotWithOnSlot[] => {
  const info = svdata.shipInfo(ship.api.api_id)
  if (! info) {
    return []
  }
  return KcsUtil.getSlotsWithOnSlot(info)
}
const isMatchKeyword = (api: ApiShip, mst: MstShip, keyword: string): boolean => {

  if (keyword.length === 0) {
    return true
  }

  // check shipname
  const name = mst.api_name.trim().toLowerCase()
  if(name.includes(keyword)) {
    return true
  }

  // check type name
  const typeName = KcsUtil.getShipTypeName(mst.api_stype).longName.toLowerCase()
  if (typeName.includes(keyword)) {
    return true
  }

  // check equipments
  const isMatchSlotitemName = (api_slot_id: number, keyword: string): boolean => {
    const api_slot = svdata.slotitem(api_slot_id)
    if (api_slot) {
      const mst_slot = svdata.mstSlotitem(api_slot.api_slotitem_id)
      if (mst_slot) {
        const eqName = mst_slot.api_name.trim().toLowerCase()
        if (eqName.includes(keyword)) {
          return true
        }
      }
    }
    return false
  }
  for (let i = 0; i < api.api_slot.length; i++) {
    if (isMatchSlotitemName(api.api_slot[i], keyword)) {
      return true
    }
  }
  if (api.api_slot_ex > 0) {
    if (isMatchSlotitemName(api.api_slot_ex, keyword)) {
      return true
    }
  }

  // not found
  return false;
}

const datas = computed<ShipInfoData[]>(() => {
  console.log('ShipList called datas');
  let list = svdata.ships;//.slice(0, 2);

  const filterTypes = getFilterType()
  const keyword = debouncedKeyword.value;
  const ret = list.reduce<ShipInfoData[]>((acc, api) => {
    const mst = svdata.mstShip(api.api_ship_id)
    if (! mst) {
      return acc
    }

    // filter?
    if (filterTypes.length > 0) {
      if (! filterTypes.includes(mst.api_stype)) {
        return acc
      }
    }

    // match keyword?
    if (! isMatchKeyword(api, mst, keyword)) {
      return acc
    }

    // is list data
    acc.push({
      api, 
      mst, 
      ship_fire: KcsUtil.apiShipFire(api),
      ship_armor: KcsUtil.apiShipArmor(api),
      ship_tor: KcsUtil.apiShipTor(api),
      ship_ev: KcsUtil.apiShipEv(api),
      ship_aa: api.api_taiku[0],
      ship_asw: api.api_taisen[0],
      ship_los: api.api_sakuteki[0],
      ship_luck: api.api_lucky[0],
    })
    return acc
  }, [])

  ret.sort((i1, i2) => {
    if (i2.api.api_lv !== i1.api.api_lv) {
        return i2.api.api_lv - i1.api.api_lv
    }
    if(i1.mst.api_stype !== i2.mst.api_stype) {
      return i1.mst.api_stype - i2.mst.api_stype
    }
    return i2.mst.api_id - i1.mst.api_id
  })

  return ret
})

const filteredByTypeCount = computed<string>(() => {
  const ships = datas.value
  let filterTypes = getFilterType()

  const counts = {
    sen: 0,
    kuubo: 0,
    jyujyun: 0,
    keijyun: 0,
    kutikukan: 0,
    kaiboukan: 0,
    sensuikan: 0,
    hojyo: 0
  }

  ships.forEach((data) => {
    const stype = data.mst.api_stype
    if (ApiShipTypeSenkanClasses.includes(stype)) counts.sen++
    else if (ApiShipTypeKuboClasses.includes(stype)) counts.kuubo++
    else if (ApiShipTypeJyujyunClasses.includes(stype)) counts.jyujyun++
    else if (ApiShipTypeKeijyunClasses.includes(stype)) counts.keijyun++
    else if (ApiShipTypeKutikukanClasses.includes(stype)) counts.kutikukan++
    else if (ApiShipTypeKaiboukanClasses.includes(stype)) counts.kaiboukan++
    else if (ApiShipTypeSensuikanClasses.includes(stype)) counts.sensuikan++
    else if (ApiShipTypeHojoClasses.includes(stype)) counts.hojyo++
  })

  if (filterTypes.length === 0) {
    return `戦:${counts.sen} 空:${counts.kuubo} 重:${counts.jyujyun} 軽:${counts.keijyun} 駆:${counts.kutikukan} 海防:${counts.kaiboukan} 潜:${counts.sensuikan} 補:${counts.hojyo}`
  }

  let ret = ''
  if (filterSenkan.value) {
    ret += `戦:${counts.sen} `
  }
  if (filterKuubo.value) {
    ret += `空:${counts.kuubo} `
  }
  if (filterJyujyun.value) {
    ret += `重:${counts.jyujyun} `
  }
  if (filterKeijyun.value) {
    ret += `軽:${counts.keijyun} `
  }
  if (filterKutikukan.value) {
    ret += `駆:${counts.kutikukan} `
  }
  if (filterKaiboukan.value) {
    ret += `海防:${counts.kaiboukan} `
  }
  if (filterSensuikan.value) {
    ret += `潜:${counts.sensuikan} `
  }
  if (filterHojyo.value) {
    ret += `補:${counts.hojyo} `
  }
  return ret.trim()
})

// const saveAsCsv = (): void => {
//   const lines: string[] = []
//   lines.push('type, name, lv, id')
//   ships.value.forEach((data) => {
//     lines.push(`${ShipTypeName[data.mst.api_stype as number]}, ${data.mst.api_name}, ${data.api.api_lv}, ${data.api.api_ship_id}`)
//   })
//   window.api.shipCsv(lines.join('\r\n'))
// }

const listHeight = computed<number>(() => {
  return 781;
})
const perPage = ref<number>(28);

</script>
<template>
  <section class="ship-list-root">
    <div class="filter-content">
      <b-field class="inputs" position="is-centered" multiline>
        <label class="input-checkbox">
          <b-checkbox v-model="filterSenkan" size="is-small" /><span class="filter-label">戦艦級</span>
        </label>
        <label class="input-checkbox">
          <b-checkbox v-model="filterKuubo" size="is-small" /><span class="filter-label">航空母艦</span>
        </label>
        <label class="input-checkbox">
          <b-checkbox v-model="filterJyujyun" size="is-small" /><span class="filter-label">重巡級</span>
        </label>
        <label class="input-checkbox">
          <b-checkbox v-model="filterKeijyun" size="is-small" /><span class="filter-label">軽巡級</span>
        </label>
        <label class="input-checkbox">
          <b-checkbox v-model="filterKutikukan" size="is-small" /><span class="filter-label">駆逐艦</span>
        </label>
        <label class="input-checkbox">
          <b-checkbox v-model="filterKaiboukan" size="is-small" /><span class="filter-label">海防艦</span>
        </label>
        <label class="input-checkbox">
          <b-checkbox v-model="filterSensuikan" size="is-small" /><span class="filter-label">潜水艦</span>
        </label>
        <label class="input-checkbox">
          <b-checkbox v-model="filterHojyo" size="is-small" /><span class="filter-label">補助艦艇</span>
        </label>
        <label class="input-keyword">
          <b-input v-model="filterKeyword" placeholder="艦名・装備を入力"  size="is-small" 
          @input="onInputKeyword"
          />
        </label>
        <label class="input-clear">
          <b-button size="is-small" @click="onFilterClear">条件クリア</b-button>
        </label>
      </b-field>
    </div>
    <b-table
      :data="datas"
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
      default-sort-direction="desc"
      aria-next-label="Next page"
      aria-previous-label="Previous page"
      aria-page-label="Page"
      aria-current-label="Current page"
      :height="listHeight"
      @sort="onSort"
    >

      <b-table-column centered 
        header-class="ship-base-param ship-id" sortable field="mst.api_id"
        cell-class="ship-base-param"
        >
        <template #header>
          <span>ID<span v-if="isSortedField('mst.api_id')" class="order-text">{{ getOrderText() }}</span></span>
        </template>
        <template #default="props">
          <span 
            class="ship-id" 
            :title="'内部ID: '+props.row.api.api_id">{{ props.row.mst.api_id }}</span>
        </template>
      </b-table-column>

      <b-table-column v-if="inEvent()" centered 
        header-class="ship-base-param ship-sally-area" sortable field="api.api_sally_area"
        cell-class="ship-base-param"
        >
        <template #header>
          <span>札<span v-if="isSortedField('api.api_sally_area')" class="order-text">{{ getOrderText() }}</span></span>
        </template>
        <template #default="props">
          <span class="ship-sally-area">{{ getSallyAreaText(props.row) }}</span>
        </template>
      </b-table-column>

      <b-table-column 
        :header-class="shipNameClassName" sortable field="mst.api_name"
        :cell-class="shipNameClassName">
        <template #header>
          <div>艦名<span v-if="isSortedField('mst.api_name')" class="order-text">{{ getOrderText() }}</span></div>
        </template>
        <template #default="props">
          <div class="name-content" :class="{ 'in-event': inEvent() }" :title="props.row.mst.api_name"><div 
              class="type">{{ getTypeName(props.row) }}</div><div 
              class="name">{{ props.row.mst.api_name }}</div><span 
                v-if="isDeckShip(props.row)" 
                class="deck-no">/{{ getDeckNo(props.row) }}</span>
              <span 
                v-if="hasSpEffect(props.row)" 
                class="ribbon" :class="getSpEffectClassName(props.row)"><RibbonImg /></span></div>
        </template>
      </b-table-column>

      <b-table-column centered 
        header-class="ship-base-param ship-lv" sortable field="api.api_lv"
        cell-class="ship-base-param"
        >
        <template #header>
          <span>Lv<span v-if="isSortedField('api.api_lv')" class="order-text">{{ getOrderText() }}</span></span>
        </template>
        <template #default="props">
          <span class="ship-lv" 
            :class="{
              'state-plus': props.row.api.api_lv >= 100,
              'state-max': props.row.api.api_lv === KcsConst.MaxLv,
            }">{{ props.row.api.api_lv }}</span>
        </template>
      </b-table-column>

      <b-table-column centered header-class="ship-hp" sortable field="api.api_nowhp"
        cell-class="ship-hp"
        >
        <template #header>
          <span>HP<span v-if="isSortedField('api.api_nowhp')" class="order-text">{{ getOrderText() }}</span></span>
        </template>
        <template #default="props">
          <span class="hp"><span 
            class="nowhp">{{ props.row.api.api_nowhp }}/</span><span 
              class="hpmax"><span 
                class="hpmax-value"><span 
                  class="value" :class="{
                    'state-plus': props.row.api.api_maxhp > props.row.mst.api_taik[0],
                    'state-max' : props.row.api.api_kyouka[ApiKyoukaIndex.hp] === 2}"
                  >{{ props.row.api.api_maxhp }}</span></span><span 
                    v-if="props.row.api.api_kyouka[ApiKyoukaIndex.hp]" 
                    class="hpmax-added added state-plus"
                    :class="{'state-max' : props.row.api.api_kyouka[ApiKyoukaIndex.hp] === 2}"
                  >+{{ props.row.api.api_kyouka[ApiKyoukaIndex.hp] }}</span></span></span>
        </template>
      </b-table-column>

      <b-table-column centered 
        header-class="ship-base-param ship-cond" sortable field="api.api_cond"
        cell-class="ship-base-param"
        >
        <template #header>
          <span>Cd<span v-if="isSortedField('api.api_cond')" class="order-text">{{ getOrderText() }}</span></span>
        </template>
        <template #default="props">
          <span class="ship-cond" 
            :class="{
              'state-plus': props.row.api.api_cond >= 50,
              'state-max': props.row.api.api_cond === 100,
              }">{{ props.row.api.api_cond }}</span>
        </template>
      </b-table-column>

      <b-table-column centered 
        header-class="ship-base-param ship-fire" sortable field="ship_fire"
        cell-class="ship-base-param"
        >
        <template #header>
          <span>火力<span v-if="isSortedField('ship_fire')" class="order-text">{{ getOrderText() }}</span></span>
        </template>
        <template #default="props">
          <div class="ship-fire"><div class="value" :class="{
            'state-plus': isPlusedFire(props.row)
            }">{{ props.row.ship_fire }}</div><div v-if="isPlusedFire(props.row)" 
            class="added state-plus">+{{ plusedFireValue(props.row) }}</div></div>
        </template>
      </b-table-column>

      <b-table-column centered 
        header-class="ship-base-param ship-armor" sortable field="ship_armor"
        cell-class="ship-base-param"
        >
        <template #header>
          <span>装甲<span v-if="isSortedField('ship_armor')" class="order-text">{{ getOrderText() }}</span></span>
        </template>
        <template #default="props">
          <div class="ship-armor"><div class="value" :class="{
              'state-plus': isPlusedArmor(props.row)
            }">{{ props.row.ship_armor }}</div><div v-if="isPlusedArmor(props.row)" 
            class="added state-plus">+{{ plusedArmorValue(props.row) }}</div></div>
        </template>
      </b-table-column>

      <b-table-column centered 
        header-class="ship-base-param ship-tor" sortable field="ship_tor"
        cell-class="ship-base-param"
        >
        <template #header>
          <span>雷装<span v-if="isSortedField('ship_tor')" class="order-text">{{ getOrderText() }}</span></span>
        </template>
        <template #default="props">
          <div class="ship-tor"><div class="value" :class="{
              'state-plus': isPlusedTor(props.row)
            }">{{ props.row.ship_tor}}</div><div v-if="isPlusedTor(props.row)" 
            class="added state-plus">+{{ plusedTorValue(props.row) }}</div></div>
        </template>
      </b-table-column>

      <b-table-column centered 
        header-class="ship-base-param ship-ev" sortable field="ship_ev"
        cell-class="ship-base-param"
        >
        <template #header>
          <span>回避<span v-if="isSortedField('ship_ev')" class="order-text">{{ getOrderText() }}</span></span>
        </template>
        <template #default="props">
          <div class="ship-ev"><div class="value" :class="{
              'state-plus': isPlusedEv(props.row)
            }">{{ props.row.ship_ev }}</div><div v-if="isPlusedEv(props.row)"
            class="added state-plus">+{{ plusedEvValue(props.row) }}</div></div>
        </template>
      </b-table-column>

      <b-table-column centered 
        header-class="ship-base-param ship-aa" sortable field="ship_aa"
        cell-class="ship-base-param"
        >
        <template #header>
          <span>対空<span v-if="isSortedField('ship_aa')" class="order-text">{{ getOrderText() }}</span></span>
        </template>
        <template #default="props">
          <span class="ship-aa">{{ props.row.ship_aa}}</span>
        </template>
      </b-table-column>

      <b-table-column centered 
        header-class="ship-base-param ship-asw" sortable field="ship_asw"
        cell-class="ship-base-param"
        >
        <template #header>
          <span>対潜<span v-if="isSortedField('ship_asw')" class="order-text">{{ getOrderText() }}</span></span>
        </template>
        <template #default="props">
          <div class="ship-asw"><div class="value" :class="{
              'state-plus': props.row.api.api_kyouka[ApiKyoukaIndex.asw] > 0
            }">{{ props.row.ship_asw}}</div><div 
              v-if="props.row.api.api_kyouka[ApiKyoukaIndex.asw] > 0" 
              class="added state-plus"
              :class="{'state-max': props.row.api.api_kyouka[ApiKyoukaIndex.asw] === 9}"
              >+{{ props.row.api.api_kyouka[ApiKyoukaIndex.asw] }}</div></div>
        </template>
      </b-table-column>

      <!-- <b-table-column centered header-class="ship-base-param ship-speed">
        <template #header>
          <span>速力</span>
        </template>
        <template #default="props">
          <span class="ship-speed">
          </span>
        </template>
      </b-table-column> -->

      <b-table-column centered 
        header-class="ship-base-param ship-los" sortable field="ship_los"
        cell-class="ship-base-param"
        >
        <template #header>
          <span>索敵<span v-if="isSortedField('ship_los')" class="order-text">{{ getOrderText() }}</span></span>
        </template>
        <template #default="props">
          <span class="ship-los">{{ props.row.ship_los }}</span>
        </template>
      </b-table-column>

      <!-- <b-table-column centered header-class="ship-base-param ship-range">
        <template #header>
          <span>射程</span>
        </template>
        <template #default="props">
          <span class="ship-range">
          </span>
        </template>
      </b-table-column> -->

      <b-table-column centered 
        header-class="ship-base-param ship-luck" sortable field="ship_luck"
        cell-class="ship-base-param"
        >
        <template #header>
          <span>運<span v-if="isSortedField('ship_luck')" class="order-text">{{ getOrderText() }}</span></span>
        </template>
        <template #default="props">
          <div class="ship-luck"><div class="value" :class="{
              'state-plus': props.row.api.api_kyouka[ApiKyoukaIndex.luck] > 0,
              'state-max': props.row.api.api_lucky[0] === props.row.mst.api_luck[1],
            }">{{ props.row.ship_luck }}</div><div 
              v-if="props.row.api.api_kyouka[ApiKyoukaIndex.luck] > 0" 
              class="added state-plus">+{{ props.row.api.api_kyouka[ApiKyoukaIndex.luck] }}</div></div>
        </template>
      </b-table-column>

      <b-table-column centered header-class="ship-slots" cell-class="ship-slots">
        <template #header>
          <span>装備</span>
        </template>
        <template #default="props">
          <span class="slots-content"><span 
            class="slots"><SlotItem 
              v-for="(slot, slot_index) in getSlots(props.row)" 
              :slotitem="slot" :key="slot_index" /></span></span>
        </template>
      </b-table-column>

      <div class="counter">
        <div>艦船数：{{ datas.length }}</div>
        <div class="byType">{{ filteredByTypeCount }}</div>
      </div>

      <template #empty>
        <div class="has-text-centered">{{emptyText}}</div>
      </template>

    </b-table>
  </section>
</template>