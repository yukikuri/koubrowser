<template>
  <div class="deck-map">
    <div class="deck-status">
      合計
      <!--<span class="aa">航戦形態: --&nbsp;</span>-->
      <span class="s-icon fire">火力:{{deckFire()}}&nbsp;</span>
      <span class="s-icon asw">対潜:{{deckASW()}}&nbsp;</span>
      <span class="s-icon aa">対空:{{deckAA()}}&nbsp;</span>
      <span class="s-icon los">索敵:{{deckLos()}}(Map: {{mapLosText}} )&nbsp;</span>
      <span class="s-icon seiku">制空値:{{deckSeiku()}}&nbsp;</span>
      <!--<span class="aa">航空偵察値:{{getItemLos}}&nbsp;</span>-->
    </div>
    <section class="deck-map-list">
      <b-table
        :data="ships"
        :bordered="false"
        :striped="false"
        :narrowed="false"
        :hoverable="false"
        :mobile-cards="false"
      >
        <b-table-column v-slot="props" label="name" centered cell-class="cell-name">
          <div :class="hpClassesTT(props.row)">
            <div class="stype">{{stype(props.row)}}</div>
            <div class="name">{{shipName(props.row)}}</div>
          </div>
        </b-table-column>
        <b-table-column v-slot="props" label="Lv" centered cell-class="cell-status small">
          <div class="lv">Lv</div>
          <div><span :class="{ 'state-plus': isMarriage(props.row)}">{{props.row.api.api_lv}}</span></div>
        </b-table-column>
        <b-table-column v-slot="props" label="hp" centered cell-class="cell-status small">
          <div class="s-icon heart-a2" title="耐久"></div>
          <div>
            <span :class="hpClasses(props.row)">{{props.row.api.api_nowhp}}</span>
          </div>
        </b-table-column>
        <b-table-column v-slot="props" label="cond" centered cell-class="cell-status small">
          <div class="s-icon cond" :class="condClass(props.row)" title="コンディション"></div>
          <div>
            <span :class="condClass(props.row)">{{props.row.api.api_cond}}</span>
          </div>
        </b-table-column>
        <b-table-column v-slot="props" label="fual" centered cell-class="cell-status large0">
          <div class="s-icon fuel" title="燃料"></div>
          <div :class="fualClass(props.row)">
            <span>{{fualText(props.row)}}%</span>
          </div>
        </b-table-column>
        <b-table-column v-slot="props" label="bull" centered cell-class="cell-status large0">
          <div class="s-icon bull" title="弾薬"></div>
          <div :class="bullClass(props.row)">
            <span>{{bullText(props.row)}}%</span>
          </div>
        </b-table-column>
        <b-table-column v-slot="props" label="speed" centered cell-class="cell-status large1">
          <div class="s-icon speed" title="速力"></div>
          <div>
            <span :class="sokuClass(props.row)">{{sokuText(props.row)}}</span>
          </div>
        </b-table-column>
        <b-table-column v-slot="props" label="range" centered cell-class="cell-status large1">
          <div class="s-icon range" title="射程"></div>
          <div>
            <span :class="syateiClass(props.row)">{{syateiText(props.row)}}</span>
          </div>
        </b-table-column>
        <b-table-column v-slot="props" label="fire" centered cell-class="cell-status">
          <div class="s-icon fire" title="攻撃力"></div>
          <div>{{fireText(props.row)}}</div>
        </b-table-column>
        <b-table-column v-slot="props" label="tor" centered cell-class="cell-status">
          <div class="s-icon tor" title="雷撃"></div>
          <div>{{torText(props.row)}}</div>
        </b-table-column>
        <b-table-column v-slot="props" label="hit" centered cell-class="cell-status large0">
          <div class="s-icon hit" title="命中項"></div>
          <div :class="hitClass(props.row)">{{hitText(props.row)}}%</div>
        </b-table-column>
        <b-table-column v-slot="props" label="ev" centered cell-class="cell-status large0">
          <div class="s-icon ev" title="回避項"></div>
          <div :class="evClass(props.row)">{{evText(props.row)}}%</div>
        </b-table-column>
        <b-table-column v-slot="props" label="seiku" centered cell-class="cell-status">
          <div class="s-icon seiku" title="制空"></div>
          <div>{{seiku(props.row)}}</div>
        </b-table-column>
        <b-table-column v-slot="props" label="slot" cell-class="cell-slot">
          <div class="slots" :class="{ 'no-onslot' : isOnSlotNone(props.row) }">
            <span
              class="slot"
              v-for="(slot, index) in props.row.slots"
              :key="index"
              :title="slotTitle(slot)"
            >
              <span class="slot-img">
                <img v-if="slot!==undefined" :src="slotTypeImg(slot)" />
              </span>
              <span class="slot-alv">
                <img v-if="hasALv(slot)" :src="slotAlvImg(slot)" />
              </span>
              <span class="slot-lv" :class="{ max: isSlotLvMax(slot) }">{{slotLvText(slot)}}</span>
              <span
                v-if="!isOnSlotNone(props.row)"
                class="slot-onslot"
                :class="{ 'minus2-color' : oslotLosted(props.row, index) }"
              >{{onslotText(props.row, slot, index)}}</span>
            </span>
          </div>
        </b-table-column>
      </b-table>
    </section>
  </div>
