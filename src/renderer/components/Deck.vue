<template>
  <div class="deck">
    <section class="deck-ship-imgs" @mouseleave="shipMouseLeave">
      <span class="ship-container" @mouseenter="shipMouseEnter" :data-ship-id="ship.ship.api.api_id"
        v-for="(ship, index) in ships" :key="index"
      >
        <!-- todo: load image error draw ship name -->
        <img class="banner" :src="ship.banner_img" />
        <span class="slots">
          <img v-for="(slot, index) in ship.ship.slots" :key="index" class="slot" src="/img/slot/slot.png" >
        </span>
        <span class="slots">
          <img v-for="(disp, index) in ship.slot_disps" :key="index" class="slot" :src="disp.type_img" >
        </span>
        <span class="slots">
          <span v-for="(disp, index) in ship.slot_disps" :key="index" class="slot" v-html="disp.onslot_html" />
        </span>
        <span class="slots">
          <span v-for="(disp, index) in ship.slot_disps" :key="index" class="slot" v-html="disp.level_html" />
        </span>
      </span>
    </section>

    <section class="deck-map">
      <b-table
        :data="ships"
        :bordered="false"
        :striped="false"
        :narrowed="false"
        :hoverable="false"
        :mobile-cards="false"
        >
        <b-table-column v-slot="props" label="name" centered cell-class="cell-name">
          <div :class="props.row.hpClassTT">
            <div class="stype">{{props.row.stype}}</div>
            <div class="name">{{props.row.ship.mst.api_name}}</div>
          </div>
        </b-table-column>
        <b-table-column v-slot="props" label="Lv" centered cell-class="cell-status small">
          <div class="lv">Lv</div>
          <div><span :class="{ 'state-plus': props.row.ship.api.api_lv >= 100 }">{{props.row.ship.api.api_lv}}</span></div>
        </b-table-column>
        <b-table-column v-slot="props" label="hp" centered cell-class="cell-status small">
          <div class="s-icon heart-a2" title="耐久"></div>
          <div>
            <span :class="props.row.hpClass">{{props.row.ship.api.api_nowhp}}</span>
          </div>
        </b-table-column>
        <b-table-column v-slot="props" label="cond" centered cell-class="cell-status small">
          <div class="s-icon cond" :class="props.row.condClass" title="コンディション"></div>
          <div>
            <span :class="props.row.condClass">{{props.row.ship.api.api_cond}}</span>
          </div>
        </b-table-column>
        <b-table-column v-slot="props" label="fual" centered cell-class="cell-status large0">
          <div class="s-icon fuel" title="燃料"></div>
          <div :class="props.row.fualClass">
            <span>{{props.row.fual_per}}%</span>
          </div>
        </b-table-column>
        <b-table-column v-slot="props" label="bull" centered cell-class="cell-status large0">
          <div class="s-icon bull" title="弾薬"></div>
          <div :class="props.row.bullClass">
            <span>{{props.row.bull_per}}%</span>
          </div>
        </b-table-column>
        <b-table-column v-slot="props" label="speed" centered cell-class="cell-status large1">
          <div class="s-icon speed" title="速力"></div>
          <div>
            <span :class="props.row.sokuClass">{{props.row.soku_text}}</span>
          </div>
        </b-table-column>
        <b-table-column v-slot="props" label="range" centered cell-class="cell-status large1">
          <div class="s-icon range" title="射程"></div>
          <div>
            <span :class="props.row.syateiClass">{{props.row.syatei_text}}</span>
          </div>
        </b-table-column>
        <b-table-column v-slot="props" label="hit" centered cell-class="cell-status large0">
          <div class="s-icon hit" title="命中項"></div>
          <div :class="props.row.hitClass">{{props.row.hit}}%</div>
        </b-table-column>
        <b-table-column v-slot="props" label="ev" centered cell-class="cell-status large0">
          <div class="s-icon ev" title="回避項"></div>
          <div :class="props.row.evClass">{{props.row.ev}}%</div>
        </b-table-column>
        <b-table-column v-slot="props" label="boku" cell-class="cell-status large_aa">
          <div class="s-icon aa" title="撃墜 割合/固定"></div>
          {{props.row.boku_text}}
        </b-table-column>
        <b-table-column v-slot="props" label="slot" cell-class="cell-sps">
          <div class="sp-content" v-html="props.row.sp_html"></div>
        </b-table-column>
      </b-table>
    </section>

    <b-tooltip always :active="isTkrateActive" position="is-top" type="is-dark" :square="true" :animated="false" class="tktip-root">
      <template slot="content"><span class="tktip" v-html="tktipHtml"></span></template>
      <section class="deck-ship-list tkrate">
        <span class="tkrate1 list-title">対空CI合計: {{totalTkrateText}} <span>艦防: {{deckKTBText}}</span></span>
        <span class="tkrate2">
          <span class="tkrate-container">
            <span class="tkrate-unit" :style="tknorateStyle" 
              @mouseenter="tkrateHover" @mouseleave="tkrateLeave">
              <span class="tkrate-value-container">
                <span class="tkrate-text">{{tknorateText}}</span>
              </span>
            </span>
            <span v-for="(rate, index) in tkRates" :key="index" 
              class="tkrate-unit" :style="tkrateStyle(rate)" 
              @mouseenter="tkrateHover" @mouseleave="tkrateLeave"
              :data-tk="rate.tk" :data-ship-id="rate.ship ? rate.ship.api.api_id : ''">
              <span class="tkrate-value-container">
                <span v-if="rate.ship !== undefined" class="tkrate-text">{{tkrateText(rate)}}</span>
              </span>
            </span>
          </span>
        </span>
      </section>
   </b-tooltip>
  </div>
