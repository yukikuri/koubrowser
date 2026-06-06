<script setup lang="ts">
import { RUtil } from '@renderer/util'
import { computed } from 'vue'

const ReloadState = {
  fromCache: null,
  fromApp: '2'
} as const

const props = defineProps<{ mst_id: number }>()

// const src = computed(() => RUtil.weaponImg(props.mst_id, true))
// const srcFallback = computed(() => RUtil.weaponImgNoCache)

const src = computed(() => 'noimg.png');
const srcFallback = computed(() => 'noimg.png')

function onLoad(event: Event): void {
  // const target = event.target as HTMLImageElement
  // if (target.classList.contains('reloaded')) {
  //   target.classList.remove('loading', 'reloaded')
  // }
}

function onError(event: Event): void {
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