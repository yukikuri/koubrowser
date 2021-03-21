<template>
  <div class="cell-enemies">
    <b-tabs size="is-small" expanded class="cell-enemy-tabs" @input="onChange" v-model="index" destroy-on-hide>
      <b-tab-item v-for="(item, idx) in items" :key="idx" :headerClass="{'cell-enemy-tab-item': true, 'no-padding': item.maxAA > 0, 'is-battle': item.isBattle}">
        <template slot="header">
          <span>{{item.label}}</span>
          <div class="seiku-wrapper">
            <div v-if="item.maxAA > 0" class="seiku">
              <span class="s-icon seiku"></span>
              <div class="txt">{{item.maxAA}}</div>
            </div>
          </div>
        </template>
        <div>
          <CellEnemy :area_id="area_id" :area_no="area_no" :cell_no="item.no" :deck_index="deck_index"/>
        </div>
      </b-tab-item>
    </b-tabs>
  </div>
</template>

<script lang="ts">
import { svdata } from '@/renderer/store/svdata';
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { MstShip, MapAreaId, ApiShip, ApiCallback, Api } from '@/lib/kcs';
import CellEnemy from '@/renderer/components/CellEnemy.vue';
import { CellInfo, Spot, MapStuff } from '@/lib/map';

interface EnemyTabItem {
  label: string;
  maxAA: number;
  no: number;
  isBattle: boolean;
}

@Component({
  components: {
    CellEnemy,
  },
})
export default class extends Vue {
  private cb_map_start: number = 0;
  private cb_map_next: number = 0;

  @Prop({required: true})
  public area_id!: MapAreaId;
  
  @Prop({required: true})
  public area_no!: number;

  @Prop({required: true})
  public selected_label!: string;

  @Prop({default: 0})
  public deck_index!: number;

  @Prop({default: false})
  public single_row!: boolean;

  private index: number = 0;

  private get spots(): Spot[] {
    const cellInfo = MapStuff.cellInfo(this.area_id, this.area_no);

    const spots = 
      MapStuff.spotsFromLevel(cellInfo, svdata.mapLevel(this.area_id, this.area_no));

    const cells = spots.filter((spot) => spot.type === 'enemy' || spot.type === 'boss');
    // sort by label
    cells.sort((a,b) => a.label.localeCompare(b.label));
    return cells;
  }

  private get items(): EnemyTabItem[] {
    const spots = this.spots;
    const battle_index = this.battleTabIndex;
    console.log('single row:', this.area_id, this.area_no, this.isSingleRow);
    const showAA = this.isSingleRow ? (spots.length <= 16) : true;
    return spots.map((el, index) => {
      return {
        label: el.label,
        maxAA: showAA ? el.maxAa : 0,
        no: el.no,
        isBattle: index === battle_index,
      };
    });   
  }

  public mounted(): void {
    console.log('cell enemies mounted', this.area_id, this.area_no);  
    this.cb_map_start = ApiCallback.set([Api.REQ_MAP_START, () => this.onMapStart()]);
    this.cb_map_next = ApiCallback.set([Api.REQ_MAP_NEXT, () => this.onMapNext()]);
    this.selectBattleTab();
  }

  tag = 'cell enemies';
  private beforeUpdate() {
    console.log('before update', this.tag, this.area_id, this.area_no);
  }

  private updated() {
    console.log('updated', this.tag, this.area_id, this.area_no);
  }

  public destroyed(): void {
    console.log('cell enemies destroyed', this.area_id, this.area_no);
    ApiCallback.unset(this.cb_map_start);
    ApiCallback.unset(this.cb_map_next);
  }

  @Watch('area_no')
  private onAreaNoChanged(): void {
    console.log('cell emenies on area no changed', this.area_id, this.area_no, 'index:', this.index);

    // reset index
    this.index = 0;

    this.selectBattleTab();
  }

  private onMapStart(): void {
    console.log('cell emenies on map start', this.area_id, this.area_id, 'index:', this.index)
    this.selectBattleTab();
  }

  private onMapNext(): void {
    console.log('cell emenies on map next', this.area_id, this.area_id, 'index:', this.index)
    this.selectBattleTab();
  }

  private get battleTabIndex(): number {
    console.log('cell enemyes battle tab index')
    if (! svdata.inMap) {
      return -1;
    }

    const maps = svdata.battleMap;
    if (maps.length === 0) {
      return -1;
    }

    const map = maps[maps.length-1];

    if (map.api_maparea_id !== this.area_id) {
      return -1;
    }
    if (map.api_mapinfo_no !== this.area_no) {
      return -1;
    }

    const cell_info = MapStuff.cellInfo(this.area_id, this.area_no);
    const spot = MapStuff.findSpotForLabel(cell_info.spots, map.api_no);
    if (! spot?.label) {
      return -1;
    }

    return this.spots.findIndex(el => el.label === spot.label);
  }

  private selectBattleTab(): void {
    const index = this.battleTabIndex;
    if (-1 !== index) {
      this.index = index;
    }
  }

  @Watch('selected_label')
  private onSelectedLabelChanged(): void {
    console.log('cell emenies selected_label changed', this.area_id, this.area_no, this.selected_label, 'deck_index:', this.deck_index);
    const index = this.spots.findIndex(el => el.label === this.selected_label);
    if (index >= 0) {
      this.index = index;
    }
  }

  private get isSingleRow(): boolean {
    return this.single_row;
  }

}
</script>
