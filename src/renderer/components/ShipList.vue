<template>
  <div class="ship-list-root" v-if="isDataOk">
    <div class="buttons">
      <b-button @click="ctgl(0)" outlined="true" :type="cclr(0)" size="is-small">{{ctxt(0)}}</b-button>
      <b-button @click="ctgl(1)" :outlined="!iscon(1)" :type="cclr(1)" size="is-small">{{ctxt(1)}}</b-button>
      <b-button @click="ctgl(2)" :outlined="!iscon(2)" :type="cclr(2)" size="is-small">{{ctxt(2)}}</b-button>
      <b-button @click="ctgl(3)" :outlined="!iscon(3)" :type="cclr(3)" size="is-small">{{ctxt(3)}}</b-button>
      <b-button @click="ctgl(4)" :outlined="!iscon(4)" :type="cclr(4)" size="is-small">{{ctxt(4)}}</b-button>
      <b-button @click="ctgl(5)" :outlined="!iscon(5)" :type="cclr(5)" size="is-small">{{ctxt(5)}}</b-button>
      <b-button @click="ctgl(6)" :outlined="!iscon(6)" :type="cclr(6)" size="is-small">{{ctxt(6)}}</b-button>
      <b-button @click="ctgl(7)" :outlined="!iscon(7)" :type="cclr(7)" size="is-small">{{ctxt(7)}}</b-button>
      <b-button @click="ctgl(8)" :outlined="!iscon(8)" :type="cclr(8)" size="is-small">{{ctxt(8)}}</b-button>
      <b-button @click="csv" outlined="true" type="is-success" size="is-small">表示をcsvで保存</b-button>
    </div>
    <div class="list-content">
      count: {{ships.length}}
      <div class="ship-list">
        <div v-for="(data, index) in ships" :key="index">
          <img class="ship-img" :src="data.src">
          <div>
            <span class="ship-name">{{data.ship_name}}&nbsp;</span>
            <span class="level" :class="{ 'is-over': data.api.api_lv >= 100 }">Lv: {{data.api.api_lv}}&nbsp;</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ApiShip, MstShip, ShipInfo } from '@/lib/kcs';
import { svdata } from '@/renderer/store/svdata';
import { Component, Vue } from 'vue-property-decorator';
import { MainChannel } from '@/lib/app';
import { ipcRenderer } from 'electron';
import { RUtil } from '@/renderer/util';

interface Category {
  ids: number[];
  show: boolean;
  text: string;
}
class Cat implements Category {
  ids = [];
  show = false;
  text = "";
  public constructor(ids: number[], text: string) {
    Array.prototype.push.apply(this.ids, ids);
    this.text = text;
  }
}

const ShipTypeName = [
  '',
  '海防艦',
  '駆逐艦',
  '軽巡洋艦',
  '重雷装巡洋艦',
  '重巡洋艦',
  '航空巡洋艦',
  '軽空母',
  '戦艦',
  '戦艦',
  '航空戦艦',
  '正規空母',
  '超弩級戦艦',
  '潜水艦',
  '潜水空母',
  '補給艦',
  '水上機母艦',
  '揚陸艦',
  '装甲空母',
  '工作艦',
  '潜水母艦',
  '練習巡洋艦',
  '補給艦',
] as const;

interface ShipData {
  api: ApiShip;
  mst: MstShip;
  src: string;
  ship_name: string;
}

@Component({
  components: {},
})

export default class extends Vue {

  private cats: Cat[] = [
    new Cat([], 'ALL'),
    new Cat([8,9,10,12,], '戦艦級'),
    new Cat([7,11,18], '航空母艦'),
    new Cat([5,6], '重巡級'),
    new Cat([3,4,21], '軽巡級'),
    new Cat([2], '駆逐級'),
    new Cat([1], '海防艦'),
    new Cat([13,14], '潜水艦'),
    new Cat([15,16,17,19,20,22], '艦艇'),
  ];

  constructor() {
    super();
    this.cats[0].show = true;
  }

  private ctgl(idx: number): void {
    let cats = this.cats;
    if (0 === idx) {
      const save = cats[0].show;
      cats.forEach(cat => {
        cat.show = false;
      });
      cats[0].show = !save;
    } else {
      cats[idx].show = !cats[idx].show;
      if (cats[idx].show) {
        cats[0].show = false;
      }
    }
  }

  private iscon(idx: number): boolean {
    return this.cats[idx].show;
  }

  private cclr(idx: number): string {
    return this.cats[idx].show ? 'is-primary' : 'is-info';
  }

  private ctxt(idx: number): string {
    return this.cats[idx].text;
  }

  private get isDataOk(): boolean {
    return svdata.isShipDataOk;
  }

  private get ships(): ShipData[] {
    let ships = svdata.ships;

    if (!this.cats[0].show) {
      ships = ships.filter((ship) => {
        const mst = svdata.mstShip(ship.api_ship_id);
        if (! mst) {
          return false;
        }
        return this.cats.find((cat:Category) => {
          if (cat.show && cat.ids.indexOf(mst.api_stype) >= 0) {
            return true;
          }
          return false;
        });
      });
    }

    const ret = ships.reduce<ShipData[]>((acc, api) => {
      const mst = svdata.mstShip(api.api_ship_id);
      if (mst) {
        acc.push({ 
          api, mst, 
          src: RUtil.shipBannerImg(mst.api_id, false), 
          ship_name: ShipTypeName[mst.api_stype]+' '+mst.api_name }
        );
      }
      return acc;
    }, []);

    ret.sort((i1, i2) => {
      if (i1.mst.api_stype === i2.mst.api_stype) {
        return i2.api.api_lv - i1.api.api_lv;
        /*
        if (i1.api.api_ship_id === i2.api.api_ship_id) {
          return i2.api.api_lv - i1.api.api_lv;
        }
        return i1.api.api_ship_id - i2.api.api_ship_id;
        */
      }
      return i1.mst.api_stype - i2.mst.api_stype;
    });

    return ret;
  }

  private csv() {
    let ret: string[] = [];
    ret.push('type, name, lv, id');
    const ships = this.ships;
    ships.forEach((data) => {
      ret.push(`${ShipTypeName[data.mst.api_stype]}, ${data.mst.api_name}, ${data.api.api_lv}, ${data.api.api_ship_id}`);
    });

    ipcRenderer.invoke(MainChannel.ship_csv, ret.join('\r\n'));
  }
}
</script>
