<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed, watch } from 'vue'
import { ApiDeckPort, ApiMissionState, MissionState } from '@common/kcs'
import DoneImg from '@renderer/assets/img/done.svg'
import moment from 'moment'
import { svdata } from '@renderer/store/svdata'
import { IntervalOneSec } from '@renderer/common/interval'

type Props = { deck: ApiDeckPort }
const props = defineProps<Props>()

const durMs = ref(0)
let intervalId: number | undefined
let completedTimeoutId: number | undefined

const clearTimers = (): void => {
  if (intervalId !== undefined) {
    IntervalOneSec.unreg(intervalId)
    intervalId = undefined
  }
  if (completedTimeoutId !== undefined) {
    window.clearTimeout(completedTimeoutId)
    completedTimeoutId = undefined
  }
}

const initTimers = (): void => {
  const end = moment(props.deck.api_mission[2])
  durMs.value = moment.duration(end.diff(moment())).asMilliseconds()

  clearTimers()

  if (durMs.value > 0) {
    intervalId = IntervalOneSec.reg(() => {
      durMs.value -= 1000
      if (durMs.value <= 0) {
        durMs.value = 0
        clearTimers()
      }
    })

    completedTimeoutId = window.setTimeout(
      () => {
        durMs.value = 0
        clearTimers()
      },
      Math.max(0, durMs.value)
    )
  }
}

onMounted(() => {
  initTimers()
})

onUnmounted(() => {
  clearTimers()
})

watch(
  () => props.deck.api_mission[2],
  () => {
    initTimers()
  }
)

const stateLabel = computed(() => {
  const state = props.deck.api_mission[0]
  if (state === MissionState.stopped) {
    return '帰還中'
  }
  return '遠征中'
})

const tagType = computed(() => {
  const state = props.deck.api_mission[0]
  if (state === MissionState.stopped) {
    return 'is-danger'
  }
  return 'is-primary'
})

const completed = computed(() => durMs.value <= 0)

const toStr = (v: number, prefix: string): string => {
  return (prefix + Math.floor(v)).slice(-2)
}

const stateText = computed((): string => {
  if (completed.value) {
    return '完了'
  }
  const d = moment.duration(Math.max(0, durMs.value))
  const hour = d.asHours()
  if (hour < 1.0) {
    return `${toStr(d.minutes(), '')}:${toStr(d.seconds(), '0')}`
  }
  return `${toStr(d.asHours(), '')}:${toStr(d.minutes(), '0')}:${toStr(d.seconds(), '0')}`
})

const missionName = computed((): string => {
  const mission = svdata.mstMission(props.deck.api_mission[1])
  return `${props.deck.api_mission[1]}: ${mission?.api_name ?? ''}`
})
</script>
<template>
  <div class="mission-badge" :title="missionName">
    <b-tag :type="tagType">
      <div class="wrapper">
        <div class="mission-label">{{ stateLabel }}</div>
        <div class="state" :class="{ completed: completed }">
          <DoneImg v-if="completed" />
          {{ stateText }}
        </div>
      </div>
    </b-tag>
  </div>
</template>