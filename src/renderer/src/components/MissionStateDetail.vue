<script setup lang="ts">
import { computed, onMounted, onUpdated, ref } from 'vue'
import { MissionStuff, MissionDetail, DeckInfo, MissionCheckResult, MissionChecked, MissionResult } from '@common/mission'
import { svdata } from '@renderer/store/svdata'
import { KcsUtil, SlotWithOnSlot, ApiShipType, ApiShip, ApiMissionState, ApiDeckPort } from '@common/kcs'
import { itemIdClassMap, itemIdTitleMap, RUtil } from '@renderer/util'
import ShipBanner from '@renderer/components/ShipBanner.vue'
import SlotItem from '@renderer/components/SlotItem.vue'
import CheckCircleImg from '@assets/img/check-circle.svg'
import CheckErrorImg from '@assets/img/check-error.svg'
import type { MissionKitInfo, ShipInfoMission } from '@common/mission'
import Duration10Image from '@assets/img/duration10.svg'
import Duration20Image from '@assets/img/duration20.svg'
import Duration40Image from '@assets/img/duration40.svg'
import Duration60Image from '@assets/img/duration60.svg'
import Duration80Image from '@assets/img/duration80.svg'
import CheckOnlyImage from '@assets/img/check-only.svg'

type Props = { 
  mission: MissionDetail; 
  deckInfo: ApiDeckPort,
  contentHeight: number
}
const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:contentHeight', value: number): void
}>()


const remodelToText = (remodel: number): string => {
  if (remodel) {
    return Number(remodel).toFixed(1)
  }
  return '0'
}

const durationImage = computed(() => {
  const minutes = props.mission.durationMinute
  if (minutes <= 180) {
    return Duration10Image
  } else if (minutes <= 240) {
    return Duration20Image
  } else if (minutes <= 520) {
    return Duration40Image
  } else if (minutes <= 700) {
    return Duration60Image
  } else {
    return Duration80Image
  }
})

const deckInfo = computed<DeckInfo>(() => {
  console.log('MissionStateDetail deckInfo called. deckInfo:', props.deckInfo)
  return MissionStuff.toDeckInfo(svdata, props.deckInfo)
})

function calcMaterial(base: number): number {
  if (isSucceeded2.value) {
    return Math.floor(base * 1.5)
  }
  return base
}

const isGetFuel = computed(() => props.mission.material.fuel > 0)
const isGetBull = computed(() => props.mission.material.bull > 0)
const isGetSteel = computed(() => props.mission.material.steel > 0)
const isGetBuxite = computed(() => props.mission.material.buxite > 0)
const isGetItem = computed(() => !!props.mission.kitNormal)
const isGetItem2 = computed(() => {
  if (!isSucceeded2.value) {
    return false
  }
  return !!props.mission.kitSucceeded2
})
const fuel = computed(() => calcMaterial(props.mission.material.fuel))
const bull = computed(() => calcMaterial(props.mission.material.bull))
const steel = computed(() => calcMaterial(props.mission.material.steel))
const buxite = computed(() => calcMaterial(props.mission.material.buxite))

const hasBonus = computed(() => {
  return deckInfo.value.daihatuBonus > 0
})

const calcBonus = (base: number): number => {
  const bonus = (base * deckInfo.value.daihatuBonus)/100;
  return Math.floor(bonus*(isSucceeded2.value ? 1.5 : 1.0))
}

const bonusFuel = computed(() => {
  return calcBonus(props.mission.material.fuel)
})

const bonusBull = computed(() => {
  return calcBonus(props.mission.material.bull)
})

const bonusSteel = computed(() => {
  return calcBonus(props.mission.material.steel)
})

const bonusBuxite = computed(() => {
  return calcBonus(props.mission.material.buxite)
})

function toGetKitClass(kitInfo: MissionKitInfo): object {
  const className = itemIdClassMap.get(kitInfo.api_item_id) || ''
  if (! className) {
    return {};
  }
  const ret = {
    's-icon': true
  };
  ret[className] = true;
  return ret;
}

const getItemClass = computed(() => {
  if (! props.mission.kitNormal) {
    return {};
  }
  return toGetKitClass(props.mission.kitNormal);
})

