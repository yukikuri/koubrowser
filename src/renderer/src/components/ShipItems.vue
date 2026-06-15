<script setup lang="ts">
import ShipList from '@renderer/components/ShipList.vue'
import SlotitemList from '@renderer/components/SlotitemList.vue'
import ItemList from '@renderer/components/ItemList.vue'
import { ShipItemsTabUIState as us } from '@renderer/store/ui_state'
const index = us.tabIndex

function onTabChange(valueNew: number): void {
  console.log('ship items index updated:', 'old:', index.value, 'new:',valueNew);

  const tabName = us.getTabName(valueNew)
  if (tabName) {
    us.saveTabName(tabName)
  }
}

</script>
<template>
  <div class="ship-items-root">
    <b-tabs 
      type="is-toggle" size="is-small" class="ship-items-tabs" expanded 
      v-model="index" 
      @update:modelValue="onTabChange"
      destroy-on-hide>
      <b-tab-item label="艦船一覧">
        <ShipList />
      </b-tab-item>
      <b-tab-item label="装備一覧">
        <SlotitemList />
      </b-tab-item>
      <b-tab-item label="アイテム一覧">
        <ItemList />
      </b-tab-item>
    </b-tabs>
  </div>
</template>