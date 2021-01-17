<template>
  <div v-if="isDataOk" class="slotitem-list-root">
    <div class="buttons">
      <b-button @click="ctgl(0)" :outlined="!iscon(0)" :type="cclr(0)"  size="is-small">{{ctxt(0)}}</b-button>
      <b-button @click="ctgl(1)" :outlined="!iscon(1)" :type="cclr(1)"  size="is-small">{{ctxt(1)}}</b-button>
      <b-button @click="ctgl(2)" :outlined="!iscon(2)" :type="cclr(2)"  size="is-small">{{ctxt(2)}}</b-button>
      <b-button @click="ctgl(3)" :outlined="!iscon(3)" :type="cclr(3)"  size="is-small">{{ctxt(3)}}</b-button>
      <b-button @click="ctgl(4)" :outlined="!iscon(4)" :type="cclr(4)"  size="is-small">{{ctxt(4)}}</b-button>
      <b-button @click="ctgl(5)" :outlined="!iscon(5)" :type="cclr(5)"  size="is-small">{{ctxt(5)}}</b-button>
      <b-button @click="ctgl(6)" :outlined="!iscon(6)" :type="cclr(6)"  size="is-small">{{ctxt(6)}}</b-button>
      <b-button @click="ctgl(7)" :outlined="!iscon(7)" :type="cclr(7)"  size="is-small">{{ctxt(7)}}</b-button>
      <b-button @click="ctgl(8)" :outlined="!iscon(8)" :type="cclr(8)"  size="is-small">{{ctxt(8)}}</b-button>
      <b-button @click="ctgl(9)" :outlined="!iscon(9)" :type="cclr(9)"  size="is-small">{{ctxt(9)}}</b-button>
      <b-button @click="ctgl(10)" :outlined="!iscon(10)" :type="cclr(10)"  size="is-small">{{ctxt(10)}}</b-button>
      <b-button @click="ctgl(11)" :outlined="!iscon(11)" :type="cclr(11)"  size="is-small">{{ctxt(11)}}</b-button>
      <b-button @click="ctgl(12)" :outlined="!iscon(12)" :type="cclr(12)"  size="is-small">{{ctxt(12)}}</b-button>
      <b-button @click="ctgl(13)" :outlined="!iscon(13)" :type="cclr(13)"  size="is-small">{{ctxt(13)}}</b-button>
      <b-button @click="ctgl(14)" :outlined="!iscon(14)" :type="cclr(14)"  size="is-small">{{ctxt(14)}}</b-button>
      <b-button @click="ctgl(15)" :outlined="!iscon(15)" :type="cclr(15)"  size="is-small">{{ctxt(15)}}</b-button>
      <b-button @click="ctgl(16)" :outlined="!iscon(16)" :type="cclr(16)"  size="is-small">{{ctxt(16)}}</b-button>
      <b-button @click="ctgl(17)" :outlined="!iscon(17)" :type="cclr(17)"  size="is-small">{{ctxt(17)}}</b-button>
      <b-button @click="ctgl(18)" :outlined="!iscon(18)" :type="cclr(18)"  size="is-small">{{ctxt(18)}}</b-button>
      <b-button @click="ctgl(19)" :outlined="!iscon(19)" :type="cclr(19)"  size="is-small">{{ctxt(19)}}</b-button>
      <b-button @click="ctgl(20)" :outlined="!iscon(20)" :type="cclr(20)"  size="is-small">{{ctxt(20)}}</b-button>
      <b-button @click="ctgl(21)" :outlined="!iscon(21)" :type="cclr(21)"  size="is-small">{{ctxt(21)}}</b-button>
      <b-button @click="ctgl(22)" :outlined="!iscon(22)" :type="cclr(22)"  size="is-small">{{ctxt(22)}}</b-button>
      <b-button @click="ctgl(23)" :outlined="!iscon(23)" :type="cclr(23)"  size="is-small">{{ctxt(23)}}</b-button>
      <b-button @click="ctgl(24)" :outlined="!iscon(24)" :type="cclr(24)"  size="is-small">{{ctxt(24)}}</b-button>
      <b-button @click="ctgl(25)" :outlined="!iscon(25)" :type="cclr(25)"  size="is-small">{{ctxt(25)}}</b-button>
      <b-button @click="ctgl(26)" :outlined="!iscon(26)" :type="cclr(26)"  size="is-small">{{ctxt(26)}}</b-button>
      <b-button @click="ctgl(27)" :outlined="!iscon(27)" :type="cclr(27)"  size="is-small">{{ctxt(27)}}</b-button>
      <b-button @click="ctgl(28)" :outlined="!iscon(28)" :type="cclr(28)"  size="is-small">{{ctxt(28)}}</b-button>
      <b-button @click="ctgl(29)" :outlined="!iscon(29)" :type="cclr(29)"  size="is-small">{{ctxt(29)}}</b-button>
      <b-button @click="ctgl(30)" :outlined="!iscon(30)" :type="cclr(30)"  size="is-small">{{ctxt(30)}}</b-button>
      <b-button @click="ctgl(31)" :outlined="!iscon(31)" :type="cclr(31)"  size="is-small">{{ctxt(31)}}</b-button>
      <b-button @click="ctgl(32)" :outlined="!iscon(32)" :type="cclr(32)"  size="is-small">{{ctxt(32)}}</b-button>
      <b-button @click="ctgl(33)" :outlined="!iscon(33)" :type="cclr(33)"  size="is-small">{{ctxt(33)}}</b-button>
      <b-button @click="ctgl(34)" :outlined="!iscon(34)" :type="cclr(34)"  size="is-small">{{ctxt(34)}}</b-button>
      <b-button @click="ctgl(35)" :outlined="!iscon(35)" :type="cclr(35)"  size="is-small">{{ctxt(35)}}</b-button>
      <b-button @click="ctgl(36)" :outlined="!iscon(36)" :type="cclr(36)"  size="is-small">{{ctxt(36)}}</b-button>
      <b-button @click="ctgl(37)" :outlined="!iscon(37)" :type="cclr(37)"  size="is-small">{{ctxt(37)}}</b-button>
      <b-button @click="ctgl(38)" :outlined="!iscon(38)" :type="cclr(38)"  size="is-small">{{ctxt(38)}}</b-button>
      <b-button @click="ctgl(39)" :outlined="!iscon(39)" :type="cclr(39)"  size="is-small">{{ctxt(39)}}</b-button>
      <b-button @click="ctgl(40)" :outlined="!iscon(40)" :type="cclr(40)"  size="is-small">{{ctxt(40)}}</b-button>
      <b-button @click="ctgl(41)" :outlined="!iscon(41)" :type="cclr(41)"  size="is-small">{{ctxt(41)}}</b-button>
      <b-button @click="ctgl(42)" :outlined="!iscon(42)" :type="cclr(42)"  size="is-small">{{ctxt(42)}}</b-button>
      <b-button @click="ctgl(43)" :outlined="!iscon(43)" :type="cclr(43)"  size="is-small">{{ctxt(43)}}</b-button>
      <b-button @click="ctgl(44)" :outlined="!iscon(44)" :type="cclr(44)"  size="is-small">{{ctxt(44)}}</b-button>
      <b-button @click="ctgl(45)" :outlined="!iscon(45)" :type="cclr(45)"  size="is-small">{{ctxt(45)}}</b-button>
      <b-button @click="ctgl(46)" :outlined="!iscon(46)" :type="cclr(46)"  size="is-small">{{ctxt(46)}}</b-button>
      <b-button @click="ctgl(47)" :outlined="!iscon(47)" :type="cclr(47)"  size="is-small">{{ctxt(47)}}</b-button>
      <b-button @click="ctgl(48)" :outlined="!iscon(48)" :type="cclr(48)"  size="is-small">{{ctxt(48)}}</b-button>
    </div>
    <div class="list-content">
      count: {{slotitems.length}}
      <div class="weapon-list">
        <div v-for="(data, index) in slotitems" :key="index" :title="data.mst.api_name">
          <img class="weapon-img" :src="data.src">
          <span class="weapon-name">{{data.mst.api_name}}</span>
          <span v-if="data.level > 0" class="level">★<span v-if="data.level===10">MAX</span><span v-else>{{data.level}}</span></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ApiSlotitem, MstSlotitemEquiptype, MstSlotitem } from '@/lib/kcs';