const getItemClass2 = computed(() => {
  if (! props.mission.kitSucceeded2) {
    return {};
  }
  const ret = toGetKitClass(props.mission.kitSucceeded2);
  ret['succeeded2'] = true;
  return ret;
})

function getKitTitle(kitInfo: MissionKitInfo | undefined): string {
  if (!kitInfo) {
    return ''
  }
  const title = itemIdTitleMap.get(kitInfo.api_item_id) || ''
  if (! title) {
    return ''
  }
  return `${title} x ${kitInfo.count}`
}

const getItemTitle = computed(() => getKitTitle(props.mission.kitNormal))
const getItemTitle2 = computed(() => getKitTitle(props.mission.kitSucceeded2))
const itemGetCount = computed(() => {
  if (!props.mission.kitNormal) {
    return ''
  }
  return props.mission.kitNormal.count + '(50%)'
})
const itemGetCount2 = computed(() => {
  if (!props.mission.kitSucceeded2) {
    return ''
  }
  if (1 === props.mission.kitSucceeded2.count) {
    return props.mission.kitSucceeded2.count + '(確定)'
  }
  return '1～'+props.mission.kitSucceeded2.count + '(確定)'
})

const missionTime = computed((): string => {
  const minutes = props.mission.durationMinute
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  const hStr = h < 10 ? '' + h : '' + h
  const mStr = m < 10 ? '0' + m : '' + m
  return hStr + ':' + mStr
})

const elRoot = ref<HTMLElement | null>(null)
const isCleared = computed(() => {
  if (! props.mission.isMonthly) {
    return false
  }
  return !!svdata.missions.find(
    (el) => el.api_mission_id === props.mission.api_id && el.api_state === ApiMissionState.cleared
  )
})

const result = computed<MissionCheckResult>(() => {
  console.log('MissionStateDetail result computed called', deckInfo.value)
  return MissionStuff.checkResult(deckInfo.value, props.mission)
})

const missionName = computed(() => `${props.mission.id}:${props.mission.name}`)
const isFailed = computed(() => result.value.result === MissionResult.failed)
const isSucceeded = computed(() => result.value.result === MissionResult.succeeded)
const isSucceeded2 = computed(() => result.value.result === MissionResult.succeeded2)
const isMonthly = computed(() => props.mission.isMonthly ?? false)
const missionCheckResult = computed(() => MissionStuff.getMissionResultText(result.value.result))
const isShowCheckBox = computed(() => {
  return isSucceeded.value || isSucceeded2.value
})
const deckShipCount = computed(() => deckInfo.value.ships.length)
const reqShipCount = computed<string | number>(() => props.mission.requirements.ship_count ?? '-')
const isShipCountClear = computed(() => result.value.ship_count === MissionChecked.clear)
const deckFlagshipLv = computed(() => deckInfo.value.ships[0].api.api_lv)
const reqFlagshipLv = computed(() => props.mission.requirements.flagship_lv)
const isFlagshipLvClear = computed(() => result.value.flagship_lv === MissionChecked.clear)

const isReqFlagshipType = computed(() => {
  if (!props.mission.requirements.type_count) return false
  return !!props.mission.requirements.type_count.find((el) => !!el.flagship_type)
})

const isFlagshipTypeClear = computed(() => {
  return result.value.type_count.some((el) => el.flagship_type === MissionChecked.clear)
})

const reqFlagshipType = computed(() => {
  if (isFlagshipTypeClear.value) {
    return KcsUtil.getShipTypeNameFromInfo(deckInfo.value.ships[0]).shortName
  }
  let types: ApiShipType[] = []
  for (const type of props.mission.requirements.type_count ?? []) {
    if (type.flagship_type !== undefined) {
      types = types.concat(type.flagship_type)
    }
  }
  const names = Array.from(new Set(types)).reduce<string[]>((acc, el) => {
    acc.push(KcsUtil.getShipTypeName(el).shortName)
    return acc
  }, [])
  return names.join(',')
})

const isReqShipType = computed(() => !!props.mission.requirements.type_count)
const isShipTypeClear = computed(() => result.value.type_count.some((el) => MissionStuff.isShipTypeClear(el)))

