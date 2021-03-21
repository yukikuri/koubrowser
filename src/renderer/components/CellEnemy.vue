<template>
  <div>
    <b-tabs size="is-small" expanded class="enemy-list-tabs" @input="onChange" v-model="index" destroy-on-hide>
      <b-tab-item v-for="(item, idx) in items" :key="idx" :headerClass="{ 'no-padding': item.info.aa > 0, 'is-battle': inMap && item.isBattle }">
        <template slot="header">
          <span>構成{{idx+1}}</span>
          <div class="seiku-wrapper">
            <div v-if="item.info.aa > 0" class="seiku">
              <span class="s-icon seiku"></span>
              <span class="txt">{{item.info.aa}}</span>
            </div>
          </div>
        </template>
        <div>
          <EnemyList :info="item.info" :deck_index="deck_index" />
        </div>
      </b-tab-item>
    </b-tabs>
  </div>
</template>


<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { Api, ApiBattleStartType, ApiCallback, ApiMiddayBattleType, MapAreaId } from '@/lib/kcs';
import EnemyList from '@/renderer/components/EnemyList.vue';
import { EnemyInfo } from '@/renderer/util';
import { replaceArray } from '@/lib/ts';
import { svdata } from '@/renderer/store/svdata';
import { MapStuff } from '@/lib/map';

interface EnemyItem {
  info: EnemyInfo;
  isBattle: boolean;
}

@Component({
  components: {
    EnemyList,
  },
})
export default class extends Vue {
  private cb_battle_start: number = 0;
  private ship_ke: number[] = [];

  @Prop({required: true})
  public area_id!: MapAreaId;
  
  @Prop({required: true})
  public area_no!: number;

  @Prop({required: true})
  public cell_no!: number;

  @Prop({default: 0})
  public deck_index!: number;

  private index: number = 0;

  private get items(): EnemyItem[] {
    const info = MapStuff.cellInfo(this.area_id, this.area_no);
    const spots = 
      MapStuff.spotsFromLevel(info, svdata.mapLevel(this.area_id, this.area_no));

    const cell = spots.find((spot) => spot.no === this.cell_no);
    if (! cell) {
      return [];
    }

    let inBattle = false;
    const battle = svdata.lastBattle;
    if (battle) {
      if ((battle.map.api_maparea_id === this.area_id) &&
          (battle.map.api_mapinfo_no === this.area_no)) {
        const spot = MapStuff.findSpotForLabel(spots, battle.cell_no);
        inBattle = (spot?.no === this.cell_no);
      }
    }

    const ship_ke = this.ship_ke;
    const items = cell.enemy.map((el, index) => {
      const info: EnemyInfo = {
        area_id: this.area_id,
        area_no: this.area_no,
        cell_no: this.cell_no,
        enemy: el,
        aa: cell.aa[index],
      };
      return {
        info,
        isBattle: inBattle && ship_ke.length === el.length && ship_ke.every((enemy_id, idx) => el[idx] === enemy_id),
      }
    });
    console.log('cell enemy items. inBattle:', inBattle, JSON.stringify(items));
    return items;
  }

  public beforeMount() {
    this.setShipKe();
    console.log('cell enemy before mount. ship ke setted.', this.area_id, this.area_no, this.ship_ke);
  }

  public mounted(): void {
    console.log('cell enemy mounted', this.area_id, this.area_no, 'deck_index:', this.deck_index);  
    this.cb_battle_start = ApiCallback.set(['battle-start', (arg: ApiBattleStartType) => this.onBattleStart(arg)]);
    this.selectBattleTab();
  }

  public destroyed(): void {
    console.log('cell enemy destroyed', this.area_id, this.area_no, this.cell_no);
    ApiCallback.unset(this.cb_battle_start);
  }

  private onBattleStart(arg: ApiBattleStartType): void {
    console.log('cell enemy on battle start', this.area_id, this.area_no, this.cell_no, JSON.stringify(arg.api_ship_ke));
    this.setShipKe();
    this.selectBattleTab();
  }

  private setShipKe(): boolean {
    const battle = svdata.lastBattle;
    if (battle) {
      if ((battle.map.api_maparea_id === this.area_id) &&
          (battle.map.api_mapinfo_no === this.area_no)) {
        const info = MapStuff.cellInfo(this.area_id, this.area_no);
        const spots = 
          MapStuff.spotsFromLevel(info, svdata.mapLevel(this.area_id, this.area_no));
        const spot = MapStuff.findSpotForLabel(spots, battle.cell_no);
        if (spot?.no === this.cell_no) {
          if (battle.midday) {
            replaceArray(this.ship_ke, battle.midday.api_ship_ke);
          } else if (battle.midnight) {
            replaceArray(this.ship_ke, battle.midnight.api_ship_ke);
          }
          console.log('cell emeny set ship ke', this.ship_ke);
          return true;
        }
      }
    }
    return false;
  }

  private get inMap(): boolean {
    return svdata.inMap;
  }

  private selectBattleTab(): void {
    if (! svdata.inMap) {
      return ;
    }

    const battle = svdata.lastBattle;
    if (! battle) {
      return ;
    }

    if ((battle.map.api_maparea_id !== this.area_id) ||
        (battle.map.api_mapinfo_no !== this.area_no)) {
      return ;
    }

    if (this.ship_ke.length === 0) {
      return ;
    }

    const info = MapStuff.cellInfo(this.area_id, this.area_no);
    const spots = 
      MapStuff.spotsFromLevel(info, svdata.mapLevel(this.area_id, this.area_no));

    const spot = MapStuff.findSpotForLabel(spots, battle.cell_no);
    if (spot?.no !== this.cell_no) {
      return ;
    }

    const ship_ke = this.ship_ke;

    const index = spot.enemy.findIndex((el, index) => {
      if (el.length !== ship_ke.length) {
        return false;
      }
      return ship_ke.every((enemy_id, idx) => el[idx] === enemy_id);
    });

    if (index === -1) {
      return ;
    }
    this.index = index;
  }
}
</script>
