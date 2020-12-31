<template>
  <div class="shipTooltip">
    <div>Lv. {{api.api_lv}} <span class="name">{{mst.api_name}}</span> <span class="exp"><span class="next-level-exp">次のレベルまで</span> {{api.api_exp[1]}} <span class="next-level-exp">exp</span></span></div>
    <hr class="hr">
    <div class="status">
      <span class="s-icon fuel">燃料: {{api.api_fuel}}</span>
      <span class="s-icon bull">弾薬: {{api.api_bull}}</span>
      <span class="s-icon aa">加重対空: {{kajuTaiku}}<span v-html="remodelKTHtml"></span></span>
      <span class="s-icon aa">艦隊防空: {{bouku}}<span v-html="remodelBoukuHtml"></span></span>
      <span class="s-icon range">命中項: {{hit}}% <span v-html="remodelHitHtml"></span></span>
      <span class="s-icon ev">回避項: {{kaihi}}% <span v-html="remodelKaihiHtml"></span></span>
    </div>
    <hr class="hr">
    <div class="status">
      <span class="s-icon hp">耐久: {{api.api_nowhp}}/{{api.api_maxhp}}</span>
      <span class="s-icon fire">火力: {{api.api_karyoku[0]}}<span class="remodel">{{remodelFire}}</span></span> 
      <span class="s-icon armor">装甲: {{api.api_soukou[0]}}<span class="remodel">{{remodelArmor}}</span></span>
      <span class="s-icon tor">雷装: {{api.api_raisou[0]}}<span class="remodel">{{remodelTor}}</span></span>
      <span class="s-icon ev">回避: {{api.api_kaihi[0]}}<span class="remodel">{{remodelEv}}</span></span>
      <span class="s-icon aa">対空: {{api.api_taiku[0]}}</span>
      <span class="s-icon tousai">搭載: {{tousai}}</span>
      <span class="s-icon asw">対潜: {{api.api_taisen[0]}}<span class="remodel">{{remodelAsw}}</span></span>
      <span class="s-icon speed">速力: {{sokuText}}</span>
      <span class="s-icon los">索敵: {{api.api_sakuteki[0]}}<span class="remodel">{{remodelLos}}</span></span>
      <span class="s-icon range">射程: {{syateiText}}</span>
      <span class="s-icon luck">運: {{api.api_lucky[0]}}</span>
    </div>
    <hr class="hr">
    <div class="slot" v-for="(slot, index) in slots" :key="index">
      <span class="slot-onslot">{{slotOnSlotText(slot, index)}}</span>
      <span class="slot-img"><img v-if="slot!==undefined" :src="slotTypeImg(slot)"></span>
      <span class="slot-text" v-if="slot!==undefined">{{slot.mst.api_name}} 
        <img v-if="!!slot.api.api_alv" class="slot-alv-img" :src="slotAlvImg(slot)">
        <span v-if="!!slot.api.api_level" class="slot-level">★{{slotLevelText(slot)}}</span>
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { svdata } from '@/renderer/store/svdata';
import { ApiShip, MstShip, Slot, KcsUtil, MstSlotitemEquiptype, MstSlotitem, Bouku, Kaihi, ShipInfo, Hit } from '@/lib/kcs';
import { MathUtil } from '@/lib/math';
import { RUtil } from '@/renderer/util';
import { Component, Vue, Prop } from 'vue-property-decorator';
import { SokuText, SyateiText } from '@/lib/locale';

const remodelText = (slots: Slot[], func: (mst: MstSlotitem, level: number) => number): string => {
  const add = slots.reduce((acc, slot) => {
    if (slot && slot.api.api_level) {
      acc += func(slot.mst, slot.api.api_level);
    }
    return acc;
  }, 0);

  if (add) {
    return ` + ${MathUtil.floor(add, 2)}`
  }
  return '';
}

@Component({
  components: {},
})
export default class extends Vue {

  @Prop({required: true})
  public ship_id!: number;

  public constructor() {
    super();
    console.debug('ship tooltip ctor. ship id:', this.ship_id);
  }

  private get mst(): MstShip {
    console.log('ship tooltip get mst', this.ship_id);
    return svdata.mstShip(this.api.api_ship_id)!;
  }

  private get api(): ApiShip {
    console.log('ship tooltip get api', this.ship_id);
    return svdata.ship(this.ship_id)!;
  }

  private get shipInfo(): ShipInfo {
    return { api: this.api, mst: this.mst, slots: this.slots, onslotMax: KcsUtil.shipOnSlotMax(this.mst.api_id) };
  }

  private get sokuText(): string {
    return SokuText[this.api.api_soku/5] ?? '';
  }

