<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch} from 'vue'
import { 
  AreaName, 
  AreaMissionMap, 
  MissionStuff, 
  MissionId, 
  MissionDetail, 
  DeckInfo, 
  MissionResult,
  MissionKitInfo
} from '@common/mission'
import {
  ApiDeckPort,
  ApiDeckPortId,
  ApiMissionId,
  ApiMissionState,
  MissionState
} from '@common/kcs'
import { svdata } from '@renderer/store/svdata'
import MissionStateDetail from '@renderer/components/MissionStateDetail.vue'
import KeepImg from '@assets/img/keep.svg'
import { itemIdClassMap, itemIdTitleMap } from '@renderer/util'
import { appSetting } from '@renderer/store/app_setting'
import LockImage from '@renderer/assets/img/lock.svg'
import { missionList } from '@renderer/store/missionList'
import moment from 'moment'

const filterArea1 = ref<boolean>(false)
const filterArea2 = ref<boolean>(false)
const filterArea3 = ref<boolean>(false)
const filterArea4 = ref<boolean>(false)
const filterArea5 = ref<boolean>(false)
const filterArea6 = ref<boolean>(false)
const filterMonthly = ref<boolean>(true)
const filterClearedMonthlyUnDisplay = ref<boolean>(appSetting.mission.filterClearedMonthlyUnDisplay)

watch(filterClearedMonthlyUnDisplay,
 (newVal) => {
  appSetting.mission.filterClearedMonthlyUnDisplay = newVal
})

function isKeeped(missionId: MissionId): boolean {
  return appSetting.mission.keepMissionIds.includes(missionId)
}

function toggleKeep(missionId: MissionId): void {
  const keepMissionIds = appSetting.mission.keepMissionIds
  const index = keepMissionIds.indexOf(missionId)
  if (index >= 0) {
    keepMissionIds.splice(index, 1)
  } else {
    keepMissionIds.push(missionId)
  }
}

const currentSortField = ref<string>('')
const currentSortOrder = ref<'asc' | 'desc' | ''>('')

function getFilterAreas(): AreaName[] {
  const areas: AreaName[] = []
  if (filterArea1.value) {
    areas.push(AreaName.Area1)
  }
  if (filterArea2.value) {
    areas.push(AreaName.Area2)
  }
  if (filterArea3.value) {
    areas.push(AreaName.Area3)
  }
  if (filterArea4.value) {
    areas.push(AreaName.Area4)
  }
  if (filterArea5.value) {
    areas.push(AreaName.Area5)
  }
  if (filterArea6.value) {
    areas.push(AreaName.Area6)
  }
  return areas
}

