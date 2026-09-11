<script setup lang="ts">
import { computed } from 'vue'

const _ReloadState = {
  fromCache: null,
  fromApp: '2'
} as const

defineProps<{ mstId: number }>()

// const src = computed(() => RUtil.weaponImg(props.mst_id, true))
// const srcFallback = computed(() => RUtil.weaponImgNoCache)

const src = computed(() => 'noimg.png');
const srcFallback = computed(() => 'noimg.png')

function onLoad(_event: Event): void {
  // const target = event.target as HTMLImageElement
  // if (target.classList.contains('reloaded')) {
  //   target.classList.remove('loading', 'reloaded')
  // }
}

function onError(_event: Event): void {
  // const target = event.target as HTMLImageElement
  // const reloaded = target.getAttribute('reloaded')
  // switch (reloaded) {
  //   case ReloadState.fromCache:
  //     target.setAttribute('reloaded', ReloadState.fromApp)
  //     target.classList.add('loading', 'reloaded')
  //     setTimeout(() => {
  //       target.src = RUtil.weaponImg(props.mst_id, false)
  //     }, 10)
  //     break
  //   case ReloadState.fromApp:
  //     target.src = srcFallback.value
  //     break
  // }
}
</script>
<template>
  <b-image
    class="weapon-img"
    loading="lazy"
    :src="src"
    :src-fallback="srcFallback"
    @load="onLoad"
    @error="onError"
  />
</template>