  private get syateiText(): string {
    return SyateiText[this.api.api_leng] ?? '';
  }

  private get remodelFire(): string {
    return remodelText(this.slots, KcsUtil.fireFromLevel);
  }

  private get remodelTor(): string {
    return remodelText(this.slots, KcsUtil.torFromLevel);
  }

  private get remodelEv(): string {
    return remodelText(this.slots, KcsUtil.evFromLevel);
  }

  private get remodelArmor(): string {
    return remodelText(this.slots, KcsUtil.armorFromLevel);
  }

  private get remodelAsw(): string {
    return remodelText(this.slots, KcsUtil.aswFromLevel);
  }

  private get remodelLos(): string {
    return remodelText(this.slots, KcsUtil.losFromLevel);
  }

  private get shipBouku(): Bouku {
    return KcsUtil.shipBouku(this.shipInfo);
  }

  private get kajuTaiku(): string {
    return this.shipBouku.kt.toString();
  }

  private get remodelKTHtml(): string {
    const b = this.shipBouku;
    if (b.ktRemodel) {
      return `(${MathUtil.floor(b.ktRaw, 2)} + <span class="remodel">${MathUtil.floor(b.ktRemodel, 2)}</span>)`;
    }
    return '';
  }

  private get remodelBoukuHtml(): string {
    const b = this.shipBouku;
    if (b.ktbRemodel) {
      return `(${MathUtil.floor(b.ktbRaw, 2)} + <span class="remodel">${MathUtil.floor(b.ktbRemodel, 2)}</span>)`;
    }
    return '';
  }

  private get shipKaihi(): Kaihi {
    return KcsUtil.shipKaihi(this.shipInfo);
  }

  private get kaihi(): number {
    return MathUtil.floor(this.shipKaihi.kaihi, 2);
  }

  private get remodelKaihiHtml(): string {
    const k = this.shipKaihi;
    if (k.kaihiRemodel) {
      return `(${MathUtil.floor(k.kaihi-k.kaihiRemodel, 2)} + <span class="remodel">${MathUtil.floor(k.kaihiRemodel, 2)}</span>)`;
    }
    return '';
  }

  private get shipHit(): Hit {
    return KcsUtil.shipHit(this.shipInfo);
  }

  private get hit(): number {
    return MathUtil.floor(this.shipHit.hit, 2);
  }

  private get remodelHitHtml(): string {
    const hit = this.shipHit;
    if (hit.hitRemodel) {
      return `(${MathUtil.floor(hit.hit - hit.hitRemodel, 2)} + <span class="remodel">${MathUtil.floor(hit.hitRemodel, 2)}</span>)`;
    }
    return '';
  }

  private get seiku(): number {
    return svdata.shipSeiku(this.api);
  }

  private get bouku(): number {
    return KcsUtil.shipBouku(this.shipInfo).ktb;
  }

  private get shipImg(): string {
    console.log('ship tooltip ship img', this.ship_id);
    return `/img/ship/s${this.mst.api_id}.png`;
  }

  private slotTypeImg(slot: Slot): string {
    return RUtil.slotTypeImg(slot);
  }

  private slotAlvImg(slot: Slot): string {
    return `/img/slot/alv/alv${slot!.api.api_alv}.png`;
  }

  private slotOnSlotText(slot: Slot, index: number): string {
    if (this.tousai === 0) {
      return '';
    }
    const onslot = this.api.api_onslot[index] ?? -1;
    if (onslot >= 0) {
      return onslot.toString();
    }
    return '';
  }

  private slotLevelText(slot: Slot): string {
    const level = slot!.api.api_level;
    return level === 10 ? 'MAX' : level!.toString();
  }

  private get tousai(): number {
    return this.api.api_onslot.reduce((acc, onslot) => acc+onslot, 0);
  }

  private get slots(): Slot[] {
    return svdata.slots(this.api);
  }

  private mounted() {
    console.debug('ship tooltip mounted', this.ship_id);
    //this.$el.classList.remove('ani-start');
    this.$nextTick(() => {
      console.log('ship tooltip mounted tick', this.ship_id);
      this.$el.classList.add('ani-start');
    });
  }

  private beforeUpdate() {
    console.log('ship tooltip before update', this.ship_id);
    //this.$el.classList.remove('ani-start');
  }

  private updated() {
    console.log('ship tooltip updated', this.ship_id);
    /*
    this.$nextTick(() => {
      setTimeout(() => {
        console.log('ship tooltip updated tick50', this.ship_id);
        this.$el.classList.add('ani-start');
      }, 50);
      //this.$el.classList.add('ani-start');
    });
    */
  }
}
</script>