</template>

<script lang="ts">
import {
  KcsUtil,
  SlotitemType,
  ApiDeckPort,
  ShipHpState,
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
} from '@/lib/kcs';
import { svdata } from '@/renderer/store/svdata';
import { SyateiText, SokuText, FACutinText, AACutinText, YCutinText, YSCutinText, SenseiTaisenText } from '@/lib/locale';
import World from '@/renderer/components/World.vue';
import { Component, Vue, Prop, PropSync } from 'vue-property-decorator';
import { MathUtil } from '@/lib/math';
import { RUtil } from '@/renderer/util';

interface TKEntry {
  ship: ShipInfo;
  tk: TKCutin;
}

interface TKRate {
  ship: ShipInfo | undefined;
  tk: TKCutin;
  rate: number;
  left: number;
}

const toNaNTxt = (v: number): string => {
  return isNaN(v) ? '?' : v.toString();
};

const THCutinTag = (ship: ShipInfoSp, ships: ShipInfoSp[], st: THCutinState): string => {
  const name = (st.type === THCutin.Kongou || st.type === THCutin.Hiei) ? '夜戦突撃' : '特殊砲撃';
  const rate = KcsUtil.rateTH(ship, ships);
  const rate_v = MathUtil.floor((rate?.rate ?? NaN)*100.0, 1);
  return `<span class="sp"><span class="tag ${st.enable ? 'is-danger is-tokuhou' : 'is-disable'} ">${name}</span><br><span class="sp-rate">${toNaNTxt(rate_v)}%</span></span>`;
};

const TKCutinTag = (tk: TKCutinState): string => {
  const rates = tk.type.map((el) => toNaNTxt(MathUtil.floor(KcsUtil.rateTK(el) * 100.0, 1))+'%');
  return `<span class="sp"><span class="tag is-info">${tk.type.join('/')}種 対空CI</span><br><span class="sp-rate">${rates.join(' ')}</span></span>`;
};

const SenseiTaisenTag = (st: SenseiTaisenState): string => {
  let issmall = '';
  if (SenseiTaisenType.auto === st.type) {
      issmall = 'small';
  }
  return `<span class="sp"><span class="${issmall} tag ${st.enable ? 'is-info' : 'is-disable'}">${SenseiTaisenText[st.type]}</span></span>`;
};

const SenseiRaigekiTag = (st: SenseiRaigekiState): string => {
  return '<span class="sp"><span class="tag is-info">先制雷撃</span></span>';
};

const FunsindanmakuTag = (ship: ShipInfoSp): string => {
  const fdrate = KcsUtil.rateFD(ship);
  let rate_txt = '?';
  if (fdrate) {
    rate_txt = toNaNTxt(MathUtil.floor(fdrate.rate*100, 1));
  }
  return `<span class="sp"><span class="small tag is-primary">噴弾</span><br><span class="sp-rate">${rate_txt}%</span></span>`;
}

