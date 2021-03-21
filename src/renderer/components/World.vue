<template>
  <div class="world-root">
    <b-tabs size="is-small" expanded class="world-tabs" @input="onChange" v-model="index" destroy-on-hide>
      <b-tab-item :headerClass="{ 'is-battle': isWorld1 }">
        <template slot="header">
          <img class="world-img" title="1: 鎮守府海域" src="img/world/world1.png">
        </template>
        <component :is="'Areas'" :area_id="1" :deck_index="deck_index" :single_row="true" />
      </b-tab-item>
      <b-tab-item :headerClass="{ 'is-battle': isWorld2 }">
        <template slot="header">
          <img class="world-img" title="2: 南西諸島海域" src="img/world/world2.png">
        </template>
        <component :is="'Areas'" :area_id="2" :deck_index="deck_index" :single_row="true" />
      </b-tab-item>
      <b-tab-item :headerClass="{ 'is-battle': isWorld3 }">
        <template slot="header">
          <img class="world-img" title="3: 北方海域" src="img/world/world3.png">
        </template>
        <component :is="'Areas'" :area_id="3" :deck_index="deck_index" :single_row="true" />
      </b-tab-item>
      <b-tab-item :headerClass="{ 'is-battle': isWorld7 }">
        <template slot="header">
          <img class="world-img" title="7: 南西海域" src="img/world/world7.png">
        </template>
        <component :is="'Areas'" :area_id="7" :deck_index="deck_index" :single_row="true" />
      </b-tab-item>
      <b-tab-item :headerClass="{ 'is-battle': isBattle4 }">
        <template slot="header">
          <img class="world-img" title="4: 西方海域" src="img/world/world4.png">
        </template>
        <component :is="'Areas'" :area_id="4" :deck_index="deck_index" :single_row="true" />
      </b-tab-item>
      <b-tab-item :headerClass="{ 'is-battle': isWorld5 }">
        <template slot="header">
          <img class="world-img" title="5: 南方海域" src="img/world/world5.png">
        </template>
        <component :is="'Areas'" :area_id="5" :deck_index="deck_index" :single_row="true" />
      </b-tab-item>
      <b-tab-item :headerClass="{ 'is-battle': isWorld6 }">
        <template slot="header">
          <img class="world-img" title="6: 中部海域" src="img/world/world6.png">
        </template>
        <component :is="'Areas'" :area_id="6" :deck_index="deck_index" :single_row="true" />
      </b-tab-item>
      <b-tab-item v-if="inEvent" :headerClass="{ 'is-battle': isWorldEvent, 'is-event': true }">
        <template slot="header">
          <span class="world-event" :title="eventName">{{eventName}}</span>
        </template>
        <component :is="'Areas'" :area_id="eventAreaId" :deck_index="deck_index" :single_row="true" />
      </b-tab-item>
    </b-tabs>
  </div>        
</template>

<script lang="ts">
import { MstMaparea, MapAreaId, ApiData, ApiCallback, Api, ApiMapAreaType } from '@/lib/kcs';
import Areas from '@/renderer/components/Areas.vue';
import AirBase from '@/renderer/components/AirBase.vue';
import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { svdata } from '@/renderer/store/svdata';
import { gameState } from '@/renderer/store/gamestate';

@Component({
  components: {
    Areas,
  },
})
export default class extends Vue {

  @Prop({default: 0})
  public deck_index!: number;

  private index: number = 0;
  private area_id: MapAreaId = MapAreaId.area1;
  private cb_map_start: number = 0;

  private mounted() {
    console.log('world mounted');
    this.cb_map_start = ApiCallback.set([Api.REQ_MAP_START, () => this.onMapStart()]);
    this.selectBattleTab();
  }

  private destroyed() {
    ApiCallback.unset(this.cb_map_start);
  }

  private onMapStart(): void {
    console.log('world map start');
    this.selectBattleTab();
  }

  private selectBattleTab(): void {
    if (! svdata.inMap) {
      return ;
    }
    const map_start = svdata.mapStart;
    if (! map_start) {
      return ;
    }

    const indexs = [1, 2, 3, 7, 4, 5, 6];
    if (this.inEvent) {
      indexs.push(this.eventAreaId);
    }
    const index = indexs.findIndex(el => el ===map_start.api_maparea_id);
    if (index !== -1) {
      this.index = index;
    }
  }

  private onChange(value: number): void {
    console.log('world tab changed', 'old world:', this.index, 'new world:', value, typeof value);
  }

  private get inEvent() : boolean {
    return svdata.inEvent
  }

  private isWorld(area_id: number): boolean {
    console.debug('is world area_id', area_id, svdata.mapStart?.api_maparea_id === area_id);
    if (! svdata.inMap) {
      return false;
    }

    return svdata.mapStart?.api_maparea_id === area_id;
  }

  private get isWorld1(): boolean {
    return this.isWorld(1);
  }

  private get isWorld2(): boolean {
    return this.isWorld(2);
  }

  private get isWorld3(): boolean {
    return this.isWorld(3);
  }

  private get isWorld4(): boolean {
    return this.isWorld(4);
  }

  private get isWorld5(): boolean {
    return this.isWorld(5);
  }

  private get isWorld6(): boolean {
    return this.isWorld(6);
  }

  private get isWorldEvent(): boolean {
    return this.isWorld(svdata.mstMapareaType(ApiMapAreaType.event)?.api_id ?? 0);
  }

  private get eventName(): string {
    const mapareas = svdata.mstMapareaType(ApiMapAreaType.event);
    return mapareas?.api_name ?? '????';
  }

  private get eventAreaId(): number {
    return svdata.mstMapareaType(ApiMapAreaType.event)?.api_id ?? 0;
  }
}
</script>
