<script setup lang="ts">
import { ref } from 'vue'
import BattleScore from '@renderer/components/BattleScore.vue';
import BattleHistroy from '@renderer/components/BattleHistory.vue';
const index = ref<number>(0)
</script>
<template>
  <div class="battlescore-history-root">
    <b-tabs type="is-toggle" size="is-small" class="select-tabs" expanded v-model="index" destroy-on-hide>
      <b-tab-item label="戦果">
        <BattleScore />
      </b-tab-item>
      <b-tab-item label="戦闘履歴">
        <BattleHistroy />
      </b-tab-item>
    </b-tabs>
  </div>
</template>