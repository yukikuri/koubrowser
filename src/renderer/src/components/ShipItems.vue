<script setup lang="ts">
import { ref } from 'vue'
import ShipList from '@renderer/components/ShipList.vue'
import SlotitemList from '@renderer/components/SlotitemList.vue'
import ItemList from '@renderer/components/ItemList.vue'
const index = ref<number>(0)
</script>
<template>
  <div class="ship-items-root">
    <b-tabs type="is-toggle" size="is-small" class="ship-items-tabs" expanded v-model="index" destroy-on-hide>
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