const FACutinTag = (ship: ShipInfoSp, ships: ShipInfoSp[]): string => {
  const rates = KcsUtil.rateFA(ship, ships);
  if (! rates.length) {
    return '';
  }

  let total_html = '';
  if (rates.length > 1) {
    let calc_rates:number[][] = [[],[]];
    rates.forEach((rate) => {
      calc_rates[0].push(rate.rate[0]);
      calc_rates[1].push(rate.rate[1]);
    });
    const total_kakuho = MathUtil.floor(MathUtil.totalRate(calc_rates[0]).total*100, 1);
    const total_yuusei = MathUtil.floor(MathUtil.totalRate(calc_rates[1]).total*100, 1);
    total_html = `<span class="sp"><span class="tag is-danger">合計</span><span class="sp-rate">${toNaNTxt(total_kakuho)}%/${toNaNTxt(total_yuusei)}%</span></span>`;
  }

  const html = rates.reduce((acc, rate, index) => {
    const rate_kakuho = MathUtil.floor(rate.rate[0]*100, 1);
    const rate_yuusei = MathUtil.floor(rate.rate[1]*100, 1);
    acc += `<span class="sp"><span class="tag ${rate.enable ? 'is-danger' : 'is-disable'}">${FACutinText[rate.type]}</span><span class="sp-rate">${toNaNTxt(rate_kakuho)}%/${toNaNTxt(rate_yuusei)}%</span></span>`;
    return acc;
  }, '');

  return total_html + html;
};

const AACutinTag = (ship: ShipInfoSp, ships: ShipInfoSp[]): string => {
  const rates = KcsUtil.rateAA(ship, ships);
  if (! rates.length) {
    return '';
  }

  let total_html = '';
  if (rates.length > 1) {
    let calc_rates:number[][] = [[],[]];
    rates.forEach((rate) => {
      calc_rates[0].push(rate.rate[0]);
      calc_rates[1].push(rate.rate[1]);
    });
    const total_kakuho = MathUtil.floor(MathUtil.totalRate(calc_rates[0]).total*100, 1);
    const total_yuusei = MathUtil.floor(MathUtil.totalRate(calc_rates[1]).total*100, 1);
    total_html = `<span class="sp"><span class="tag is-danger">合計</span><span class="sp-rate">${toNaNTxt(total_kakuho)}%/${toNaNTxt(total_yuusei)}%</span></span>`;
  }

  const html = rates.reduce((acc, rate, index) => {
    const rate_kakuho = MathUtil.floor(rate.rate[0]*100, 1);
    const rate_yuusei = MathUtil.floor(rate.rate[1]*100, 1);
    acc += `<span class="sp"><span class="tag ${rate.enable ? 'is-danger' : 'is-disable'}">${AACutinText[rate.type]}</span><span class="sp-rate">${toNaNTxt(rate_kakuho)}%/${toNaNTxt(rate_yuusei)}%</span></span>`;
    return acc;
  }, '');

  return total_html + html;
};

const YCutinTag = (ship: ShipInfoSp, ships: ShipInfoSp[]): string => {
  const rates = KcsUtil.rateY(ship, ships);
  if (! rates.length) {
    return '';
  }

  let total_html = '';
  if (rates.length > 1) {
    const calc_rates: number[] = rates.map((rate) => rate.rate);
    const total = MathUtil.floor(MathUtil.totalRate(calc_rates).total*100, 1);
    total_html = `<span class="sp"><span class="tag is-dark">合計</span><br><span class="sp-rate">${toNaNTxt(total)}%</span></span>`;
  }

  const html = rates.reduce((acc, rate, index) => {
    const rate_txt = MathUtil.floor(rate.rate*100, 1);
    acc += `<span class="sp"><span class="tag is-dark">${YCutinText[rate.type]}</span><br><span class="sp-rate">${toNaNTxt(rate_txt)}%</span></span>`;
    return acc;
  }, '');
  return total_html + html;
};

const YSCutinTag = (ship: ShipInfoSp, ships: ShipInfoSp[]): string => {
  const rates = KcsUtil.rateYS(ship, ships);
  if (! rates.length) {
    return '';
  }

  let total_html = '';
  if (rates.length > 1) {
    const calc_rates: number[] = rates.map((rate) => rate.rate);
    const total = MathUtil.floor(MathUtil.totalRate(calc_rates).total*100, 1);
    total_html = `<span class="sp"><span class="tag is-dark">合計</span><br><span class="sp-rate">${toNaNTxt(total)}%</span></span>`;
  }

  const html = rates.reduce((acc, rate, index) => {
    const rate_txt = MathUtil.floor(rate.rate*100, 1);
    acc += `<span class="sp"><span class="tag is-dark">${YSCutinText[rate.type]}</span><br><span class="sp-rate">${toNaNTxt(rate_txt)}%</span></span>`;
    return acc;
  }, '');
  return total_html + html;
}

