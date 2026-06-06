<script setup lang="ts">
import { computed, onMounted } from 'vue'
import moment from 'moment'
import { ApiKDock, ApiKDockState, MstShip } from '@common/kcs'
import { svdata } from '@renderer/store/svdata'
import LockImage from '@assets/img/lock.svg'
import DockTimer from '@renderer/components/DockTimer.vue'
import DockStateTimer from '@renderer/components/DockStateTimer.vue'
import ShipBanner from '@renderer/components/ShipBanner.vue'
import { RUtil } from '@renderer/util'

interface KDockInfo {
  isUse: boolean
  locked: boolean
  kdock: ApiKDock
  isLargeFlag: boolean
  mst?: MstShip
  completedTimeText: string
  shipBanner: string
}

onMounted(() => {
  console.log('kdock mounted')
})

const kdocks = computed<KDockInfo[]>(() => {
  const docks = svdata.kdocks ?? []

  return docks.map<KDockInfo>((kdock) => {
    const locked = kdock.api_state === ApiKDockState.locked
    const isUse =
      kdock.api_state === ApiKDockState.inProgress || kdock.api_state === ApiKDockState.completed
    const isLargeFlag = kdock.api_item1 >= 1000
    const mst = isUse ? svdata.mstShip(kdock.api_created_ship_id) : undefined

    let completedTimeText = ''
    if (kdock.api_state === ApiKDockState.inProgress) {
      const date = moment(kdock.api_complete_time)
      completedTimeText = `(${date.format('MM/DD HH:mm:ss')})`
    }

    const shipBanner = mst ? RUtil.shipBannerImg(mst.api_id, false, true) : ''

    return {
      isUse,
      locked,
      kdock,
      isLargeFlag,
      mst,
      completedTimeText,
      shipBanner
    }
  })
})
</script>
<template>
  <section class="kdock-content">
    <div class="kdock-title">建造ドック</div>
    <div class="kdock-list">
      <div v-for="(info, index) in kdocks" :key="index" class="kdock">
        <div v-if="info.isUse">
          <span class="kdock-img-wrapper">
            <ShipBanner :mst_id="info.mst?.api_id ?? 0" :dmg="false" />
            <img class="kdock-banner" :src="info.shipBanner" />
            <span class="kdock-img-help"
              ><DockStateTimer
                :complete_time="info.kdock.api_complete_time"
                :progress_text="'建造'"
                :completed_text="'完了'"
            /></span>
          </span>
          <span class="kdock-info">
            <span class="kdock-info-item"
              ><span v-if="info.isLargeFlag">大型建造: </span>{{ info.mst?.api_name }}</span
            >
            <span class="kdock-info-item"
              >残り: <DockTimer :complete_time="info.kdock.api_complete_time" />
              {{ info.completedTimeText }}</span
            >
          </span>
        </div>
        <div v-else-if="info.locked">
          <span class="kdock-locked"><LockImage /></span>
        </div>
        <div v-else><span class="kdock-empty">Empty</span></div>
      </div>
    </div>
  </section>
</template>