<template>
  <div class="airbase">
    <div class="airbase-info">
      <!--<span class="airbase-no">{{noText}}</span>-->
      <span class="airbase-action" :class="actionClass">{{actionText}}</span> 
      <span class="airbase-range">半:{{distanceBaseText}}{{distanceBonusText}}</span>
      <span class="airbase-aa">制空:{{seikuText}}</span>
      <span class="airbase-spot">{{targetLabelText1}}</span>
      <span class="airbase-spot">{{targetLabelText2}}</span>
    </div>
    <div class="airbase-slots">
      <b-tooltip v-for="(slot, index) in slots" :key="index" :always0="index===0"
        position="is-right" multilined square="true" :animated="false" class="slot-tip">
        <template v-slot:content>
          <div class="slot-content">
            <div class="slot-tip-name">
              <div>{{slot.slot.mst.api_name}}<span v-if="slot.star!==''" class="plane-star"> ★{{slot.star}}</span></div>
            </div>
            <div class="slot-tip-status">
              <div><img :src="slot.weapon_img" class="weapon-img"></div>
              <div>
                <div v-if="slot.seiku>0">制空: {{slot.seiku}}</div>
                <div class="slot-tip-grid">
                  <div v-for="(status, index) in slot.statuses" :key="index">
                    {{status.name}}: {{status.status}}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
        <div class="airbase-slot">
          <span class="slot-img">
            <img v-if="slot!==undefined" class="type-img" :src="slot.type_img">
            <span v-if="slot!==undefined" class="onslot" :class="slot.onslotClass">{{slot.plane.api_count}}/{{slot.plane.api_max_count}}</span>
          </span>
          <span class="slot-alv-content">
            <span v-if="slot!==undefined" class="slot-alv"><img v-if="slot.alv_img!==''" :src="slot.alv_img"></span>
            <span v-if="slot!==undefined" class="plane-seiku">{{slot.seiku}}</span>
          </span>
          <span v-if="slot!==undefined" class="slot-name" :class="slot.slotClass">{{slot.slot.mst.api_name}}</span>
          <span v-if="slot!==undefined&&slot.star!==''" class="plane-star">★{{slot.star}}</span>
        </div>
      </b-tooltip>
    </div>
  </div>
</template>

<script lang="ts">
import { 
  ApiAirBase, 
  ApiPlaneInfo, 
  ApiSlotitem, 
  MstSlotitem, 
  KcsUtil, 
  AirBaseActionKind,
  SlotInfo,
  SlotitemImgType,
  SlotitemType,
} from '@/lib/kcs';
import { AirbaseActionKindText } from '@/lib/locale';
import { svdata } from '@/renderer/store/svdata';
import { Component, Vue, Prop } from 'vue-property-decorator';
import { RUtil } from '@/renderer/util';
import { Spot } from '@/lib/map';
import { MathUtil } from '@/lib/math';

const nos = [
  '一', '二', '三'
] as const;

interface ActionClass {
  'is-taiki'?: boolean;
  'is-syutugeki'?: boolean;
  'is-bouku'?: boolean;
  'is-taihi'?: boolean;
  'is-kyuusoku'?: boolean;
}
const ActionClasses = ['is-taiki', 'is-syutugeki', 'is-bouku', 'is-taihi', 'is-kyuusoku'] as const;

interface SlotClass {
  'is-fighter'?: boolean;
  'is-attacker'?: boolean;
  'is-asw'?: boolean;
  'is-rec'?: boolean;
  'is-star'?: boolean;
}

interface OnslotClass {
  'is-orange'?: boolean;
  'is-red'?: boolean;
}

interface Status {
  name: string;
  status: string;
}

interface AirBaseSlot {
  slot: SlotInfo;
  plane: ApiPlaneInfo;
  type_img: string;
  alv_img: string;
  weapon_img: string;
  slotClass: SlotClass;
  onslotClass: OnslotClass;
  seiku: number;
  star: string;
  statuses: Status[];
}

const getSlotClass = (slot: SlotInfo): SlotClass => {
  const img_type = KcsUtil.slotitemImgType(slot.mst);
  const star = (slot.api?.api_level ?? 0) > 0;
  if ([6, 38, 41, 44, 45].includes(img_type)) {
    return { 'is-fighter': true, 'is-star': star };
  }
  if ([7, 8, 37, 46, 48].includes(img_type)) {
    return { 'is-attacker': true, 'is-star': star };
  }
  if ([47].includes(img_type)) {
    return { 'is-asw': true, 'is-star': star };
  }
  if ([9, 10, 33, 39, 40 ].includes(img_type)) {
    return { 'is-rec': true, 'is-star': star };
  }

  return {};
};

