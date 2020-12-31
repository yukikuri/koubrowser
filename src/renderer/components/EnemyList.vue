<template>
  <div class="enemy-list">
    <section>
      <b-table
        :data="ships"
        :bordered="false"
        :striped="false"
        :narrowed="false"
        :hoverable="false"
        :mobile-cards="false"
      >
        <b-table-column label="" centered header-class="enemy-col0" cell-class="cell-name">
          <template v-slot:header="{ }">
          </template>
          <template v-slot="props">
            <div :class="hpClassesTT(props.row)">
              <div class="stype">{{stype(props.row)}}</div>
              <div class="name">{{shipName(props.row)}}</div>
            </div>
          </template>
        </b-table-column>

        <b-table-column v-for="(eship, index) in eships" centered :key="index" :label="eship.info.status.api_id" header-class="enemy-col">
          <template v-slot:header="{ }">
            <div class="enemy-cell">
              <div v-if="eship.info.status.api_id !== 0">
                <b-tooltip :position="eship.position" :always0="index === 0" multilined square="true" :animated="false" class="enemy-tip">
                  <template v-slot:content>
                    <div>
                      <div class="tip-name">
                        <span v-if="isProduction">ID:{{eship.info.status.api_id}} </span>{{eship.info.status.api_name}}<span v-if="eship.info.status.api_yomi!=='-'" :class="eship.info.status.api_yomi"> {{eship.info.status.api_yomi}}</span>
                      </div>
                      <div class="tip-content">
                        <div class="status-col1">
                          <img :src="eship.bannerImg" class="enemy-img">
                          <div class="enemy-slots">
                            <span v-for="(slot, index) in eship.slots" :key="index" class="slot-img">
                              <img v-if="slot!==undefined" class="type-img" :src="slot.type_img" :title="slot.title">
                              <span v-if="slot.onslot" class="onslot">{{slot.onslot}}</span>
                            </span>
                          </div>
                        </div>
                        <div>
                          <div class="status-col2">
                            <span class="s-icon heart-a2">{{eship.info.status.api_taik}}</span>
                            <span class="s-icon armor">{{eship.info.status.api_souk}}</span>
                            <span class="s-icon fire">{{eship.info.status.api_houg}}</span>
                            <span class="s-icon tor">{{eship.info.status.api_raig}}</span>
                            <span class="s-icon aa">{{eship.info.status.api_tyku}}</span>
                            <span class="s-icon ev">{{eship.info.status_txt.api_kaih}}</span>
                            <span class="s-icon luck">{{eship.info.status_txt.api_luck}}</span>
                            <span class="s-icon seiku">{{eship.info.status.api_seiku}}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>
                  <div class="enemy-cell-content">
                    <img class="enemy-banner" :src="eship.bannerImg"/>
                    <div class="enemy-status">
                      <span class="s-icon xxsmall heart-a2">{{eship.info.status.api_taik}}</span>
                      <span class="s-icon xxsmall armor">{{eship.info.status.api_souk}}</span>
                      <span class="s-icon xxsmall ev">{{eship.info.status_txt.api_kaih}}</span>
                    </div>
                  </div>
                </b-tooltip>
              </div>
            </div>
          </template>
          <template v-slot="props">
            <div v-if="props.column.label > 0" class="enemy-dmg">
              <div v-if="isFireAttach(props.row, props.column.label)">
                <span class="s-icon small" :class="fireIconClass(props.row, props.column.label)">{{fireText(props.row, props.column.label, 0)}}<span class="small-mod">～</span>{{fireText(props.row, props.column.label, 1)}}</span>
                <span class="s-icon xxsmall hit" :class="{ 'state-plus': isFireHitMax(props.row, props.column.label) }">{{fireHitText(props.row, props.column.label)}}%</span>
              </div>
              <div v-if="isTorAttach(props.row, props.column.label)">
                <span class="s-icon small tor-a">{{torText(props.row, props.column.label, 0)}}<span class="small-mod">～</span>{{torText(props.row, props.column.label, 1)}}</span>
                <span class="s-icon xxsmall hit" :class="{ 'state-plus': isTorHitMax(props.row, props.column.label) }">{{torHitText(props.row, props.column.label)}}%</span>
              </div>
              <div v-if="isAswAttach(props.row, props.column.label)">
                <span class="s-icon small asw-a">{{aswText(props.row, props.column.label, 0)}}<span class="small-mod">～</span>{{aswText(props.row, props.column.label, 1)}}</span>
                <span class="s-icon xxsmall hit" :class="{ 'state-plus': isAswHitMax(props.row, props.column.label) }">{{aswHitText(props.row, props.column.label)}}%</span>
              </div>
            </div>
          </template>
        </b-table-column>

        <template slot="footer">
          <div class="has-text-right enemy-list-deck">
            {{currentDeckName}}
          </div>
        </template>
      </b-table>
    </section>
  </div>