import { svdata } from '@/renderer/store/svdata';
import { Component, Vue } from 'vue-property-decorator';
import { RUtil } from '@/renderer/util';

interface ComboItem {
  text: string;
  value: MstSlotitemEquiptype;
}

interface Category {
  id: number;
  show: boolean;
  text: string;
}
class Cat implements Category {
  id = 0;
  show = false;
  text = "";
  public constructor(id: number, text: string) {
    this.id = id;
    this.text = text;
  }
}

interface SlotItemData {
  api: ApiSlotitem;
  mst: MstSlotitem;
  src: string;
  level: number;
}


@Component({
  components: {},
})
export default class SlotitemList extends Vue {
  private cats: Cat[] = [
    new Cat(-1, 'ALL'),
    new Cat(1, '小口径'),
    new Cat(2, '中口径'),
    new Cat(3, '大口径'),
    new Cat(4, '副砲'),
    new Cat(5, '魚雷'),
    new Cat(6, '艦戦'),
    new Cat(7, '艦爆'),
    new Cat(8, '艦攻'),
    new Cat(9, '艦偵'),
    new Cat(10, '水偵'),
    new Cat(11, '水爆'),
    new Cat(12, '小型電探'),
    new Cat(13, '大型電探'),
    new Cat(14, 'ソナー'),
    new Cat(15, '爆雷'),
   //new Cat(16, '追加装甲'),
    new Cat(17, '機関部強化'),
    new Cat(18, '対空強化弾'),
    new Cat(19, '対艦強化弾'),
    new Cat(21, '機銃'),
    new Cat(22, '特殊潜航艇'),
    new Cat(23, 'ダメコン'),
    new Cat(24, '上陸用舟艇'),
    new Cat(25, 'オートジャイロ'),
    new Cat(26, '対潜哨戒機'),
    new Cat(27, 'バルジ(中型)'),
    new Cat(28, 'バルジ(大型)'),
    new Cat(29, '探照灯'),
    new Cat(30, 'ドラム缶'),
    new Cat(31, '艦艇修理施設'),
    new Cat(32, '潜水艦魚雷'),
    new Cat(33, '照明弾'),
    new Cat(34, '司令部施設'),
    new Cat(35, '航空要員'),
    new Cat(36, '高射装置'),
    new Cat(39, '水上艦要員'),
    new Cat(40, '大型ソナー'),
    new Cat(41, '大型飛行艇'),
    new Cat(42, '大型探照灯'),
    new Cat(43, '戦闘糧食'),
    new Cat(44, '補給物資'),
    new Cat(45, '水戦'),
    new Cat(46, '内火艇'),
    new Cat(47, '陸攻'),
    new Cat(48, '局戦'),
    new Cat(49, '陸上偵察機'),
    //new Cat(50, '輸送機材'),
    new Cat(51, '潜水艦装備'),
    new Cat(53, '大型陸上機'),
    //new Cat(56, '噴式戦闘機'),
    new Cat(57, '噴式戦闘爆撃機'),
  ];

