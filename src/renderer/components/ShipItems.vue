<template>
  <div class="ship-items-root">
    <b-tabs type="is-toggle" size="is-small" class="ship-items-tabs" expanded v-model="index">
      <b-tab-item label="艦隊一覧">
        <ship-list />
      </b-tab-item>
      <b-tab-item label="装備一覧">
        <slotitem-list v-if="index===1" />
      </b-tab-item>
      <b-tab-item label="アイテム一覧">
        <item-list  v-if="index===2" />
      </b-tab-item>
    </b-tabs>
  </div>
</template>

<script lang="ts">
import { SvData, ApiUseItem, MstUseitem, ApiItemId } from '@/lib/kcs';
import { svdata } from '@/renderer/store/svdata';
import { RUtil } from '@/renderer/util';
import ShipList from '@/renderer/components/ShipList.vue';
import SlotitemList from '@/renderer/components/SlotitemList.vue';
import ItemList from '@/renderer/components/ItemList.vue';
import { Component, Vue } from 'vue-property-decorator';

@Component({
  components: {
    ShipList,
    SlotitemList,
    ItemList,
  },
})
export default class extends Vue {

  private index: number = 0;
}
</script>