</template>

<script lang="ts">
import {
  SvData,
  ApiShip,
  ApiSlotitem,
  MstShip,
  MstSlotitem,
  ApiMissionStateIndex,
  KcsUtil,
  SlotitemType,
  ApiDeckPort,
  ShipHpState,
  ApiDeckPortId,
  ApiRange,
  StringIntValue,
  ApiSoku,
  SenseiTaisenType,
  FACutin,
  THCutin,
  THCutinState,
  SenseiTaisenState,
  SenseiRaigekiState,
  FACutinState,
  AACutinState,
  YCutinState,
  YSCutinState,
  TKCutinState,
  TKCutin,
  TKCutinRate,
  TKCutinConsts,
  SlotInfo,
  ShipInfo,
  ShipInfoSp,
  Slot,
  Cond,
} from '@/lib/kcs';

import { svdata } from '@/renderer/store/svdata';
import {
  SyateiText,
  SokuText,
  FACutinText,
  AACutinText,
  YCutinText,
  YSCutinText,
  SenseiTaisenText,
} from "@/lib/locale";
import { Component, Vue, Prop } from 'vue-property-decorator';
import { MathUtil } from '@/lib/math';
import { RUtil } from '@/renderer/util';

@Component({
  components: {},
})
export default class extends Vue {
  @Prop({ required: true })
  public deck!: ApiDeckPort;

  private get ships(): ShipInfoSp[] {
    console.log('deck map ships called');
    return svdata.shipInfoSps(this.deck.api_ship);
  }

  private stype(ship: ShipInfo): string {
    return svdata.mstStypeFromSafe(ship.mst);
  }

  private shipName(ship: ShipInfo): string {
    return ship.mst.api_name;
  }

  private isMarriage(ship: ShipInfo): boolean {
    return ship.api.api_lv >= 100;
  }

  private hpClasses(ship: ShipInfo): object {
    return RUtil.hpClasses(ship.api);
  }

  private hpClassesTT(ship: ShipInfo): object {
    return RUtil.hpClassesTT(ship.api);
  }

  private condClass(ship: ShipInfo): string {
    return RUtil.condClass(ship.api);
  }

  private sokuClass(ship: ShipInfo): string {
    return RUtil.sokuClass(ship.api);
  }

  private fualClass(ship: ShipInfo): string {
    return RUtil.fualClass(ship);
  }

  private bullClass(ship: ShipInfo): string {
    return RUtil.bullClass(ship);
  }

  private fualText(ship: ShipInfo): string {
    return Math.floor(ship.api.api_fuel / ship.mst.api_fuel_max * 100.0).toString();
  }

  private bullText(ship: ShipInfo): string {
    return Math.floor(ship.api.api_bull / ship.mst.api_bull_max * 100.0).toString();
  }

  private sokuText(ship: ShipInfo): string {
    return SokuText[ship.api.api_soku / 5] ?? '';
  }

  private syateiClass(ship: ShipInfo): string {
    return RUtil.syateiClass(ship);
  }

  private syateiText(ship: ShipInfoSp): string {
    return RUtil.syateiText(ship);
  }

  private slotTypeImg(slot: Slot): string {
    return RUtil.slotTypeImg(slot);
  }

  private deckFire(): number {
    return this.ships.reduce((acc, ship) => acc + ship.api.api_karyoku[0], 0);
  }