  public constructor() {
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
    //console.log(this.cats[idx]);
    return this.cats[idx].text;
  }

  private get isDataOk() {
    return svdata.isSlotitemDataOk;
  }

  private get slotitems(): SlotItemData[] {

    const ret: SlotItemData[] = [];


    let slotitems = svdata.slotitems;
    const cats = this.cats;
    if (!cats[0].show) {
      slotitems.forEach((api) => {
        const mst = svdata.mstSlotitem(api.api_slotitem_id);
        if (!mst) {
          return false;
        }

        const hit = !!cats.find(cat => {
          if (cat.show && mst.api_type[2] === cat.id) {
            return true;
          }
          return false;
        });
        if (hit) {
          ret.push({ api, mst, src: RUtil.weaponImg(mst.api_id), level: weaponLevel(api) });
        }
      });
    } else {
      slotitems.forEach((api) => {
        const mst = svdata.mstSlotitem(api.api_slotitem_id);
        if (!mst) {
          return;
        }
        ret.push({ api, mst, src: RUtil.weaponImg(mst.api_id), level: weaponLevel(api) });
      });
    }

    ret.sort((i1, i2) => {
      if (i1.mst.api_type[2] === i2.mst.api_type[2]) {
        if (i1.api.api_slotitem_id === i2.api.api_slotitem_id) {
          return i2.level - i1.level;
          //return i1.api.api_id - i2.api.api_id;
        }
        return i1.api.api_slotitem_id - i2.api.api_slotitem_id;
      }

      return i1.mst.api_type[2] - i2.mst.api_type[2];
    });

    return ret;
  }

  /*
  private slotitemType(slotitem: ApiSlotitem): MstSlotitemEquiptype {
    return svdata.slotitemEquipTypeSafe(slotitem);
  }
  */
}

const weaponLevel = (api: ApiSlotitem): number => {
  if (api.api_level !== undefined) {
    return api.api_level;
  }
  return 0;
}

</script>
