<script setup lang="ts">
import { computed } from 'vue'
import { KcsUtil, ShipInfo } from '@common/kcs'
import { RUtil } from '@renderer/util'
const TRANSPARENT_GIF = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

type Props = {
  ship_info?: ShipInfo | null
  mst_id?: number
  mst_id_enemy?: number
  dmg?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  ship_info: null,
  mst_id: 0,
  dmg: false
})

const ReloadState = {
  fromCache1: null as string | null,
  fromCache2: '1',
  fromApp: '2'
} as const

const src = computed<string>(() => {
  if (props.ship_info) {
    return RUtil.shipBannerImg(
      props.ship_info.mst.api_id,
      KcsUtil.shipIsDmaged(props.ship_info.api),
      true
    )
  }
  if (props.mst_id) {
    return RUtil.shipBannerImg(props.mst_id, props.dmg, true)
  }
  if (props.mst_id_enemy) {
    return RUtil.eshipBannerImg(props.mst_id_enemy)
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
  console.log('ship banner error', _src, 'mst_id:', props.mst_id, event);
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
    custom-class="loading"
    loading="lazy"
    :src="src"
    :src-fallback="srcFallback"
    @load="onLoad"
    @error="onError"
  />
</template>