const shipSpHtml = (ships: ShipInfoSp[], ship: ShipInfoSp): string => {
  let ret: string[] = [];
  const sp = ship.sp;

  // thcutin
  if (sp.th) {
    ret.push(THCutinTag(ship, ships, sp.th));
  }

  // tkcutin
  if (sp.tk) {
    ret.push(TKCutinTag(sp.tk));
  }

  // sensei taisen
  if (sp.st) {
    ret.push(SenseiTaisenTag(sp.st));
  }

  // sensei raigeki
  if (sp.sr) {
    ret.push(SenseiRaigekiTag(sp.sr));
  }

  // facutin
  ret.push(FACutinTag(ship, ships));

  // aacutin
  ret.push(AACutinTag(ship, ships));

  // funsindanmaku
  if (sp.fd) {
    ret.push(FunsindanmakuTag(ship));
  }

  // ycutin
  ret.push(YCutinTag(ship, ships));

  // yscutin
  ret.push(YSCutinTag(ship, ships));

  return ret.join('');
};

interface SlotDisp {
  readonly type_img: string;
  readonly onslot_html: string;
  readonly level_html: string;
}

interface DeckShip {
  readonly ship: ShipInfoSp;
  readonly slot_disps: SlotDisp[];
  readonly banner_img: string;
  readonly stype: string;
  readonly hpClassTT: object;
  readonly hpClass: object;
  readonly condClass: string;
  readonly fualClass: string;
  readonly bullClass: string;
  readonly fual_per: number;
  readonly bull_per: number;
  readonly sokuClass: string;
  readonly soku_text: string;
  readonly hitClass: string;
  readonly hit: number;
  readonly evClass: string;
  readonly ev: number;
  readonly boku_text: string;
  readonly sp_html: string;
}

const shipSlotDips = (ship: ShipInfoSp): SlotDisp[] => {
  return ship.slots.map((slot, index) => {
    return {
      type_img: RUtil.slotTypeImg(slot),
      onslot_html: onslotHtml(ship, index, slot),
      level_html: levelHtml(slot),
    };
  });
};


@Component({
  components: {
    World,
  },
})
export default class extends Vue {

  @Prop({required: true})
  public deck!: ApiDeckPort;

  private tkHoverShipId: string = '';
  private tkHoverTk: string = '';
  private tktipActive: boolean = false;

  private mounted(): void {
    console.log('deck mounted', this.deck);
  }

  private get tktipHtml(): string {
    console.log('tktip html', this.tkHoverShipId, this.tkHoverTk);
    //return `${this.tkHoverShipId}: ${this.tkHoverTk}`;
    if (! this.tkHoverShipId || ! this.tkHoverTk) {
      return '';
    }
    const shipId = parseInt(this.tkHoverShipId);
    const tk: TKCutin = parseInt(this.tkHoverTk) as TKCutin;
    const ship = this.ships.find((s) => s.ship.api.api_id === shipId);
    if (! ship || ! tk) {
      return '';
    }
    const header = `Lv: ${ship.ship.api.api_lv} ${ship.ship.mst.api_name}`;
    const tktag = TipTKCiTag({entry:[], type:[tk]});
    const src = `/img/ship/s${ship.ship.api.api_ship_id}.png`;
    const rate = MathUtil.floor(KcsUtil.rateTK(tk)*100.0, 1);
    const tkconst = TKCutinConsts[tk];
    return `<div>${header}</div><img class="img" src="${src}"><div>${tktag} ${rate}%</div><div>固定:${tkconst.kotei} 変動:${tkconst.hendou}</div>`;
  }

  private tkrateHover(event: Event): void {
    const dataset = (event.currentTarget as HTMLElement).dataset;
    console.log('tkrate hover', dataset);
    if (dataset.shipId) {
      this.tkHoverShipId =  dataset.shipId;
    }
    if (dataset.tk) {
      this.tkHoverTk = dataset.tk;
      this.tktipActive = true;
    } else {
      this.tktipActive = false;
    }
  }

  private tkrateLeave(ev: Event): void {
    this.tktipActive = false;
  }

  private get isTkrateActive(): boolean {
    //return true;
    return this.tktipActive;
  }