</template>

<script lang="ts">
import { svdata } from '@/renderer/store/svdata';
import { MinMax, MaxMin } from '@/lib/type';
import { Component, Vue, Prop } from 'vue-property-decorator';
import { KcsUtil, MstShipBase, InvalidMstShipBase, ApiDeckPortId, ShipInfo, ShipInfoSp, HoseiType, HoseiConst, ApiDeckPort } from '@/lib/kcs';
import { RRes, RUtil, EnemyInfo, EShipInfo  } from '@/renderer/util';
import { AppState } from '@/lib/setting';
import { AppStuff } from '@/lib/app';
import { EnemyEtc } from '@/lib/enemy_etc';

interface ShipContext {
  readonly remodel: RemodelInfo;
}

interface Dmgs {
  [ key: number]: Dmg;
}

interface ShipInfoDmg extends ShipInfo {
  readonly dmgs: Dmgs;
}

interface RemodelInfo {
  readonly fire: number;
  readonly armor: number;
  readonly tor: number;
  readonly asw: number;
  readonly ev: number;
  readonly hit: number;
}

interface DmgInfo {
  dmg: MinMax; // calced damage
  hit: number; // calced hit percent
  hosei:  HoseiType[]; // hosei
}

interface ShipInfo2 extends ShipInfo {
  readonly rinfo: RemodelInfo;
}

interface Dmg {
  readonly hougeki: DmgInfo | undefined;
  readonly raigeki: DmgInfo | undefined;
  readonly taisen: DmgInfo | undefined;
}

const mmArmor = (armor: number): MaxMin => {
  return [armor * 1.3 - 0.6, armor * 0.7];
};

const calcRemodelInfo = (info: ShipInfo): RemodelInfo => {
  const calced = info.slots.reduce((acc, slot) => {
    if (slot && slot.api.api_level) {
      acc.fire +=  KcsUtil.fireFromLevel(slot.mst, slot.api.api_level);
      acc.tor +=  KcsUtil.torFromLevel(slot.mst, slot.api.api_level);
      acc.armor +=  KcsUtil.armorFromLevel(slot.mst, slot.api.api_level);
      acc.asw +=  KcsUtil.aswFromLevel(slot.mst, slot.api.api_level);
      acc.ev +=  KcsUtil.evFromLevel(slot.mst, slot.api.api_level);
      acc.hit +=  KcsUtil.hitFromLevel(slot.mst, slot.api.api_level);
    }
    return acc;
  }, {fire: 0, tor: 0, armor: 0, asw: 0, ev: 0, los: 0, hit: 0});
  return { ...calced };
};

const bullRate  = (ship: ShipInfo): number => {
    const rate = ship.api.api_bull / ship.mst.api_bull_max;
    if (rate >= 0.50) {
      return 1.0;
    }
    return rate * 2;
};

const rateDmg = (d: number, hp: number, min: boolean): number => {
  if (d >= 1.0) {
    return d;
  }
  const dmg = hp * (min ? 0.06 : 0.14);
  return dmg < 1.0 ? 1.0 : dmg;
}


type capDmgLimit = 150 | 180 | 300;
const HIT_MAX = 97.0;

const capDmg = (fire: number, cap: capDmgLimit): number => {
  // hiru hougeki: 180
  // hiru hougeki igai: 150
  // yasen: 300
  if (fire <= cap) {
    return fire;
  }
  return Math.floor(cap + Math.sqrt(fire-cap));
};

