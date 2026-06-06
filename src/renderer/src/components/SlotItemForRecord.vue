<script setup lang="ts">
import { computed } from 'vue'
import { RUtil } from '@renderer/util'
import { SlotitemInfo } from '@common/record';
import { MstSlotitem } from '@common/kcs';
import { svdata } from '@renderer/store/svdata';

type Props = { slotitem: SlotitemInfo | null }
const props = defineProps<Props>()
const mst : MstSlotitem | undefined = svdata.mstSlotitem(props.slotitem?.slotitem_id ?? -1);

const slotTitle = computed<string | undefined>(() => {
  if (!mst) return undefined
  return mst.api_name
})
const hasSlot = !!mst

const hasOnSlot = computed<boolean>(() => {
  return false
  // const slot = props.slotitem
  // if (slot.onslotMax < 0) return false
  // if (!slot.api) return true
  // return KcsUtil.hasOnSlot(KcsUtil.slotitemType(slot.mst!))
})

const onslot = false;//computed<number>(() => props.slotitem.onslot)

const hasAlv = computed<boolean>(() => {
  return !!(props.slotitem?.alv  ?? 0)
})

const alvImg = RUtil.slotALevelImg(props.slotitem?.alv ?? 0)
const typeImg = RUtil.slotTypeImgSafe(mst)

const hasLevel = !!(props.slotitem?.level ?? 0);
const isLevelMax = 10 === (props.slotitem?.level ?? 0);
const level = (() => {
  if (isLevelMax) return '★';
  if (! hasLevel) return '';
  return (props.slotitem?.level ?? 0).toString();
})();

</script>
<template>
  <span class="slot-item" :title="slotTitle">
    <img class="slot-img" src="../assets/img/slot/slot.png" />
    <span class="slot-border"></span>
    <img loading="lazy" class="slot-type-img" v-if="hasSlot" :src="typeImg" />
    <span class="slot-onslot" v-if="hasOnSlot" :class="{ 'has-alv': hasAlv }">{{ onslot }}</span>
    <img class="slot-alv-img" v-if="hasAlv" :src="alvImg" />
    <span class="slot-level" v-if="hasLevel" :class="{ max: isLevelMax }">{{ level }}</span>
  </span>
</template>