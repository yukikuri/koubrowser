<script setup lang="ts">
import { computed } from 'vue'
import { KcsUtil, ShipInfo } from '@common/kcs'
import { RUtil } from '@renderer/util'
const TRANSPARENT_GIF = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

type Props = {
  shipInfo?: ShipInfo | null
  mstId?: number
  mstIdEnemy?: number
  dmg?: boolean
  escaped?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  shipInfo: null,
  mstId: 0,
  mstIdEnemy: 0,
  dmg: false,
  escaped: false
})

const _ReloadState = {
  fromCache1: null as string | null,
  fromCache2: '1',
  fromApp: '2'
} as const

const src = computed<string>(() => {
  if (props.shipInfo) {
    return RUtil.shipBannerImg(
      props.shipInfo.mst.api_id,
      KcsUtil.shipIsDmaged(props.shipInfo.api),
      true
    )
  }
  if (props.mstId) {
    return RUtil.shipBannerImg(props.mstId, props.dmg, true)
  }
  if (props.mstIdEnemy) {
    return RUtil.eshipBannerImg(props.mstIdEnemy)
  }
  return RUtil.shipBannerNoCacheImg
})

const srcFallback = computed<string>(() => RUtil.shipBannerNoCacheImg)

function onLoad(event: Event, _src?: string): void {
  //console.log('ship banner loaded', _src, 'mst_id:', props.mst_id, event);
  const target = event.target as HTMLImageElement
  target.classList.remove('loading')
  // if (target.classList.contains('reloaded')) {
  //   target.classList.remove('loading', 'reloaded')
  // }
}

function onError(event: Event, _src?: string): void {
  console.log('ship banner error', _src, 'mst_id:', props.mstId, event);
  const target = event.target as HTMLImageElement
  target.src = TRANSPARENT_GIF;
  // const target = event.target as HTMLImageElement
  // const reloaded = target.getAttribute('reloaded')
  // switch (reloaded) {
  //   case ReloadState.fromCache1:
  //     target.setAttribute('reloaded', ReloadState.fromCache2)
  //     target.classList.add('loading')
  //     setTimeout(() => {
  //       if (srcArg) target.src = srcArg
  //     }, 1000)
  //     break
  //   case ReloadState.fromCache2: {
  //     target.setAttribute('reloaded', ReloadState.fromApp)
  //     const shipBannerInfo = Schemas.parseShipBannerUrl(srcArg || '')
  //     if (shipBannerInfo) {
  //       target.src = RUtil.shipBannerImg(shipBannerInfo.id, !!shipBannerInfo.dmg, false)
  //     } else {
  //       target.src = RUtil.shipBannerNoCacheImg
  //     }
  //     target.classList.add('reloaded')
  //     break
  //   }
  //   case ReloadState.fromApp:
  //     target.src = srcFallback.value
  //     break
  // }
}
</script>
<template>
  <b-image
    class="ship-banner"
    :class="{ 'is-escaped': props.escaped }"
    custom-class="loading"
    loading="lazy"
    :src="src"
    :src-fallback="srcFallback"
    @load="onLoad"
    @error="onError"
  />
</template>