const capHit = (hit: number): number => {
  const cap = HIT_MAX;
  if (hit > cap) {
    return cap;
  }
  return Math.floor(hit);
}

const calcFire = (ship: ShipInfo, e: EShipInfo): DmgInfo => {
  const mm = mmArmor(e.status.api_souk);
  const hosei = KcsUtil.shipFireHosei(ship, e.status.api_stype);
  let hoseiRate = 1.0;
  if (hosei.length) {
    hoseiRate = HoseiConst[hosei[0]];
  }
  const fire = capDmg(KcsUtil.shipFire(ship), 180) * hoseiRate;
  const fireHit = KcsUtil.shipHit(ship);
  const brate = bullRate(ship);
  return {
    dmg: mm.map((v, index) => Math.floor(rateDmg((fire - v) * brate, e.status.api_taik, index === 0))),
    hit: capHit(fireHit.hit - e.status.api_kaih),
    hosei,
  };
}

const calcTor = (ship: ShipInfo, e: EShipInfo): DmgInfo => {
  const mm = mmArmor(e.status.api_souk);
  const tor = capDmg(KcsUtil.shipTor(ship), 150);
  const torHit = KcsUtil.shipTorHit(ship);
  const brate = bullRate(ship);
  return {
    dmg: mm.map((v, index) => Math.floor(rateDmg((tor - v) * brate, e.status.api_taik, index === 0))),
    hit: capHit(torHit.hit - e.status.api_kaih),
    hosei: [],
  };
}

const calcAsw = (ship: ShipInfo, e: EShipInfo): DmgInfo => {
  const mm = mmArmor(e.status.api_souk);
  const asw = capDmg(KcsUtil.shipAsw(ship), 150);
  const hit = KcsUtil.shipAswHit(ship);
  const brate = bullRate(ship);
  return {
    dmg: mm.map((v, index) => Math.floor(rateDmg((asw - v) * brate, e.status.api_taik, index === 0))),
    hit: capHit(hit.hit - e.status.api_kaih),
    hosei: [],
  };
}

const calcDmg = (ship: ShipInfo, e: EShipInfo): Dmg => {
  //console.log('calc dmg:', ship.mst.api_name,  ship.mst.api_id, ' e:', e.mst.api_name, e.mst.api_id, calcFire(ship,e));
  const attackable = KcsUtil.shipAttackable(ship, e.status.api_stype);

  // todo 対地攻撃、徹甲弾補正、弾着、クリティカル補正
  return {
    hougeki: attackable.fire ? calcFire(ship,e) : undefined,
    raigeki: attackable.tor ? calcTor(ship, e) : undefined,
    taisen: attackable.asw ? calcAsw(ship, e) : undefined,
  };
};

const shipDmgs = (ship: ShipInfo, ids: number[]): Dmgs => {
  return ids.reduce<Dmgs>((acc, id) => {
    if (! acc[id]) {
      const enemy = RUtil.eshipInfo(id);
      if (enemy) {
        acc[id] = calcDmg(ship, enemy);
      }
    }
    return acc;
  }, []);
};

const NaNtoString = (v: number): string => {
  return isNaN(v) ? '?' : v.toString();
};

interface EShipSlot {
  type_img: string;
  title: string;
  onslot: string;
}

interface EShip {
  info: EShipInfo;
  bannerImg: string;
  position: string;
  slots: EShipSlot[];
}

const eshipSlots = (enemy: EnemyEtc): EShipSlot[] => {
  const hasOnSlot = enemy.api_seiku > 0;
  const msts = RUtil.eshipMstSlots(enemy);
  return msts.reduce<EShipSlot[]>((acc, el, index) => {
    acc.push({
      type_img: RUtil.slotTypeImgMst(el),
      title: el.api_name,
      onslot: hasOnSlot ? enemy.api_onslot[index].toString() : '',
    });
    return acc;
  }, []);
};

@Component({
  components: {},
})
export default class extends Vue {

  @Prop({required: true})
  public info!: EnemyInfo;

  @Prop({default: 0})
  public deck_index!: number;

  private get deck(): ApiDeckPort {
    return svdata.deckPorts[this.deck_index];
  }

