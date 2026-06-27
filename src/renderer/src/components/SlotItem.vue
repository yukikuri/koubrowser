<script setup lang="ts">
import { computed } from 'vue'
import { KcsUtil, type SlotWithOnSlot } from '@common/kcs'
import { RUtil } from '@renderer/util'

type Props = { slotitem: SlotWithOnSlot }
const props = defineProps<Props>()

const slotTitle = computed<string | undefined>(() => {
  const slot = props.slotitem
  if (!slot.mst) return undefined
  return slot.mst.api_name
})

const hasSlot = computed<boolean>(() => !!props.slotitem.api)

const hasOnSlot = computed<boolean>(() => {
  const slot = props.slotitem
  if (slot.onslotMax < 0) return false
  if (!slot.api) return true
  return KcsUtil.hasOnSlot(KcsUtil.slotitemType(slot.mst!))
})

// 最大搭載数側を出す
const onslot = computed<number>(() => props.slotitem.onslotMax)

//  搭載数が拡張されている場合true
const isSlotPlus = computed<boolean>(() => {
  const slot = props.slotitem
  if (slot.onslotMaxMst <= 0) return false
  return slot.onslotMax > slot.onslotMaxMst
})

const hasAlv = computed<boolean>(() => {
  const slot = props.slotitem
  return !!slot.api && !!(slot.api.api_alv ?? 0) && KcsUtil.hasOnSlot(KcsUtil.slotitemType(slot.mst!))
})

const alvImg = computed<string>(() => RUtil.slotALevelImg(props.slotitem.api!.api_alv ?? 0))
const typeImg = computed<string>(() => RUtil.slotTypeImgSafe(props.slotitem.mst))

const hasLevel = computed<boolean>(() => !!props.slotitem.api && (props.slotitem.api.api_level ?? -1) > 0)
const isLevelMax = computed<boolean>(() => !!props.slotitem.api && props.slotitem.api.api_level === 10)
const level = computed<string>(() => {
  const level = props.slotitem.api?.api_level ?? 0
  return level === 10 ? '★' : level.toString()
})
</script>
<template>
  <span class="slot-item" :title="slotTitle">
    <img class="slot-img" src="../assets/img/slot/slot.png" />
    <span class="slot-border"></span>
    <img loading="lazy" class="slot-type-img" v-if="hasSlot" :src="typeImg" />
    <span class="slot-onslot" v-if="hasOnSlot" :class="{ 'has-alv': hasAlv }"><span 
      :class="{ slotplus: isSlotPlus }">{{ onslot }}</span></span>
    <img class="slot-alv-img" v-if="hasAlv" :src="alvImg" />
    <span class="slot-level" v-if="hasLevel" :class="{ max: isLevelMax }">{{ level }}</span>
  </span>
</template>