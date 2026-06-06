<script setup lang="ts">
import { computed } from 'vue'
import { type ApiUseItem, ApiItemId } from '@common/kcs'
import { svdata } from '@renderer/store/svdata'
import { RUtil } from '@renderer/util'

type ItemInfo = {
  api: ApiUseItem
  name: string
  src: string
}

const toItemInfo = (id: ApiItemId, count: number): ItemInfo => {
  const mst = svdata.mstUseItem(id)
  return {
    api: { api_id: id, api_count: count },
    name: mst?.api_name ?? '',
    src: RUtil.itemImg(id),
  }
}

const slotitemToItemInfo = (id: ApiItemId, slotitem_id: number): ItemInfo | undefined => {
  const count = svdata.slotitems.reduce((acc, el) => acc + (el.api_slotitem_id === slotitem_id ? 1 : 0), 0)
  if (!count) return undefined
  const mst = svdata.mstUseItem(id)
  return {
    api: { api_id: id, api_count: count },
    name: mst?.api_name ?? '',
    src: RUtil.itemImg(id),
  }
}

const isDataOk = computed<boolean>(() => svdata.useitems.length > 0)

const items = computed<ItemInfo[]>(() => {
  const ignore = [79, 81, 82, 83, 84]
  const ret = svdata.useitems.reduce<ItemInfo[]>((acc, api) => {
    if (ignore.includes(api.api_id)) return acc
    if (api.api_count > 0) {
      const mst = svdata.mstUseItem(api.api_id)
      if (mst) acc.push({ api, name: mst.api_name, src: RUtil.itemImg(api.api_id) })
    }
    return acc
  }, [])

  // material
  ret.push(toItemInfo(ApiItemId.fast_repair, svdata.fastRepair))
  ret.push(toItemInfo(ApiItemId.fast_build, svdata.fastBuild))
  ret.push(toItemInfo(ApiItemId.build_kit, svdata.buildKit))
  ret.push(toItemInfo(ApiItemId.remodel_kit, svdata.remodelKit))

  // slotitem derived items
  const slotitems: [ApiItemId, number][] = [
    [ApiItemId.emergency_repair, 42],
    [ApiItemId.emergency_repair_god, 43],
    [ApiItemId.rice_ball, 145],
    [ApiItemId.saury_canning, 150],
    [ApiItemId.special_rice_ball, 241],
  ]
  slotitems.forEach(([itemId, mstSlotId]) => {
    const info = slotitemToItemInfo(itemId, mstSlotId)
    if (info) ret.push(info)
  })

  return ret.sort((a, b) => a.api.api_id - b.api.api_id)
})
</script>
<template>
  <div class="item-list">
    <div v-if="isDataOk" class="item-grid">
      <div v-for="(item, index) in items" :key="index" :title="item.name">
        <span>
          <img class="item-img" :src="item.src" />
        </span>
        <div class="item-count">{{ item.api.api_count }}</div>
      </div>
    </div>
  </div>
</template>