  private fireText(ship: ShipInfoDmg, id_enemy: number, index: number): number {
    return ship.dmgs[id_enemy]!.hougeki!.dmg[index];
  }

  private torText(ship: ShipInfoDmg, id_enemy: number, index: number): number {
    return ship.dmgs[id_enemy]!.raigeki!.dmg[index];
  }

  private aswText(ship: ShipInfoDmg, id_enemy: number, index: number): number {
    return ship.dmgs[id_enemy]!.taisen!.dmg[index];
  }

  private fireHitText(ship: ShipInfoDmg, id_enemy: number): string {
    const hougeki = ship.dmgs[id_enemy]!.hougeki!;
    return NaNtoString(hougeki.hit);
  }

  private torHitText(ship: ShipInfoDmg, id_enemy: number): string {
    const raigeki = ship.dmgs[id_enemy]!.raigeki!;
    return NaNtoString(raigeki.hit);
  }

  private aswHitText(ship: ShipInfoDmg, id_enemy: number): string {
    const taisen = ship.dmgs[id_enemy]!.taisen!;
    return NaNtoString(taisen.hit);
  }

  private isFireAttach(ship: ShipInfoDmg, id_enemy: number): boolean {
    const dmg = ship.dmgs[id_enemy];
    return dmg && !!dmg.hougeki;
  }

  private isTorAttach(ship: ShipInfoDmg, id_enemy: number): boolean {
    const dmg = ship.dmgs[id_enemy];
    return dmg && !!dmg.raigeki;
  }

  private isAswAttach(ship: ShipInfoDmg, id_enemy: number): boolean {
    const dmg = ship.dmgs[id_enemy];
    return dmg && !!dmg.taisen;
  }

  private isFireHitMax(ship: ShipInfoDmg, id_enemy: number): boolean {
    return ship.dmgs[id_enemy]!.hougeki!.hit === HIT_MAX;
  }

  private isTorHitMax(ship: ShipInfoDmg, id_enemy: number): boolean {
    return ship.dmgs[id_enemy]!.raigeki!.hit === HIT_MAX;
  }

  private isAswHitMax(ship: ShipInfoDmg, id_enemy: number): boolean {
    return ship.dmgs[id_enemy]!.taisen!.hit === HIT_MAX;
  }

  private fireIconClass(ship: ShipInfoDmg, id_enemy: number): object {
    if(ship.dmgs[id_enemy]!.hougeki!.hosei.length) {
      return {
        'apshell': true,
      };
    }
    return {
      'fire-a': true,
    };
  }

  private get eships(): EShip[] {
    return RUtil.eshipInfos(this.info.enemy, true).map((info, index) => {
      return {
        info,
        bannerImg: info.status.api_id !== 0 ? this.eshipBanner(info) : '',
        position: index < 3 ? 'is-right' : 'is-left',
        slots: eshipSlots(info.status),
      }
    });
  }

  private get ships(): ShipInfoDmg[] {
    const ships = svdata.shipInfoSps(this.deck.api_ship);
    return ships.map((ship) => ({
      ...ship, dmgs: shipDmgs(ship, this.info.enemy) }));
  }

  private getPropData(props: any): string {
    console.log('index:', props.index, props);
    return '';
  }

  private eshipTitle(info: EShipInfo): string {
    let ret = `${info.status.api_id}: ${info.status.api_name}`;
    if (info.status.api_id) {
      ret += ` 耐久: ${info.status.api_taik}`;
      ret += ` 回避: ${info.status.api_kaih}`;
    }
    return ret;
  }

  private eshipBanner(info: EShipInfo): string {
    console.log('eshipBanner', info.status.api_name, RUtil.eshipBannerImg(info.status.api_id))
    return RUtil.eshipBannerImg(info.status.api_id);
  }

  private stype(ship: ShipInfo): string {
    return svdata.mstStypeFromSafe(ship.mst);
  }

  private shipName(ship: ShipInfo): string {
    return ship.mst.api_name;
  }

  private get currentDeckName(): string {
    return this.deck.api_name ?? '';
  }

  private hpClassesTT(ship: ShipInfo): object {
    return RUtil.hpClassesTT(ship.api);
  }

  private get isProduction(): boolean {
    return AppStuff.isProduction;
  }

}
</script>