  private deckASW(): number {
    return this.ships.reduce((acc, ship) => acc + ship.api.api_taisen[0], 0);
  }

  private deckLos(): number {
    return this.ships.reduce((acc, ship) => acc + ship.api.api_sakuteki[0], 0);
  }

  private deckAA(): number {
    return this.ships.reduce((acc, ship) => acc + ship.api.api_taiku[0], 0);
  }

  private deckSeiku(): number {
    return KcsUtil.shipsSeiku(this.ships);
  }

  private hitClass(ship: ShipInfo): string {
    return RUtil.condClass(ship.api);
  }

  private hitText(ship: ShipInfo): number {
    const hit = KcsUtil.shipHit(ship);
    return MathUtil.floor(hit.hit, 0);
  }

  private evClass(ship: ShipInfo): string {
    return RUtil.evClass(ship);
  }

  private evText(ship: ShipInfo): number {
    const hit = KcsUtil.shipKaihi(ship);
    return MathUtil.floor(hit.kaihi, 0);
  }

  private fireText(ship: ShipInfo): number {
    return KcsUtil.shipFire(ship);
  }

  private torText(ship: ShipInfo): number {
    return KcsUtil.shipTor(ship);
  }

  private seiku(ship: ShipInfo): number {
    return KcsUtil.shipSeiku(ship);
  }

  private get mapLosText(): string {
    return [
      MathUtil.floor(KcsUtil.deckMapLos(this.ships, 1, svdata.basic.api_level), 1),
      MathUtil.floor(KcsUtil.deckMapLos(this.ships, 2, svdata.basic.api_level), 1),
      MathUtil.floor(KcsUtil.deckMapLos(this.ships, 3, svdata.basic.api_level), 1),
      MathUtil.floor(KcsUtil.deckMapLos(this.ships, 4, svdata.basic.api_level), 1)
    ].join(' | ');
  }

  private get getItemLos(): number {
    return MathUtil.floor(KcsUtil.deckGetItemLos(this.ships), 2);
  }

  private slotTitle(slot: SlotInfo): string {
    if (!slot) {
      return '';
    }
    return `${slot.mst.api_name}`;
  }

  private isOnSlotNone(ship: ShipInfo): boolean {
    return !ship.onslotMax.length;
  }

  private oslotLosted(ship: ShipInfo, index: number): boolean {
    if (! ship.onslotMax.length) {
      return false;
    }

    const onslotMax = ship.onslotMax[index] ?? 0;
    if (! onslotMax) {
      return false;
    } 

    const onslot = ship.api.api_onslot[index] ?? 0;
    return !onslot;
  }

  private onslotText(ship: ShipInfo, slot: SlotInfo, index: number): string {

    // no slot
    if (! ship.onslotMax.length) {
      return '';
    }

    // ex slot
    if (ship.mst.api_slot_num <= index) {
      return '';
    }

    // 0 slot
    const onslotMax = ship.onslotMax[index];
    if (! onslotMax) {
      return onslotMax.toString();
    }

    let cls = '';
    const onslot = ship.api.api_onslot[index] ?? 0;
    let txt = onslot + '/' + onslotMax;
    if (onslot && !slot) {
      //txt = onslot + '/' + onslot;
      // no equip
      //cls += ' onslot-text';
      //txt = onslot.toString();
    } else {
      if (slot && KcsUtil.hasOnSlot(KcsUtil.slotitemType(slot.mst))) {
        //txt = onslot + '/' + onslot;
        cls += ' onslot-text';
        if (!onslot) {
          // red
          cls += ' red';
        }
      }
    }
    return txt;
  }

  private hasALv(slot: SlotInfo): boolean {
    return slot && !!(slot.api.api_alv ?? 0) && KcsUtil.hasOnSlot(KcsUtil.slotitemType(slot.mst));
  }

  private slotAlvImg(slot: SlotInfo): string {
    return RUtil.slotALevelImg(slot.api.api_alv ?? 0);
  }

  private isSlotLvMax(slot: SlotInfo): boolean {
    return slot && slot.api.api_level === 10;
  }

  private slotLvText(slot: SlotInfo): string {
    if (!slot || !slot.api.api_level) {
      return '';
    }

    const lv = slot.api.api_level;
    if (lv === 10) {
      return '★'
    }
    return lv.toString();
  }

}

</script>
