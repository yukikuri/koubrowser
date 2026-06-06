<script setup lang="ts">
import { computed, onMounted } from 'vue'
import moment from 'moment'
import { ApiNDock, ShipInfo, ApiNDockState, KcsUtil } from '@common/kcs'
import { svdata } from '@renderer/store/svdata'
import LockImage from '@assets/img/lock.svg'
import DockTimer from '@renderer/components/DockTimer.vue'
import DockStateTimer from '@renderer/components/DockStateTimer.vue'
import ShipBanner from '@renderer/components/ShipBanner.vue'

interface NDockInfo {
  isIn: boolean
  isDamaged: boolean
  locked: boolean
  ndock: ApiNDock
  info?: ShipInfo
  completedTimeText: string
}

onMounted(() => {
  console.log('ndock mounted')
})

const ndocks = computed<NDockInfo[]>(() => {
  const docks = svdata.ndocks ?? []

  return docks.map<NDockInfo>((ndock) => {
    const locked = ndock.api_state === ApiNDockState.locked
    const isIn = ndock.api_state === ApiNDockState.in
    const info = isIn ? svdata.shipInfo(ndock.api_ship_id) : undefined
    const isDamaged = info ? KcsUtil.shipIsDmaged(info.api) : false

    let completedTimeText = ''
    if (isIn) {
      const date = moment(ndock.api_complete_time)
      completedTimeText = `(${date.format('MM/DD HH:mm:ss')})`
    }

    return {
      isIn,
      isDamaged,
      locked,
      ndock,
      info,
      completedTimeText
    }
  })
})
</script>
<template>
  <section class="ndock-content">
    <div class="ndock-title">入渠ドック</div>
    <div class="ndock-list">
      <div v-for="(info, index) in ndocks" :key="index" class="ndock">
        <div v-if="info.isIn">
          <span class="ndock-img-wrapper">
            <ShipBanner :mst_id="info.info?.mst.api_id" :dmg="info.isDamaged" />
            <span class="ndock-img-help"
              ><DockStateTimer
                :complete_time="info.ndock.api_complete_time"
                :progress_text="'修復'"
                :completed_text="'完了'"
            /></span>
          </span>
          <span class="ndock-info">
            <span class="ndock-info-item"
              >Lv {{ info.info?.api.api_lv }} {{ info.info?.mst.api_name }}
              {{ info.info?.api.api_nowhp }}/{{ info.info?.api.api_maxhp }}</span
            >
            <span class="ndock-info-item"
              >残り: <DockTimer :complete_time="info.ndock.api_complete_time" />
              {{ info.completedTimeText }}</span
            >
          </span>
        </div>
        <div v-else-if="info.locked">
          <span class="ndock-locked"><LockImage /></span>
        </div>
        <div v-else><span class="ndock-empty">Empty</span></div>
      </div>
    </div>
  </section>
</template>