const planeStatus = (slot: SlotInfo): Status[] => {
  const ret: Status[] = [];
  const mst = slot.mst;
  const type = KcsUtil.slotitemType(mst);

  if (mst.api_houg) {
    ret.push({ name: '火力', status: mst.api_houg.toString() });
  }

  if (mst.api_raig) {
    ret.push({ name: '雷撃', status: mst.api_raig.toString() });
  }

  if (mst.api_baku) {
    ret.push({ name: '爆装', status: mst.api_baku.toString() });
  }

  if (mst.api_tyku) {
    ret.push({ name: '対空', status: mst.api_tyku.toString() });
  }

  if (mst.api_tais) {
    ret.push({ name: '対潜', status: mst.api_tais.toString() });
  }

  if (mst.api_houm) {
    ret.push({ name: type === SlotitemType.LandFighter ? '対爆' : '命中', status: mst.api_houm.toString() });
  }

  if (mst.api_houk) {
    ret.push({ name: type === SlotitemType.LandFighter ? '追撃' : '回避', status: mst.api_houk.toString() });
  }

  if (type === SlotitemType.LandFighter) {
    ret.push({ name: '出撃', status: MathUtil.floor(mst.api_tyku+mst.api_houk*1.5, 1).toString() });
    ret.push({ name: '防空', status: (mst.api_tyku+mst.api_houk+mst.api_houm*2).toString() });
  }

  if (mst.api_saku) {
    ret.push({ name: '索敵', status: mst.api_saku.toString() });
  }

  if (mst.api_souk) {
    ret.push({ name: '装甲', status: mst.api_souk.toString() });
  }

  if (mst.api_distance) {
    ret.push({ name: '半径', status: mst.api_distance.toString() });
  }

  return ret;
};

const getOnslotClass = (plane: ApiPlaneInfo): OnslotClass => {
  if (undefined === plane.api_count || undefined === plane.api_max_count) {
    return {};
  }

  if (plane.api_count === plane.api_max_count && plane.api_count) {
    return {};
  }

  if (plane.api_count === 0) {
    return { 'is-red': true };
  }

  return { 'is-orange': true };
};

/*

interface SlotTypeText {
  [key: number]: string;
}

const slotTypeTexts: SlotTypeText = {  
  6: '艦戦', // 艦上戦闘機
  7: '艦爆', // 艦上爆撃機
  8: '艦攻',  // 艦上攻撃機
  9: '艦偵',  // 艦上偵察機
  10: '水偵', // 水上偵察機
  33: '大艇', // 大型飛行艇
  37: '陸攻', // 陸上攻撃機
  38: '局戦', // 局戦
  39: '噴式', // 噴式戦闘爆撃機
  40: '噴式', // 噴式戦闘爆撃機
  41: '水戦', // 水上戦闘機
  44: '陸戦', // 陸上戦闘機
  45: '夜戦', // 夜間戦闘機
  46: '夜攻', // 夜間攻撃機
  47: '哨戒', // 対潜哨戒機
  48: '重爆',//  大型陸上機
};

const slotTypeText = (mst: MstSlotitem): string => {
  const img_type: number = KcsUtil.slotitemImgType(mst);
  return slotTypeTexts[img_type] ?? '';
};
*/

@Component({
  components: {},
})
export default class extends Vue {

  @Prop({required: true})
  public airbase!: ApiAirBase;

  @Prop({required: true})
  public index!: number;

  @Prop({required: true})
  public target_label!: string;

  public constructor() {
    super();
  }
  
  private mounted(): void {
    console.log('airbase mounted', this.airbase.api_name, this.target_label);
  }

  private destroyed(): void {
    console.log('airbase destroyed', this.airbase.api_name);
  }

  private get isEmpty(): boolean {
    return this.airbase.api_distance.api_base === 0;
  }

  private get actionClass(): ActionClass {
    const cls = ActionClasses[this.airbase.api_action_kind];
    if (! cls) {
      return {}
    }
    const v: ActionClass = {};
    v[cls] = true;
    return v;
  }

  private get slots(): (AirBaseSlot | undefined)[] {
    const planes = this.airbase.api_plane_info;
    return planes.reduce<(AirBaseSlot|undefined)[]>((acc, el) => {
      const slot = svdata.slot(el.api_slotid); 
      if (! slot) {
        acc.push(undefined);
      } else {
        const seiku = KcsUtil.planeSeiku(slot.mst, slot.api, el.api_count!, this.airbase.api_action_kind);
        let star = '';
        if (slot.api.api_level) {
          star = slot.api.api_level === 10 ? 'M' : slot.api.api_level.toString();
        }
        acc.push({
          slot,
          plane: el,
          type_img: RUtil.slotTypeImg(slot),
          alv_img: slot.api.api_alv ? RUtil.slotALevelImg(slot.api.api_alv) : '',
          weapon_img: RUtil.weaponImg(slot.mst.api_id),
          slotClass: getSlotClass(slot),
          onslotClass: getOnslotClass(el),
          seiku,
          star,
          statuses: planeStatus(slot),
        });
      }
      return acc;
    }, []);
  }

  private get nameText(): string {
    return this.airbase.api_name;
  }

  private get noText(): string {
    return `第${nos[this.index]}`;
    //return `${nos[this.index]}`;
  }

  private get actionText(): string {
    return AirbaseActionKindText[this.airbase.api_action_kind] ?? '?';
  }

  private get distanceBaseText(): string {
    const base = this.airbase.api_distance.api_base;
    if (! base) {
      return '-';
    }
    return this.airbase.api_distance.api_base.toString();
  }

  private get distanceBonusText(): string {
    const bonus = this.airbase.api_distance.api_bonus;
    if (! bonus) {
      return '';
    }
    return '+'+bonus;
  }

  private get seikuText(): string {
    if (this.isEmpty) {
      return '-';
    }
    const aa = svdata.airbaseSeiku(this.airbase);
    if (aa < 0) {
      return '-';
    }
    return aa.toString();
  }

  private get targetLabelText1(): string {
    if (this.airbase.api_action_kind !== AirBaseActionKind.syutugeki ) {
      return '-';
    }
    return this.target_label;//[0];
  }

  private get targetLabelText2(): string {
    if (this.airbase.api_action_kind !== AirBaseActionKind.syutugeki ) {
      return '-';
    }
    return this.target_label;//[1];
  }

}
</script>