const reqShipType = computed(() => {
  if (!props.mission.requirements.type_count) {
    return ''
  }
  const clear_index = result.value.type_count.findIndex((el) => MissionStuff.isShipTypeClear(el))
  const type_count =
    clear_index === -1
      ? props.mission.requirements.type_count
      : [props.mission.requirements.type_count[clear_index]]
  const ships = type_count.reduce<string[]>((acc, types) => {
    const names: string[] = types.types.map((type) => {
      const type_names = type.ship_type.map((el) => KcsUtil.getShipTypeName(el).shortName)
      if (type.ship_type.length === 1) {
        return `${type_names[0]}(${type.count})`
      }
      return `(${type_names.join(',')})(${type.count})`
    })
    acc.push(names.join(','))
    return acc
  }, [])
  return ships.join(' | ')
})

const deckTotalLv = computed(() => deckInfo.value.status.total_lv)
const reqTotalLv = computed<string | number>(() => props.mission.requirements.total_lv ?? '-')
const isReqTotalLv = computed(() => !!props.mission.requirements.total_lv)
const isTotalLvClear = computed(() => result.value.total_lv === MissionChecked.clear)

const deckTotalFire = computed(() => deckInfo.value.status.total_fire)

const deckTotalRemodelFire = computed(() => remodelToText(deckInfo.value.status.total_fire_remodel))

const reqTotalFire = computed(() => props.mission.requirements.total_fire!)

const isReqTotalFire = computed(() => !!props.mission.requirements.total_fire)

const isTotalFireClear = computed(() => result.value.total_fire === MissionChecked.clear)

const deckTotalTor = computed(() => deckInfo.value.status.total_tor)

const reqTotalTor = computed(() => props.mission.requirements.total_tor!)

const isReqTotalTor = computed(() => !!props.mission.requirements.total_tor)

const isTotalTorClear = computed(() => result.value.total_tor === MissionChecked.clear)

const deckTotalAa = computed(() => deckInfo.value.status.total_aa)

const deckTotalRemodelAa = computed(() => remodelToText(deckInfo.value.status.total_aa_remodel))

const reqTotalAa = computed(() => props.mission.requirements.total_aa!)

const isReqTotalAa = computed(() => !!props.mission.requirements.total_aa)

const isTotalAaClear = computed(() => result.value.total_aa === MissionChecked.clear)

const deckTotalAsw = computed(() => deckInfo.value.status.total_asw)

const deckTotalRemodelAsw = computed(() => remodelToText(deckInfo.value.status.total_asw_remodel))

const reqTotalAsw = computed(() => props.mission.requirements.total_asw!)

const isReqTotalAsw = computed(() => !!props.mission.requirements.total_asw)

const isTotalAswClear = computed(() => result.value.total_asw === MissionChecked.clear)

const deckTotalLos = computed(() => deckInfo.value.status.total_los)

const deckTotalRemodelLos = computed(() => remodelToText(deckInfo.value.status.total_los_remodel))

const reqTotalLos = computed(() => props.mission.requirements.total_los!)

const isReqTotalLos = computed(() => !!props.mission.requirements.total_los)

const isTotalLosClear = computed(() => result.value.total_los === MissionChecked.clear)

const isReqDrumShipCount = computed(() => !!props.mission.requirements.drum_ship_count)

const isDrumShipCountClear = computed(() => result.value.drum_ship_count === MissionChecked.clear)

const deckDrumShipCount = computed(() => deckInfo.value.slotitemCount.drum_ship_count)

const reqDrumShipCount = computed(() => {
  const count = props.mission.requirements.drum_ship_count!
  const count2 = props.mission.requirements.succeeded2?.find((el) => !!el.drum_ship_count)
  if (!count2 || count === count2.drum_ship_count) {
    return count.toString()
  }
  return `${count},${count2.drum_ship_count}`
})

const isReqDrumSlotCount = computed(() => !!props.mission.requirements.drum_ship_count)

const isDrumSlotCountClear = computed(() => result.value.drum_slot_count === MissionChecked.clear)

const deckDrumSlotCount = computed(() => deckInfo.value.slotitemCount.drum_count)

const reqDrumSlotCount = computed(() => {
  const count = props.mission.requirements.drum_slot_count!
  const count2 = props.mission.requirements.succeeded2?.find((el) => !!el.drum_slot_count)
  if (!count2 || count === count2.drum_slot_count) {
    return count.toString()
  }
  return `${count},${count2.drum_slot_count}`
})