  private get tkRates(): TKRate[] {
    console.log('tkRates called');
    const shipSps = this.shipSps;
    let tks: TKEntry[] = [];
    const atlantas = filterShips(shipSps, KcsUtil.isAtlantaType);
    const fletchers = filterShips(shipSps, KcsUtil.isFletcherType);
    const normals = filterShips(shipSps, isNotSpecialTkShip);

    atlantas.forEach((ship) => {
      if (ship.sp.tk) {
        ship.sp.tk.type.forEach((v) => tks.push({ship: ship, tk: v}));
      }
    });

    fletchers.forEach((ship) => {
      if (ship.sp.tk) {
        ship.sp.tk.type.forEach((v) => tks.push({ship: ship, tk: v}));
      }
    });

    tks = tks.concat(normals.reduce<{ship: ShipInfoSp, tk: TKCutin}[]>((acc, ship) => {
      const tk = ship.sp.tk;
      if (tk) {
        tk.type.forEach((v) => acc.push({ship: ship, tk: v}));
      }
      return acc;
    }, []).sort((a, b) => (b.tk - a.tk)));

    const totalRate = MathUtil.totalRate(tks.map((e) => KcsUtil.rateTK(e.tk)));

    //
    let rates:TKRate[] = Array(Math.max(15, tks.length));
    let left = 0;
    rates.fill({ship: undefined, tk: TKCutin.none, rate: 0.0, left: 0 });
    totalRate.rates.forEach((rate, index) => {
      rates[index] = {ship: tks[index].ship, tk: tks[index].tk, rate: rate, left: left};
      left += rate;
    });
    //console.log(rates);
    return rates;
  }

  private get tkrateTotal(): number {
    return this.tkRates.reduce((acc, rate) => {
      acc += rate.rate;
      return acc;
    }, 0.0);
  }

  private get tknorateText(): string {
    const total = this.tkrateTotal;
    if (total === 0) {
      return '対空CIなし';
    }
    const v = MathUtil.floor((1.0-total)*100.0, 1);
    return `${v <= 12.0 ? '' : '不発: '}${v}%`;
  }

  private get tknorateStyle() {
    const total = this.tkrateTotal;
    return {
      '--left': `${total}`,
      '--width': `${1.0-total}`,
    };
  } 

  private get totalTkrateText(): string {
    return MathUtil.floor(this.tkrateTotal*100.0, 1)+'%';
  }

  private tkrateStyle(rate: TKRate) {
    return {
      '--left': `${rate.left}`,
      '--width': `${rate.rate}`,
    };
  } 

  private tkrateShipImg(rate: TKRate): string {
    return `/img/ship/s${(rate.ship as ShipInfoSp).api.api_ship_id}.png`;
  }

  private tkrateText(rate: TKRate): string {
    const v = MathUtil.floor(rate.rate*100.0, 1);
    const prefix = v > 12.0 ? `${rate.tk}種: ` : '';
    return `${prefix}${v}%`;
  }

  private tkRateText(rate: TKRate): string {
    return `第${rate.tk}種: ${MathUtil.floor(rate.rate*100.0, 1)}%`;
  } 
  
  private tkShipImg(rate: TKRate): string {
    return `/img/ship/s${(rate.ship as ShipInfoSp).api.api_ship_id}.png`;
  }

  private get deckKTBText() {
    return KcsUtil.shipsSeiku(this.ships.map((ship) => ship.ship));
  }

  private tkbarType(index: number): string {
    const types= ['is-success', 'is-info', 'is-primary' ];
    return types[index%3];
  }

  private get isDeckEmpty(): boolean {
    return !this.deck.api_ship.some(id => id > 0);
  }

  private get shipSps(): ShipInfoSp[] {
    return svdata.shipInfoSps(this.deck.api_ship);
  }

