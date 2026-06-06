<script setup lang="ts">
//import { getMapImgCtx } from '@renderer/store/mapimgctx'
import { computed, onMounted } from 'vue'
import { MapImg } from '@renderer/stuff/imgs/map'

// const ReloadState = {
//   fromAppMapImg: null,
//   fromGenMapImg: '1',
//   failed: '2'
// } as const
// export type ReloadState = (typeof ReloadState)[keyof typeof ReloadState]

const props = defineProps<{ area_id: number; area_no: number }>()

//const root = ref<HTMLElement | null>(null)
//const ctx = ref(0)
// const load_state = ref<ReloadState>(ReloadState.fromAppMapImg)

const src = computed(() => {
  return MapImg.getSrc(props.area_id, props.area_no)
})

const srcFallback = computed(() => MapImg.getNodataSrc())

onMounted(() => {
  // ctx.value = getMapImgCtx(props.area_id, props.area_no) ?? 0
  // console.log(
  //   'map img mounted. area_id:',
  //   props.area_id,
  //   'area_no:',
  //   props.area_no,
  //   'ctx:',
  //   ctx.value
  // )
})

//watch(
  // () => getMapImgCtx(props.area_id, props.area_no),
  // (newCtx) => {
  //   const next = newCtx ?? 0
  //   console.log(
  //     'mapImgCtx changed. area_id:',
  //     props.area_id,
  //     'area_no:',
  //     props.area_no,
  //     'ctx(cur):',
  //     ctx.value,
  //     'ctx(new):',
  //     next
  //   )
  // }
//)

function onLoad(event: Event): void {
  const target = event.target as HTMLImageElement
  if (target.classList.contains('reloaded')) {
    target.classList.remove('loading', 'reloaded')
  }
}

</script>
<template>
  <div ref="root">
    <b-image
      class="map-img"
      :src="src"
      :src-fallback="srcFallback"
      @load="onLoad"
    />
  </div>
</template>