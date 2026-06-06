<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import moment from 'moment'

type Props = {
  complete_time: number
  progress_text: string
  completed_text: string
}

const props = defineProps<Props>()

const dur = ref<moment.Duration>(moment.duration(0))
let timeoutId: number | undefined

const completed = computed(() => dur.value.asMilliseconds() <= 0)

const timeText = computed(() => (completed.value ? props.completed_text : props.progress_text))

function clearTimer(): void {
  if (timeoutId !== undefined) {
    window.clearTimeout(timeoutId)
    timeoutId = undefined
  }
}

function onCompleted(): void {
  dur.value = moment.duration(0)
  clearTimer()
}

function setupTimer(): void {
  clearTimer()
  dur.value = moment.duration(moment(props.complete_time).diff(moment()))

  if (completed.value) {
    return
  }

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
  <span :class="{ 'is-completed': completed }">{{ timeText }}</span>
</template>