  private get ships(): DeckShip[] {
    console.log('deck v2 ships called');
    const sps = this.shipSps;
    const ret = sps.map((ship) => {
      return {
        ship, 
        slot_disps: shipSlotDips(ship),
        banner_img: shipBanner(ship),
        stype: svdata.mstStypeFromSafe(ship.mst),
        hpClassTT:  RUtil.hpClassesTT(ship.api),
        hpClass: RUtil.hpClasses(ship.api),
        condClass: RUtil.condClass(ship.api),
        fualClass: RUtil.fualClass(ship),
        bullClass: RUtil.bullClass(ship),
        fual_per: Math.floor(ship.api.api_fuel / ship.mst.api_fuel_max * 100.0),
        bull_per: Math.floor(ship.api.api_bull / ship.mst.api_bull_max * 100.0),
        sokuClass: RUtil.sokuClass(ship.api),
        soku_text: SokuText[ship.api.api_soku / 5] ?? '',
        syateiClass: RUtil.syateiClass(ship),
        syatei_text: RUtil.syateiText(ship),
        hitClass: RUtil.condClass(ship.api),
        hit: MathUtil.floor(KcsUtil.shipHit(ship).hit, 0),
        evClass: RUtil.evClass(ship),
        ev: MathUtil.floor(KcsUtil.shipKaihi(ship).kaihi, 0),
        boku_text: shipBouku(sps, ship),
        sp_html: shipSpHtml(sps, ship),
      };
    });
    return ret;
  }
    
  private deckSeiku(): number {
    return KcsUtil.shipsSeiku(this.ships.map((ship) => ship.ship));
  }

  private seiku(ship: ShipInfo): number {
    return KcsUtil.shipSeiku(ship);
  }

  @PropSync('tooltip_ship_id', { type: Number })
  public _tooltip_ship_id!: number;

  @PropSync('tooltip_ship_show', { type: Boolean })
  public _tooltip_ship_show!: boolean;

  private shipMouseEnter(event: Event): void {
    const dataset = (event.currentTarget as HTMLElement).dataset;
    this._tooltip_ship_id = parseInt(dataset.shipId!);
    console.log('ship banner hover ship id:', this._tooltip_ship_id);
    this._tooltip_ship_show = true;
  }

  private shipMouseLeave(): void {
    this._tooltip_ship_show = false;
  }
}

const filterShips = (ships: ShipInfoSp[], type: (id: number) => boolean ): ShipInfoSp[] => {
  return ships.filter((ship) => type(ship.mst.api_id));
};

const isNotSpecialTkShip = (id: number): boolean => {
  return ! KcsUtil.isSpecialTkShipType(id);
};

const shipBanner = (ship: ShipInfoSp): string => {
  const dmg = (ShipHpState.tyuuha <= KcsUtil.shipHpState(ship.api));
  return RUtil.shipBannerImg(ship.mst.api_id, dmg);
};

const onslotHtml = (ship: ShipInfo, index: number, slot: Slot): string => {
  let cls = 'slot-inner';
  let txt = '';
  let img = '';
  const onslot = ship.api.api_onslot[index] ?? 0;
  if (onslot && ! slot) {
    // no equip
    cls += ' onslot-text';
    txt = onslot.toString();
  } else {
    if (slot && KcsUtil.hasOnSlot(KcsUtil.slotitemType(slot.mst))) {
      cls += ' onslot-text';
      if (! onslot) {
        // red
        cls += ' red';
      }
      const alv = slot.api.api_alv ?? 0;
      if (alv) {
        img = `<img class="alv-img" src="${RUtil.slotALevelImg(alv)}">`;
        cls += ' has-alv';
      }
      txt += onslot.toString();
    }
  }
  return `<span class="${cls}">${txt}</span>${img}`;
};

const levelHtml = (slot: Slot): string => {
  let cls = 'slot-inner';
  let txt = '';
  const level = slot?.api.api_level;
  if (level) {
    cls += ' level-text';
    if (10 === level) {
      txt = '★';
      cls += ' max';
    } else {
      txt = level.toString();
    }
    return `<span class="${cls}">${txt}</span>`;
  }

  return '';
};

const shipBouku = (shipSps: ShipInfoSp[], ship: ShipInfoSp): string => {
  const saitei = 1;
  const wariai = MathUtil.floor(ship.bouku.kt/400.0*100.0, 0);
  const kotei = KcsUtil.shipKoteiGekitui(ship, shipSps);
  //const saidai = Math.floor(ship.bouku.kt*66/400.0)+kotei+saitei;
  //return `${saitei}/${wariai}%/${kotei}/${saidai}`;
  //return `${wariai}%/${kotei}/${saidai}`;
  return `${wariai}%/${kotei}`;
};

const TipTKCiTag = (st: TKCutinState): string => {
  //return `<span class="sp tag is-info">${st.type.join(' ,')}種対空CI(${st.entry.join(',')})</span>`;
  return `<span class="sp tag is-info">${st.type.join(' ,')}種 対空CI</span>`;
};

</script>