function onSort(field: string, order:'asc' | 'desc'): void {
  console.log('onSort sorting:',  order, 'sorting.field:', field)
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

function toMaterialText(val: number): string {
  return val ? val.toString() : ''
}

type MissionData = {
  detail: MissionDetail
  missionResult: [MissionResult, MissionResult, MissionResult]
  inMission: [boolean, boolean, boolean]
  isCleared: boolean
  durationText: string
}

const detailContentHeight = ref<number>(0)

const isShowDetailed = ref<boolean>(false)
const detailedMission = ref<MissionDetail | null>(null)
const detailedDeckInfo = ref<ApiDeckPort | null>(null)
const detailedDeckIndex = ref<number | null>(null)

const deckInfos = computed<DeckInfo[]>(() => {
  console.log('MissionCheck deckInfos called', 'isShowDetailed:', isShowDetailed.value)
  const decks = svdata.deckPorts.filter((_, index) => index !== 0)
  const ret = decks.map((el) => MissionStuff.toDeckInfo(svdata, el))

  // update detail dekc info
  if (isShowDetailed.value && detailedDeckIndex.value !== null) {
    detailedDeckInfo.value = svdata.deckPorts[detailedDeckIndex.value+1]
    console.log('MissionCheck deckInfos updated detailedDeckInfo:', detailedDeckInfo.value)
  }
  return ret;
})

const toDurationText = (minutes: number): string => {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  const hStr = h < 10 ? '' + h : '' + h
  const mStr = m < 10 ? '0' + m : '' + m
  return hStr + ':' + mStr
} 

function hasBonus(deckIndex: number): boolean {
  const deckInfo = deckInfos.value[deckIndex]
  return deckInfo ? deckInfo.daihatuBonus > 0 : false
}

function getBonus(deckIndex: number): number {
  const deckInfo = deckInfos.value[deckIndex]
  if(!deckInfo) {
    return 0
  }
  return Math.floor(deckInfo.daihatuBonus * 10) / 10;
}

function isGetKit(data: MissionData): boolean {
  return !!data.detail.kitNormal || !!data.detail.kitSucceeded2
}

const emptyClass = {
  's-icon': true,
  'empty': true
}

function toGetKitClass(kitInfo: MissionKitInfo | undefined): object {
  if (!kitInfo) {
    return emptyClass;
  }
  const className = itemIdClassMap.get(kitInfo.api_item_id) || ''
  if (! className) {
    return emptyClass;
  }
  const ret = {
    's-icon': true
  };
  ret[className] = true;
  return ret;
}

function toGetKitCountText(kitInfo: MissionKitInfo | undefined): string {
  if (!kitInfo) {
    return '0'
  }
  return kitInfo.count.toString()
}

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

function getKitNormalClass(data: MissionData): object {
  return toGetKitClass(data.detail.kitNormal)
}

function getKitNormalCount(data: MissionData): string {
  return toGetKitCountText(data.detail.kitNormal)
}

function getKitNormalTitle(data: MissionData): string {
  return getKitTitle(data.detail.kitNormal)
}

function getKitSucceeded2Class(data: MissionData): object {
  return toGetKitClass(data.detail.kitSucceeded2)
}

function getKitSucceeded2Title(data: MissionData): string {
  return getKitTitle(data.detail.kitSucceeded2)
}

function getKitSucceeded2Count(data: MissionData): string {
  return toGetKitCountText(data.detail.kitSucceeded2)
}

const isMissionCleared = (detail: MissionDetail): boolean => {
  const missions = svdata.missions
  if (missions.length === 0) {
    return !!missionList.api_list_items.find(
      (el) => el.api_mission_id === detail.api_id && el.api_state === ApiMissionState.cleared)
  }
  return !!missions.find(
    (el) => el.api_mission_id === detail.api_id && el.api_state === ApiMissionState.cleared
  )
}

const missionDatas = computed<MissionData[]>(() => {
  const dInfos = deckInfos.value
  const getMissionResult = (deckIndex: number, detail: MissionDetail): MissionResult => {
    const deckInfo = dInfos[deckIndex]
    if (!deckInfo) {
      return MissionResult.invalid
    }
    return MissionStuff.checkResult(deckInfo, detail).result
  }

  const getInMission = (deckIndex: number, detail: MissionDetail): boolean => {
    const deck = svdata.deckPorts[deckIndex + 1]
    if (!deck) {
      return false
    }
    if (deck.api_mission[1] !== detail.api_id) {
      return false;
    }
    return deck.api_mission[0] !== MissionState.no 
  }

  return MissionStuff.getDetails().map((detail) => {
    const missionResult: [MissionResult, MissionResult, MissionResult] = [
      getMissionResult(0, detail),
      getMissionResult(1, detail),
      getMissionResult(2, detail)
    ]
    const inMission: [boolean, boolean, boolean] = [
      getInMission(0, detail),
      getInMission(1, detail),
      getInMission(2, detail)
    ]
    const isCleared = isMissionCleared(detail)
    const durationText = toDurationText(detail.durationMinute)
    return { detail, missionResult, inMission, isCleared, durationText }
  })
})

const datas = computed<MissionData[]>(() => {
  const show_ids: MissionId[] = []

  // add keep mission ids
  const keepMissionIds = appSetting.mission.keepMissionIds
  keepMissionIds.forEach((id) => {
    show_ids.push(id)
  })

  const selectedAreaNames = getFilterAreas()
  selectedAreaNames.forEach((el) => {
    const missionIds = AreaMissionMap.get(el)
    if (missionIds) {
      show_ids.push(...missionIds)
    }
  })
  const ret = missionDatas.value.filter((el) => {
    if (filterMonthly.value && el.detail.isMonthly) {
      if (filterClearedMonthlyUnDisplay.value && el.isCleared) {
        return false
      }
      return true
    }
    if (show_ids.includes(el.detail.id)) {
      return true
    }
    return false
  })

  ret.sort((a, b) => {

    if (!a.detail.isMonthly && b.detail.isMonthly) {
      return -1
    }
    if (a.detail.isMonthly && !b.detail.isMonthly) {
      return 1
    }

    const modApiId = (api_id: ApiMissionId): number => {
      switch(api_id) {
        case ApiMissionId.ミ船団護衛一号船団:
        case ApiMissionId.ミ船団護衛二号船団:
        case ApiMissionId.航空装備輸送任務:
        case ApiMissionId.南西海域戦闘哨戒:
          return api_id + 85
      }
      return api_id
    };

    return modApiId(a.detail.api_id) - modApiId(b.detail.api_id)
  })
  return ret
})

const isDetailed = (deckIndex: number, data: MissionData): boolean => {
  return (
    isShowDetailed.value &&
    detailedDeckIndex.value == deckIndex &&
    detailedMission.value?.id == data.detail.id
  )
}

const onClickMission = (rowIndex: number, deckIndex: number, data: MissionData): void => {
  console.log('onClickMission rowIndex:', rowIndex, 'deckIndex:', deckIndex, data, detailContentHeight.value)
  if (data.missionResult[deckIndex] === MissionResult.invalid) {
    return
  }

  detailedMission.value = data.detail
  detailedDeckInfo.value = svdata.deckPorts[deckIndex+1] // 0 deckInfo index is deck port index of 2
  detailedDeckIndex.value = deckIndex
  isShowDetailed.value = true
  console.log('listHeight detailContentHeight:', detailContentHeight.value,)
}

const detailMission = computed<MissionDetail>(() => detailedMission.value!)
const detailDeckInfo = computed<ApiDeckPort>(() => {
  console.log('MissionCheck detailDeckInfo computed called', detailedDeckInfo.value)
  return detailedDeckInfo.value!
})

const listHeight = computed<number>(() => {
  return 846 - detailContentHeight.value;
})

onMounted(() => {
})

onUnmounted(() => {
})

const isLock2stDeck = computed(() => {
  return !svdata.deckPort(ApiDeckPortId.deck2st)
})

const isLock3stDeck = computed(() => {
  return !svdata.deckPort(ApiDeckPortId.deck3st)
})

const isLock4stDeck = computed(() => {
  return !svdata.deckPort(ApiDeckPortId.deck4st)
})

// Keep empty text for table when no data
const emptyText = '該当する遠征が見つかりません。'
</script>
<template>
  <div class="mission-state-content">
    <div class="filter-content" position="is-centered" multiline>
      <b-field class="inputs" position="is-centered" multiline>
        <label class="input-checkbox">
          <b-checkbox size="is-small" v-model="filterArea1" /><span 
            class="filter-label">鎮守府海域</span>
        </label>
        <label class="input-checkbox">
          <b-checkbox size="is-small" v-model="filterArea2" /><span 
            class="filter-label">南西諸島海域</span>
        </label>
        <label class="input-checkbox">
          <b-checkbox size="is-small" v-model="filterArea3" /><span 
            class="filter-label">北方海域</span>
        </label>
        <label class="input-checkbox">
          <b-checkbox size="is-small" v-model="filterArea6" /><span 
            class="filter-label">南西海域</span>
        </label>
        <label class="input-checkbox">
          <b-checkbox size="is-small" v-model="filterArea4" /><span 
            class="filter-label">西方海域</span>
        </label>
        <label class="input-checkbox">
          <b-checkbox size="is-small" v-model="filterArea5" /><span 
            class="filter-label">南方海域</span>
        </label>
        <div class="sep-vertical"></div>
        <div class="monthly-block">
          <div class="monthly-title">マンスリー</div>
          <div class="monthly-controls">
            <label class="input-checkbox">
              <b-checkbox size="is-small" v-model="filterMonthly" /><span class="filter-label">表示</span>
            </label>
            <label class="input-checkbox">
              <b-checkbox size="is-small" v-model="filterClearedMonthlyUnDisplay" /><span class="filter-label">クリア済非表示</span>
            </label>
          </div>
        </div>      
      </b-field>
    </div>
    <section class="mission-state">
      <b-table
        :data="datas"
        :show-detail-icon="false"
        :bordered="false"
        :striped="false"
        :narrowed="false"
        :hoverable="false"
        :mobile-cards="false"
        :sticky-header="true"
        default-sort-direction="desc"
        :height="listHeight"
        @sort="onSort"
      >
        <b-table-column centered header-class="keep">
          <template #header>
            <div title="常に表示する"><KeepImg /></div>
          </template>
          <template #default="props">
            <span class="mission-keep-content" title="常に表示する" @click="toggleKeep(props.row.detail.id)" ><span :class="{
              'is-keep': isKeeped(props.row.detail.id)}"><KeepImg /></span></span>
          </template>
        </b-table-column>

        <b-table-column centered header-class="kind">
          <template #header>
            <span>種別</span>
          </template>
          <template #default="props">
            <span class="mission-kind-content">
              <span v-if="props.row.isCleared && props.row.detail.isMonthly" class="tag state-text">済</span>
              <span v-if="props.row.detail.isMonthly" class="tag state-monthly">月</span>
            </span>
          </template>
        </b-table-column>

        <b-table-column header-class="name">
          <template #header>
            <span>遠征名</span>
          </template>
          <template #default="props">
            <span class="mission-name-content">
              <span class="mission-name">
                {{ props.row.detail.id + ': ' + props.row.detail.name }}
              </span>
              <span v-if="props.row.detail.isCombat" class="tag mission-fight">交</span>
            </span>
          </template>
        </b-table-column>

        <b-table-column centered header-class="material" sortable field="detail.material.fuel">
          <template #header>
            <span class="s-icon fuel"><span v-if="isSortedField('detail.material.fuel')" class="order-text">{{ getOrderText() }}</span></span>
          </template>
          <template #default="props">
            <span class="mission-material-content">
              <span>{{ toMaterialText(props.row.detail.material.fuel) }}</span>
            </span>
          </template>
        </b-table-column>

        <b-table-column centered header-class="material" sortable field="detail.material.bull">
          <template #header>
            <span class="s-icon bull"><span v-if="isSortedField('detail.material.bull')" class="order-text">{{ getOrderText() }}</span></span>
          </template>
          <template #default="props">
            <span class="mission-material-content">
              <span>{{ toMaterialText(props.row.detail.material.bull) }}</span>
            </span>
          </template>
        </b-table-column>

        <b-table-column centered header-class="material" sortable field="detail.material.steel">
          <template #header>
            <span class="s-icon steel"><span v-if="isSortedField('detail.material.steel')" class="order-text">{{ getOrderText() }}</span></span>
          </template>
          <template #default="props">
            <span class="mission-material-content">
              <span>{{ toMaterialText(props.row.detail.material.steel) }}</span>
            </span>
          </template>
        </b-table-column>

        <b-table-column centered header-class="material" sortable field="detail.material.buxite">
          <template #header>
            <span class="s-icon buxite"><span v-if="isSortedField('detail.material.buxite')" class="order-text">{{ getOrderText() }}</span></span>
          </template>
          <template #default="props">
            <span class="mission-material-content">
              <span>{{ toMaterialText(props.row.detail.material.buxite) }}</span>
            </span>
          </template>
        </b-table-column>

        <b-table-column centered header-class="kit">
          <template #header>
            <div class="header-text">獲得資材</div>
            <div class="sub">成功/大成功</div>
          </template>
          <template #default="props">
            <div v-if="isGetKit(props.row)" class="mission-kit-content">
              <span 
                :class="getKitNormalClass(props.row)" :title="getKitNormalTitle(props.row)">{{ getKitNormalCount(props.row) }}</span><span 
                class="sep">/</span><span  
                :class="getKitSucceeded2Class(props.row)" :title="getKitSucceeded2Title(props.row)">{{ getKitSucceeded2Count(props.row) }}</span>
            </div>
          </template>
        </b-table-column>

        <b-table-column centered header-class="time" sortable field="detail.durationMinute">
          <template #header>
            <span>時間<span v-if="isSortedField('detail.durationMinute')" class="order-text">{{ getOrderText() }}</span></span>
          </template>
          <template #default="props">
            <span class="mission-time-content">
              <span>{{ props.row.durationText }}</span>
            </span>
          </template>
        </b-table-column>
        
        <b-table-column centered header-class="result">
          <template #header>
            <div :class="{hasBonus: hasBonus(0)}"><LockImage v-if="isLock2stDeck" /><span v-else>第二艦隊</span></div>
            <div v-if="hasBonus(0)" class="bonusText">報酬+{{getBonus(0)}}%</div>
          </template>
          <template #default="props">
            <div
              :class="['mission-result', { 'in-mission': props.row.inMission[0] }]"
              @click="onClickMission(props.index, 0, props.row)"
            >
              <div v-if="props.row.inMission[0]" class="mission-running">遠征中</div>
              <div
                :class="[
                  'text',
                  props.row.missionResult[0],
                  { 'is-detailed': isDetailed(0, props.row) }
                ]"
              ></div>
            </div>
          </template>
        </b-table-column>

        <b-table-column centered header-class="result">
          <template #header>
            <div :class="{hasBonus: hasBonus(1)}"><LockImage v-if="isLock3stDeck" /><span v-else>第三艦隊</span></div>
            <div v-if="hasBonus(1)" class="bonusText">報酬+{{getBonus(1)}}%</div>
          </template>
          <template #default="props">
            <div
              :class="['mission-result', { 'in-mission': props.row.inMission[1] }]"
              @click="onClickMission(props.index, 1, props.row)"
            >
              <div v-if="props.row.inMission[1]" class="mission-running">遠征中</div>
              <div
                :class="[
                  'text',
                  props.row.missionResult[1],
                  { 'is-detailed': isDetailed(1, props.row) }
                ]"
              ></div>
            </div>
          </template>
        </b-table-column>

        <b-table-column centered header-class="result">
          <template #header>
            <div :class="{hasBonus: hasBonus(2)}"><LockImage v-if="isLock4stDeck" /><span v-else>第四艦隊</span></div>
            <div v-if="hasBonus(2)" class="bonusText">報酬+{{getBonus(2)}}%</div>
          </template>
          <template #default="props">
            <div
              :class="['mission-result', { 'in-mission': props.row.inMission[2] }]"
              @click="onClickMission(props.index, 2, props.row)"
            >
              <div v-if="props.row.inMission[2]" class="mission-running">遠征中</div>
              <div
                :class="[
                  'text',
                  props.row.missionResult[2],
                  { 'is-detailed': isDetailed(2, props.row) }
                ]"
              ></div>
            </div>
          </template>
        </b-table-column>

        <template #empty>
          <div class="has-text-centered empty-text">{{emptyText}}</div>
        </template>

      </b-table>
    </section>
    <MissionStateDetail v-if="isShowDetailed" 
      :mission="detailMission" :deckInfo="detailDeckInfo" v-model:contentHeight="detailContentHeight" />
  </div>
</template>
