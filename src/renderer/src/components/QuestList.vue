<script setup lang="ts">
import { KcsUtil, ApiQuestState } from '@common/kcs'
import { svdata } from '@renderer/store/svdata'
import { quests as questsStore } from '@renderer/store/quests'
import { Quest, QuestCounter, questProgress } from '@common/record'
import { RUtil } from '@renderer/util'
import { QuestCategoryText } from '@common/locale'
import {
  questProgressDetailFormat,
  questIsDeckMatch,
} from '@common/kcquest'
import { MathUtil } from '@common/math'
import { computed, onMounted, toRaw } from 'vue'

const questProgressDetail = (quest: Quest): string => {
  return questProgressDetailFormat(quest)
}

interface QuestContent {
  countTotal: number
  countTotalMax: number
  completed: boolean
  progress: number
  progressText: string
  categoryClass: object
  categoryText: string
  typeClass: object
  typeText: string
  progressDetail: string
  deckOk: boolean | undefined
  senka: number
  is_special: boolean
  tipDetail: string
  is_stext: boolean
  record: Quest
  states: QuestState[]
}

interface QuestState {
  className: string
  percent: number
  percentText: string
  count: number
  countMax: number
}

const progressClasses = [
  'is-success',
  'is-success',
  'is-success',
  'is-success',
  'is-success'
] as const

const questStates = (quest: Quest, countTotal: number, countTotalMax: number): QuestState[] => {
  if (quest.state === null || quest.quest.api_state === ApiQuestState.completed) {
    const count = KcsUtil.questCount(quest.quest)
    return [
      {
        className: progressClasses[0],
        percent: count,
        percentText: count ? count + '%' : '',
        count,
        countMax: 100
      }
    ]
  }

  if (0 === countTotal) {
    return [
      {
        className: '',
        percent: 0,
        percentText: '',
        count: 0,
        countMax: 0
      }
    ]
  }

  const state = quest.state as QuestCounter
  const len = state.count.length
  return state.count.map((count, index) => {
    const countMax = state.countMax[index]
    const percent = MathUtil.floor((count / countTotalMax) * 100, 2)
    const state_percent = Math.floor((count / countMax) * 100)
    let percentText = ''
    if (count) {
      if (len < 4) {
        percentText = `${state_percent}%(${count}/${countMax})`
      } else {
        if (percent >= 10) {
          percentText = `${state_percent}%(${count}/${countMax})`
        } else if (percent >= 2) {
          percentText = `${state_percent}%`
        }
      }
    }

    return {
      className: progressClasses[index % progressClasses.length],
      percent,
      percentText,
      count,
      countMax
    }
  })
}

const questLen = computed<number>(() => questsStore.list.length)

const quests = computed<QuestContent[]>(() => {
  console.log('quest list:', toRaw(questsStore.list))

  return questsStore.list.map((el) => {
    const countTotal =
      el.state === null
        ? KcsUtil.questCount(el.quest)
        : (el.state as QuestCounter).count.reduce((acc, value) => acc + value, 0)
    const countTotalMax =
      el.state === null
        ? 100
        : (el.state as QuestCounter).countMax.reduce((acc, value) => acc + value, 0)
    const progress = questProgress(el)
    let progressDetail: string
    let deckOk: undefined | boolean
    const isCompleted = el.quest.api_state === ApiQuestState.completed
    if (isCompleted) {
      progressDetail = '<span class="cleared">100%</span>'
    } else {
      progressDetail = questProgressDetail(el)
    }
    deckOk = isCompleted ? undefined : questIsDeckMatch(svdata, el.quest.api_no)
    let is_stext = false;
    if (el.state !== null) {
      is_stext = (el.state as QuestCounter).count.length >= 6
    }
    if (el.quest.api_no === 1150) {
      is_stext = true
    }

    console.log('no:', el.no, 'ismatch:', deckOk, 'progressDetail:', progressDetail, el)

    const ret = {
      completed: progress >= 100,
      progress,
      progressText: progress >= 100 ? '達成!' : progress + '%',
      categoryClass: RUtil.questCategoryClass(el.quest),
      categoryText: QuestCategoryText[el.quest.api_category] ?? '?',
      typeClass: RUtil.questTypeClass(el.quest),
      typeText: RUtil.questTypeText(el.quest),
      record: el,
      tipDetail: el.quest.api_detail.replace(/<br>/g, ''),
      progressDetail,
      deckOk,
      senka: KcsUtil.questSenka(el.no),
      is_special: KcsUtil.questIsSpecial(el.no),
      is_stext, 
      countTotal,
      countTotalMax,
      states: questStates(el, countTotal, countTotalMax)
    }
    console.log(ret)
    return ret
  })
})

const maxQuest = computed<number>(() => svdata.parallelQuestCount)

onMounted(() => {
  console.log('QuestList mounted')
})
</script>

<template>
  <section class="questlist">
    <div class="questlist-title">任務情報 遂行中: {{ questLen }}/{{ maxQuest }}</div>
    <b-tooltip
      always2
      v-for="(quest, index) in quests"
      :key="index"
      position="is-right"
      multilined
      type="is-dark"
      :square="true"
      :animated="true"
      class="questtip"
    >
      <template v-slot:content>
        <div class="quest-tip">
          <div class="tiptitle">
            <span>{{ quest.record.no }}: {{ quest.record.quest.api_title }}</span>
            <span>達成度: {{ quest.progressText }}</span>
          </div>
          <hr />
          <div class="tipdetail">{{ quest.tipDetail }}</div>
        </div>
      </template>
      <div class="quest">
        <span class="quest-category" :class="quest.categoryClass">{{ quest.categoryText }}</span>
        <span class="quest-type" :class="quest.typeClass">{{ quest.typeText }}</span>
        <span class="quest-progress" :class="{ 'is-completed': quest.completed }">{{
          quest.progressText
        }}</span>
        <span class="quest-title">
          <span v-if="quest.is_special" class="quest-category is-special pl-1 pr-1">限定</span>
          <span class="quest-category is-senka pl-1 pr-1" v-if="quest.senka > 0"
            >戦果{{ quest.senka }}</span
          >
          <span class="ml-1">{{ quest.record.quest.api_title }}</span>
        </span>
        <b-progress format="percent" :max="100" show-value0 class="quest-bar is-radiusless">
          <template #bar>
            <b-progress-bar
              v-for="(state, state_index) in quest.states"
              :key="state_index"
              :value="state.percent"
              :class="state.className"
            />
            <span class="quest-progress-text" :class="{ 'stext': quest.is_stext}">
              <span v-if="quest.deckOk == true" class="deckOk">編成:OK</span>
              <span v-if="quest.deckOk == false" class="deckNg">編成:NG</span>
              <span v-if="quest.progressDetail" v-html="quest.progressDetail"></span>
            </span>
          </template>
        </b-progress>
      </div>
    </b-tooltip>
  </section>
</template>
