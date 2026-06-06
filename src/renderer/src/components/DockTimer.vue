<script setup lang="ts">
import { computed, onBeforeUnmount, watch, ref } from 'vue'
import moment from 'moment'
import { IntervalOneSec } from '@renderer/common/interval';

const props = defineProps<{ complete_time: number }>()

const toStr = (v: number, prefix: string): string => {
  return (prefix + Math.floor(v)).slice(-2)
}

const dur = ref<moment.Duration>(moment.duration(0))
let intervalId: number | undefined
let timeoutId: number | undefined

const completed = computed(() => dur.value.asMilliseconds() <= 0)

const timeText = computed(() => {
  if (completed.value) {
    return '00:00:00'
  }

  return `${toStr(dur.value.asHours(), '0')}:${toStr(dur.value.minutes(), '0')}:${toStr(dur.value.seconds(), '0')}`
})

function clearTimer(): void {
  if (intervalId !== undefined) {
    IntervalOneSec.unreg(intervalId)
    intervalId = undefined
  }

  if (timeoutId !== undefined) {
    window.clearTimeout(timeoutId)
    timeoutId = undefined
  }
}

function onCompleted(): void {
  dur.value = moment.duration(0)
  clearTimer()
}

function onInterval(): void {
  const next = dur.value.asMilliseconds() - 1000
  if (next <= 0) {
    dur.value = moment.duration(0)
    clearTimer()
    return
  }

  dur.value = moment.duration(next)
}

function setupTimer(): void {
  clearTimer()
  dur.value = moment.duration(moment(props.complete_time).diff(moment()))

  if (completed.value) {
    return
  }

  console.log('comp', dur.value.asMilliseconds())
  intervalId = IntervalOneSec.reg(onInterval)
  timeoutId = window.setTimeout(onCompleted, dur.value.asMilliseconds())
}

watch(
  () => props.complete_time,
  () => {
    setupTimer()
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  clearTimer()
})
</script>
<template>
  <span>{{ timeText }}</span>
</template>