const ships = computed<ShipInfoMission[]>(() => deckInfo.value.ships)

const condClass = (api: ApiShip): string => RUtil.condClass(api)

const getSlots = (ship: ShipInfoMission): SlotWithOnSlot[] => {
  return KcsUtil.getSlotsWithOnSlot(ship)
}

function emitContentHeight() {
  const rect = elRoot.value?.getBoundingClientRect()
  emit('update:contentHeight', rect?.height ?? 0)
}

onMounted(() => {
  emitContentHeight()
})

onUpdated(() => {
  emitContentHeight()
})
</script>
<template>
  <div class="mission-state-detail" ref="elRoot">
    <div class="mission-title-content">
      <div class="mission-state-title">
        <span v-if="isCleared" class="tag state-text">済</span>
        <span v-if="isMonthly" class="tag state-monthly">月</span>
        <span class="mission-title" :title="missionName">{{missionName}}</span>
        <span :class="{
          'result-text': true,
          'is-failed': isFailed, 
          'is-succeeded': isSucceeded, 
          'is-succeeded2': isSucceeded2 }"><CheckOnlyImage v-if="isShowCheckBox"/>{{missionCheckResult}}</span>
        <span class="mission-time"><component :is="durationImage"/>{{missionTime}}</span>
      </div>
      <div class="mission-state-title">
        <span class="mission-material">
          <span v-if="isGetFuel" class="s-icon fuel" :class="{'succeeded2': isSucceeded2 }">{{ fuel }}<span 
            v-if="hasBonus" class="hasBonus">+{{ bonusFuel }}</span></span>
          <span v-if="isGetBull" class="s-icon bull" :class="{'succeeded2': isSucceeded2 }">{{ bull }}<span 
            v-if="hasBonus" class="hasBonus">+{{ bonusBull }}</span></span>
          <span v-if="isGetSteel" class="s-icon steel"  :class="{'succeeded2': isSucceeded2 }">{{ steel }}<span 
            v-if="hasBonus" class="hasBonus">+{{ bonusSteel }}</span></span>
          <span v-if="isGetBuxite" class="s-icon buxite" :class="{'succeeded2': isSucceeded2 }">{{ buxite }}<span 
            v-if="hasBonus" class="hasBonus">+{{ bonusBuxite }}</span></span>
          <span v-if="isGetItem" :class="getItemClass" class="kit" :title="getItemTitle">0 ～ {{ itemGetCount }}</span>
          <span v-if="isGetItem2" :class="getItemClass2" class="kit" :title="getItemTitle2">{{ itemGetCount2 }}</span>
        </span>
      </div>
    </div>
    <div class="mission-check">
      <span :class="[ isFlagshipLvClear ? 'is-clear' : 'not-clear' ]">
        <check-circle-img v-if="isFlagshipLvClear" />
        <check-error-img class="error" v-if="!isFlagshipLvClear" />旗艦Lv:{{deckFlagshipLv}}({{reqFlagshipLv}})</span>
      <span v-if="isReqTotalLv" :class="[ isTotalLvClear ? 'is-clear' : 'not-clear']">
        <check-circle-img v-if="isTotalLvClear" />
        <check-error-img class="error" v-if="!isTotalLvClear" />合計Lv:{{deckTotalLv}}({{reqTotalLv}})</span>
      <span v-if="isReqFlagshipType" :class="[ isFlagshipTypeClear ? 'is-clear' : 'not-clear' ]">
        <check-circle-img v-if="isFlagshipTypeClear" />
        <check-error-img class="error" v-if="!isFlagshipTypeClear" />旗艦艦種:{{reqFlagshipType}}</span>
      <span v-if="isReqShipType" :class="[ isShipTypeClear ? 'is-clear' : 'not-clear' ]">
        <check-circle-img v-if="isShipTypeClear" />
        <check-error-img class="error" v-if="!isShipTypeClear" />艦種:{{reqShipType}}</span>
      <span v-if="isReqDrumShipCount" :class="[ isDrumShipCountClear ? 'is-clear' : 'not-clear' ]">
        <check-circle-img v-if="isDrumShipCountClear" />
        <check-error-img class="error" v-if="!isDrumShipCountClear" />ドラム缶搭載隻数:{{deckDrumShipCount}}({{reqDrumShipCount}})</span>
      <span v-if="isReqDrumSlotCount" :class="[ isDrumSlotCountClear ? 'is-clear' : 'not-clear' ]">
        <check-circle-img v-if="isDrumSlotCountClear" />
        <check-error-img class="error" v-if="!isDrumSlotCountClear" />ドラム缶数:{{deckDrumSlotCount}}({{reqDrumSlotCount}})</span>
      <span :class="[ isShipCountClear ? 'is-clear' : 'not-clear' ]">
        <check-circle-img v-if="isShipCountClear" />
        <check-error-img class="error" v-if="!isShipCountClear" />隻数:{{deckShipCount}}({{reqShipCount}})</span>
      <span v-if="isReqTotalFire" :class="[ isTotalFireClear ? 'is-clear' : 'not-clear']">
        <check-circle-img v-if="isTotalFireClear" />
        <check-error-img class="error" v-if="!isTotalFireClear" />火力:{{deckTotalFire}}<span v-if="deckTotalRemodelFire!='0'" class="remodel-text">+{{deckTotalRemodelFire}}</span>({{reqTotalFire}})</span>
      <span v-if="isReqTotalTor" :class="[ isTotalTorClear ? 'is-clear' : 'not-clear']">
        <check-circle-img v-if="isTotalTorClear" />
        <check-error-img class="error" v-if="!isTotalTorClear" />雷撃:{{deckTotalTor}}({{reqTotalTor}})</span>
      <span v-if="isReqTotalAa"  :class="[ isTotalAaClear ? 'is-clear' : 'not-clear']">
        <check-circle-img v-if="isTotalAaClear" />
        <check-error-img class="error" v-if="!isTotalAaClear" />対空:{{deckTotalAa}}<span v-if="deckTotalRemodelAa!='0'" class="remodel-text">+{{deckTotalRemodelAa}}</span>({{reqTotalAa}})</span>
      <span v-if="isReqTotalAsw"  :class="[ isTotalAswClear ? 'is-clear' : 'not-clear']">
        <check-circle-img v-if="isTotalAswClear" />
        <check-error-img class="error" v-if="!isTotalAswClear" />対潜:{{deckTotalAsw}}<span v-if="deckTotalRemodelAsw!='0'" class="remodel-text">+{{deckTotalRemodelAsw}}</span>({{reqTotalAsw}})</span>
      <span v-if="isReqTotalLos" :class="[ isTotalLosClear ? 'is-clear' : 'not-clear']">
        <check-circle-img v-if="isTotalLosClear" />
        <check-error-img class="error" v-if="!isTotalLosClear" />索敵:{{deckTotalLos}}<span v-if="deckTotalRemodelLos!='0'" class="remodel-text">+{{deckTotalRemodelLos}}</span>({{reqTotalLos}})</span>
    </div>
    <div class="ships">
      <div class="ship" v-for="(ship, ship_index) in ships" :key="ship_index">
        <div class="ship-content">
          <div class="line1">
            <span class="ship-banner-content">
              <ShipBanner :ship_info="ship" />
            </span>
            <span class="slots">
              <SlotItem v-for="(slot, slot_index) in getSlots(ship)" :slotitem="slot" :key="slot_index" />
            </span>
          </div>
          <div class="line2">
            <span class="ship-name">Lv:{{ship.api.api_lv}} {{ship.mst.api_name}}</span>
            <span class="s-icon cond" :class="condClass(ship.api)">{{ship.api.api_cond}}</span>
            <span class="s-icon fire" :class="{ 'remodel-text' : ship.remodel.fire>0 }">{{ship.api.api_karyoku[0]+ship.remodel.fire}}</span>
            <span class="s-icon tor">{{ship.api.api_raisou[0]}}</span>
            <span class="s-icon aa" :class="{ 'remodel-text' : ship.remodel.aa>0 }">{{ship.api.api_taiku[0]+ship.remodel.aa}}</span>
            <span class="s-icon asw" :class="{ 'remodel-text' : ship.remodel.asw>0 }">{{ship.api.api_taisen[0]+ship.remodel.asw}}</span>
            <span class="s-icon los" :class="{ 'remodel-text' : ship.remodel.los>0 }">{{ship.api.api_sakuteki[0]+ship.remodel.los}}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
 </template>