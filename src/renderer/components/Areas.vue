<template>
  <div class="areas-root">
    <b-carousel class="areas" :arrow="false" :autoplay="false" @change="onChange" v-model="area_index">
      <b-carousel-item v-for="(area_no,index) in areaNos" :key="index">
        <component v-if="area_index===index" :is="'Area'" :area_id="area_id" :area_no="area_no" :selected_label.sync="selected_label" />
      </b-carousel-item>
      <template slot="indicators" slot-scope="props">
        <span class="areas-indicator" @click="indicatorClick" :class="{ 'is-battle': isBattleArea(props.i), 'is-locked': isAreaLocked(props.i) }">
          <LockImage v-if="isAreaLocked(props.i)" @click="lockClick"/>
          {{areaNoText(props.i)}}
        </span>
      </template>
    </b-carousel>
    <div class="areas-cell-enemies">
      <CellEnemies :area_id="area_id" :area_no="areaNo" :selected_label="selected_label" :deck_index="deck_index" :single_row="single_row"/>
    </div>
  </div>
</template>

<script lang="ts">
import { Api, ApiCallback, MapAreaId, MapAreaNo, MstMapinfo } from '@/lib/kcs';
import Area from '@/renderer/components/Area.vue';
import { Component, Vue, Prop } from 'vue-property-decorator';
import CellEnemies from '@/renderer/components/CellEnemies.vue';
import { svdata } from '@/renderer/store/svdata';
import LockImage from '@/renderer/assets/lock.svg';
import { AppStuff } from '@/lib/app';

@Component({
  components: {
    Area,
    CellEnemies,
    LockImage,
  },
})
export default class extends Vue {
  private cb_map_start: number = 0;

  @Prop({required: true})
  public area_id!: MapAreaId;

  @Prop({default: 0})
  public deck_index!: number;

  @Prop({default: false})
  public single_row!: boolean;

  private area_index: number = 0;

  private selected_label: string = '';

  constructor() {
    super();
  }

  private get areaNos(): number[] {
    return this.areas.map(el => el.api_no).sort();
  }

  private get areas(): MstMapinfo[] {
    return svdata.mstMapInfos.filter(el => el.api_maparea_id === this.area_id);
  }

  private get areaNo(): number {
    return this.areaNos[this.area_index];
  }

  public mounted(): void {
    console.log('areas mounted area', this.area_id, this.area_index);  
    this.cb_map_start = ApiCallback.set([Api.REQ_MAP_START, () => this.onMapStart()]);
    this.selectBattleTab();
  }

  public destroyed(): void {
    console.log('areas destroyed', this.area_id, this.area_index);
    ApiCallback.unset(this.cb_map_start);
  }

  private onMapStart(): void {
    console.log('area map start');
    this.selectBattleTab();
  }

  private selectBattleTab(): void {
    console.log('areas select tab', svdata.inMap, svdata.mapStart?.api_maparea_id, svdata.mapStart?.api_mapinfo_no);
    if (! svdata.inMap) {
      return ;
    }
    const map_start = svdata.mapStart;
    if (map_start?.api_maparea_id !== this.area_id) {
      return ;
    }
    this.area_index = map_start.api_mapinfo_no-1;
  }

  private onChange(value: number) {
    console.log('area change old value', this.area_id, this.area_index, value, 'event-map', this.isEventMap);
    this.selected_label = '';
  }

  private areaNoText(index: number): string {
    if (this.isEventMap) {
      return `E-${index+1}`;
    }
    return `${this.area_id}-${index+1}`;
  }

  private get isEventMap(): boolean {
    return this.area_id > 40;
  }

  private isBattleArea(index: number): boolean {
    //console.log('is battle area index', index, this.area_index);
    if (! svdata.inMap) {
      return false;
    }

    const map_start = svdata.mapStart;
    if (map_start?.api_maparea_id !== this.area_id) {
      return false;
    }
    return index === map_start.api_mapinfo_no-1;
  }

  private isAreaLocked(index: number): boolean {  
    if (! this.isEventMap) {
      return false;
    }

    if (0 === index) {
      return false;
    }
    
    if (AppStuff.isProduction) {
      return false;
    }

    const id = this.areas[index].api_id;
    console.log(this.areas);
    console.log('area locked', this.area_id, id, svdata.mapinfos.some(el => el.api_id === id))
    return !svdata.mapinfos.some(el => el.api_id === id);
  }

  private indicatorClick(event: Event): void {
    if ((event.target as HTMLElement).classList.contains('is-locked')) {
      event.stopPropagation();
    }
  }

  private lockClick(event: Event): void {
    event.stopPropagation();
  }

}
</script>
