<template>
  <div class="deck">
    <span class="aa">火力:{{deckFire()}}&nbsp;</span>
    <span class="aa">対潜:{{deckASW()}}&nbsp;</span>
    <span class="aa">対空:{{deckAA()}}&nbsp;</span>
    <span class="aa">索敵:{{deckLos()}}&nbsp;</span>
    <span class="aa">制空値:{{deckSeiku()}}&nbsp;</span>
    <span class="aa">索敵計算:{{mapLos}}&nbsp;</span>
    <span class="aa">航空偵察値:{{getItemLos}}&nbsp;</span>
    <section class="deck-ship-imgs" @mouseleave="shipMouseLeave">
      <b-tooltip 
        :square="true" 
        :animated="false" 
        always="true" 
        :active="isTooltipShipShow" 
        position="is-bottom" 
        type="is-dark">
        <template slot="content">
          <component v-if="isTooltipShipShow" :is="'ShipTooltip'" :ship_id="tooltipShipId" />
        </template>
        <span class="ship-container" @mouseenter="shipMouseEnter" :data-ship-id="ship.api.api_id"
          v-for="(ship, index) in ships" :key="index"
        >
          <!-- todo: load image error draw ship name -->
          <img class="banner" :src="shipBanner(ship)" />
          <span class="slots">
            <img v-for="(slot, index) in ship.slots" :key="index" class="slot" src="/img/slot/slot.png" >
          </span>
          <span class="slots">
            <img v-for="(slot, index) in ship.slots" :key="index" class="slot" :src="slotTypeImg(slot)" >
          </span>
          <span class="slots">
            <span v-for="(slot, index) in ship.slots" :key="index" class="slot" v-html="onslotHtml(ship, index, slot)" />
          </span>
          <span class="slots">
            <span v-for="(slot, index) in ship.slots" :key="index" class="slot" v-html="levelHtml(ship, index, slot)" />
          </span>
        </span>
      </b-tooltip>
    </section>

    <section class="deck-ship-list base">
      <b-table
        :data="ships"
        :bordered="false"
        :striped="false"
        :narrowed="false"
        :hoverable="false"
        :mobile-cards="false"
        >
        <b-table-column v-slot="props" label="艦船名" header-class="header-name" cell-class="cell-name">{{props.row.mst.api_name}}</b-table-column>
        <b-table-column v-slot="props" label="Lv" centered>{{props.row.api.api_lv}}</b-table-column>
        <b-table-column v-slot="props" label="耐久" centered><span :class="hpClass(props.row)">{{props.row.api.api_nowhp}}</span></b-table-column>
        <b-table-column v-slot="props" label="Cond" centered><span :class="condClass(props.row)" v-html="condText(props.row)"></span></b-table-column>
        <b-table-column v-slot="props" label="割/固/最(66機)" centered>{{shipBouku(props.row)}}</b-table-column>
        <b-table-column v-slot="props" label="速力" centered><span :class="sokuClass(props.row)">{{sokuText(props.row)}}</span></b-table-column>
        <b-table-column v-slot="props" label="制空" centered>{{seiku(props.row)}}</b-table-column>
        <b-table-column v-slot="props" label="射程" centered><span v-if="isTTPlus(props.row)" class="plus-color ttplus">{{syateiTextTTPlus}}</span><span v-else :class="syateiClass(props.row)">{{syateiText(props.row)}}</span></b-table-column>
        <b-table-column v-slot="props" label="特" header-class="header-sp" cell-class="cell-sp"><span v-html="shipSpHtml(props.row)"></span></b-table-column>
      </b-table>
    </section>

    <section class="deck-ship-list tkrate">
      <b-message
        class="list-title"
        type="is-black">対空CI <span>合計発動率: {{totalTkrateText}}</span> <span>艦隊防空: {{deckKTBText}}</span>
      </b-message>
      <b-tooltip always :active="tktipActive" position="is-top" type="is-dark" :square="true" :animated="false">
        <template slot="content">
          <span class="tktip" v-html="tktipHtml"></span>
        </template>
        <div class="tkrate-container">
          <div class="tkrate-unit" :style="tknorateStyle" 
            @mouseenter="tkrateHover" @mouseleave="tkrateLeave">
            <div class="tkrate-value-container">
              <span class="tkrate-text">{{tknorateText}}</span>
            </div>
          </div>
          <div v-for="(rate, index) in tkRates" :key="index" 
            class="tkrate-unit" :style="tkrateStyle(rate)" 
            @mouseenter="tkrateHover" @mouseleave="tkrateLeave"
             :data-tk="rate.tk" :data-ship-id="rate.ship ? rate.ship.api.api_id : ''">
            <div class="tkrate-value-container">
              <span v-if="rate.ship !== undefined" class="tkrate-text">{{tkrateText(rate)}}</span>
            </div>
          </div>
        </div>
      </b-tooltip>
    </section>

    <section v-if="isShowRate" class="deck-ship-list special">
      <b-message
        class="list-title"
        type="is-black"
      >発動率詳細</b-message>
      <b-table
        :data="ships"
        :bordered="false"
        :striped="false"
        :narrowed="false"
        :hoverable="false"
        :mobile-cards="false"
        >
        <b-table-column v-slot="props" label="艦船名" header-class="header-name" cell-class="cell-name">{{props.row.mst.api_name}}</b-table-column>
        <b-table-column v-slot="props" label="種別" centered><div v-html="spTypeHtml(props.row)"></div></b-table-column>
        <b-table-column v-slot="props" label="発動率" header-class="header-rate"><div v-html="rateSp(props.row)"></div></b-table-column>
        <b-table-column v-slot="props" label="補正" header-class="header-detail" cell-class="cell-sp"><div v-html="spDetailHtml(props.row)"></div></b-table-column>
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
  ApiQuestState,
} from '@/lib/kcs';
import { svdata } from '@/renderer/store/svdata';
import { SyateiText, SokuText, FACutinText, AACutinText, YCutinText, YSCutinText, SenseiTaisenText } from '@/lib/locale';
import ShipTooltip from '@/renderer/components/ShipTooltip.vue';
import QuestList from '@/renderer/components/QuestList.vue';
import { Component, Vue, Prop } from 'vue-property-decorator';
import { MathUtil } from '@/lib/math';
import { RUtil } from '@/renderer/util';

const TKCutinTag = (st: TKCutinState): string => {
  //return `<span class="sp tag is-info">${st.type.join(' ,')}種対空CI(${st.entry.join(',')})</span>`;
  return `<span class="sp tag is-info">${st.type.join(' ,')}種 対空CI</span>`;
};

const THCutinTag = (st: THCutinState): string => {
  const name = (st.type === THCutin.Kongou || st.type === THCutin.Hiei) ? '夜戦突撃' : '特殊砲撃';
  return `<span class="sp tag ${st.enable ? 'is-danger is-tokuhou' : 'is-disable'} ">${name}</span>`;
};

const THCutinDetail = (st: THCutinState): string => {
  const str = [
    '1, 3, 5番艦 CP後2.0倍 T字不利2.5倍', //Nelson = 0,
    '1発目:2.02倍 2発目:1.79倍 3発目:1.79倍(Big7時倍率Up)', // Colorado,
    '1,2発目:1.68倍 3発目:1.68倍(徹+電:2.6倍 徹:2.26倍 電:1.93倍) CP後補正', // Nagato,
    '1,2発目:1.68倍 3発目:1.68倍(徹+電:2.6倍 徹:2.26倍 電:1.93倍) CP後補正', // Mutu,
    '1,2発目:1.9倍(T字有利:2.375倍 T字不利:1.425倍) CP前補正', // Kongou,
    '1,2発目:1.9倍(T字有利:2.375倍 T字不利:1.425倍) CP前補正', // Hiei,
  ];
  return str[st.type];
};


const SenseiTaisenTag = (st: SenseiTaisenState): string => {
  let issmall = '';
  if (SenseiTaisenType.auto === st.type) {
      issmall = 'small';
  }
  return `<span class="sp ${issmall} tag ${st.enable ? 'is-info' : 'is-disable'}">${SenseiTaisenText[st.type]}</span>`;
};

const SenseiRaigekiTag = (st: SenseiRaigekiState): string => {
  return '<span class="sp tag is-info">先制雷撃</span>';
};

const FACutinTag = (st: FACutinState): string => {
  return `<span class="sp tag ${st.enable ? 'is-danger' : 'is-disable'}">${FACutinText[st.type]}</span>`;
};

const FACutinDetail = (st: FACutinState): string => {
  const str = [
    'CP後1.5倍', // SYU_SYU = 0,
    'CP後1.3倍', // SYU_TEK,
    'CP後1.2倍', // SYU_DEN,
    'CP後1.1倍', // SYU_FUK,
    'CP後1.2倍×2', // RENGEKI,
    'CP後1.3倍', // KAI_KUU,
    'CP後1.35倍', // ZUI_UN,
  ];
  return str[st.type];
};

const AACutinTag = (st: AACutinState): string => {
  return `<span class="sp tag ${st.enable ? 'is-danger' : 'is-disable'}">${AACutinText[st.type]}</span>`;
};

const AACutinDetail = (st: AACutinState): string => {
  const str = [
    'CP後1.25倍 第1隊長機補正 Cr1.5 熟練Cr1.25 CI1.25', // FBA = 0,
    'CP後1.2倍 第1隊長機補正 Cr1.5 熟練Cr1.2 CI1.2', // BBA,
    'CP後1.15倍 第1隊長機補正 Cr1.5 熟練Cr1.15 CI1.15', // BA,
  ];
  return str[st.type];
};

const YCutinTag = (st: YCutinState): string => {
  return `<span class="sp tag is-dark">${YCutinText[st.type]}</span>`;
};

const YCutinDetail = (st: YCutinState): string => {
  const str = [
    'CP前2.0倍', // SYU3 = 0, // 2.0
    'CP前1.911倍', // SYU_GYO_DEN2_3, // 1.911
    'CP前1.75倍', // SYU_FUKU, // 1.75
    'CP前1.75倍×2', // SGYO_SDEN, // 1.75
    'CP前1.706倍', // SYU_GYO_DEN3, // 1.706
    'CP前1.625倍', // SYU_GYO_DEN2, // 1.625
    'CP前1.6倍×2', // SGYO2, // 1.6
    'CP前1.5倍×2',// GYO2, // 1.5
    'CP前1.3倍×2', // SYU_GYO_DEN, // 1.3
    'CP前1.3倍', // SYU_GYO, // 1.3
    'CP前1.2倍', // GYO_MI_DEN, // 1.2
    'CP前1.2倍×2', // RENGEKI, // 1.2
  ];
  return str[st.type];
};

const YSCutinTag = (st: YSCutinState): string => {
  return `<span class="sp tag is-dark">${YSCutinText[st.type]}</span>`;
}

const YSCutinDetail = (st: YSCutinState): string => {
  const str = [
    'CP前1.25倍', //  SEN2_KOU = 0,
    'CP前1.20倍', // SEN_KOU,
    'CP前1.20倍', // SEN_SUI,
    'CP前1.20倍', // KOU_SUI,
    'CP前1.18倍', // SEN_ETC2,
    'CP前1.00倍', // YAKOU,
  ];
  return str[st.type];
};

const FunsindanmakuTag = (): string => {
  return '<span class="sp small tag is-primary">噴弾</span>';
}


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

const filterShips = (ships: ShipInfoSp[], type: (id: number) => boolean ): ShipInfoSp[] => {
  return ships.filter((ship) => type(ship.mst.api_id));
}
const isNotSpecialTkShip = (id: number): boolean => {
  return ! KcsUtil.isSpecialTkShipType(id);
}

@Component({
  components: {
    ShipTooltip,
    QuestList,
  },
})
export default class extends Vue {

  @Prop({required: true})
  public deck!: ApiDeckPort;

  @Prop({default: true})
  public show_rate!: boolean;

  private get isShowRate(): boolean {
    return this.show_rate;
  }

  private tkHoverShipId: string = '';
  private tkHoverTk: string = '';
  private tktipActive: boolean = false;

  private mounted(): void {
    console.log('deck mounted', this.deck);
  }

  private beforeUpdate() {
    console.log('deck before update ');

    // clear list expanded
    this.$el.querySelector('.deck-ship-list')?.classList.remove('expanded');
  }


  private activated(): void {
   console.log('deck activated ');
  }

  private deactivated(): void {
   console.log('deck deactivated ');
  }

  private destroyed(): void {
   console.log('deck destroyed ');
  }

  private get tktipHtml(): string {
    console.log('tktip html', this.tkHoverShipId, this.tkHoverTk);
    //return `${this.tkHoverShipId}: ${this.tkHoverTk}`;
    if (! this.tkHoverShipId || ! this.tkHoverTk) {
      return '';
    }
    const shipId = parseInt(this.tkHoverShipId);
    const tk: TKCutin = parseInt(this.tkHoverTk) as TKCutin;
    const ship = this.ships.find((s) => s.api.api_id === shipId);
    if (! ship || ! tk) {
      return '';
    }
    const header = `Lv: ${ship.api.api_lv} ${ship.mst.api_name}`;
    const tktag = TKCutinTag({entry:[], type:[tk]});
    const src = `/img/ship/s${ship.api.api_ship_id}.png`;
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

  private get rateTK(): string {
    const ships = this.ships;
    let tks: TKEntry[] = [];
    const atlantas = filterShips(ships, KcsUtil.isAtlantaType);
    const fletchers = filterShips(ships, KcsUtil.isFletcherType);
    const normals = filterShips(ships, isNotSpecialTkShip);

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
    let ret = 'total:'+MathUtil.floor(totalRate.total*100, 1)+'%';
    ret += totalRate.rates.reduce((acc, rate, index) => {
      const name = tks[index].ship.mst.api_name;
      const r = MathUtil.floor(rate*100.0, 1);
      const tk = tks[index].tk;
      acc += ` ${name}(${tk}):${r}%`;
      return acc;
    }, '');
    //return ret;
    return '';
  }

  private get tkRates(): TKRate[] {
    console.log('tkRates called');
    const ships = this.ships;
    let tks: TKEntry[] = [];
    const atlantas = filterShips(ships, KcsUtil.isAtlantaType);
    const fletchers = filterShips(ships, KcsUtil.isFletcherType);
    const normals = filterShips(ships, isNotSpecialTkShip);

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

/*
  private tkRateStyle(rate: TKRate) {
    const v = 0.5+(rate.rrate-0.5)/2;
    return {
      '--left': `${Math.floor(v*100.0)}%`,
    };
  } 
*/
  private tkRateText(rate: TKRate): string {
    return `第${rate.tk}種: ${MathUtil.floor(rate.rate*100.0, 1)}%`;
  } 
  
  private tkShipImg(rate: TKRate): string {
    return `/img/ship/s${(rate.ship as ShipInfoSp).api.api_ship_id}.png`;
  }

  private get deckKTBText() {
    return KcsUtil.deckKantaiBouku(this.ships);
  }

  private tkbarType(index: number): string {
    const types= ['is-success', 'is-info', 'is-primary' ];
    return types[index%3];
  }

  private tkbarStyle2(index: number) {
    const rates = this.tkRates;
    if (index < rates.length) {
      return {
        '--width': `${Math.floor(rates[index].rate*100.0)}%`,
      };
    }
      return {
        '--width': '0%',
      };
  }

  private shipBouku(ship: ShipInfoSp): string {
    const saitei = 1;
    const wariai = MathUtil.floor(ship.bouku.kt/400.0*100.0, 0);
    const kotei = KcsUtil.shipKoteiGekitui(ship, this.ships);
    const saidai = Math.floor(ship.bouku.kt*66/400.0)+kotei+saitei;
    //return `${saitei}/${wariai}%/${kotei}/${saidai}`;
    return `${wariai}%/${kotei}/${saidai}`;
  }

  private shipKT(ship: ShipInfoSp): number {
    return MathUtil.floor(ship.bouku.kt, 1);
  }

  private shipKTB(ship: ShipInfoSp): number {
    return MathUtil.floor(ship.bouku.ktb*2/1.3, 1);
  }

  private shipRG(ship: ShipInfoSp): number {
    return MathUtil.floor(ship.bouku.kt/400.0, 2);
  }

  private spTypeHtml(ship: ShipInfoSp): string {
    let ret: string[] = [];
    const sp = ship.sp;

    // tkcutin
    if (sp.th) {
      ret.push('<div>');
      ret.push(THCutinTag(sp.th));
      ret.push('</div>');
    }

    // facutin
    if (sp.fa.length) {
      sp.fa.forEach((ci) => {
        ret.push('<div>');
        ret.push(FACutinTag(ci));
        ret.push('</div>');
      });
      ret.push('<div>合計発動率</div>');
    }

    // aacutin
    if(sp.aa.length) {
      sp.aa.forEach((ci) => {
        ret.push('<div>');
        ret.push(AACutinTag(ci));
        ret.push('</div>');
      });
      ret.push('<div>合計発動率</div>');
    }
    
    // ycutin
    sp.y.forEach((ci) => {
      ret.push('<div>');
      ret.push(YCutinTag(ci));
      ret.push('</div>');
    });
    if (sp.y.length > 1) {
      ret.push('<div>合計発動率</div>');
    }

    // yscutin
    sp.ys.forEach((ci) => {
      ret.push('<div>');
      ret.push(YSCutinTag(ci));
      ret.push('</div>');
    });

    // funsindanmaku
    if (sp.fd) {
      ret.push('<div>');
      ret.push(FunsindanmakuTag());
      ret.push('</div>');
    }

    return ret.join('');
  }

  private spDetailHtml(ship: ShipInfoSp): string {
    let ret: string[] = [];
    const sp = ship.sp;

    // tkcutin
    if (sp.th) {
      ret.push('<div>');
      ret.push(THCutinDetail(sp.th));
      ret.push('</div>');
    }

    // facutin
    if (sp.fa.length) {
      sp.fa.forEach((ci) => {
        ret.push('<div>');
        ret.push(FACutinDetail(ci));
        ret.push('</div>');
      });
      ret.push('<div>&nbsp;</div>');
    }

    // aacutin
    if(sp.aa.length) {
      sp.aa.forEach((ci) => {
        ret.push('<div>');
        ret.push(AACutinDetail(ci));
        ret.push('</div>');
      });
      ret.push('<div>&nbsp;</div>');
    }
    
    // ycutin
    sp.y.forEach((ci) => {
      ret.push('<div>');
      ret.push(YCutinDetail(ci));
      ret.push('</div>');
    });
    if (sp.y.length > 1) {
      ret.push('<div>&nbsp;</div>');
    }

    // yscutin
    sp.ys.forEach((ci) => {
      ret.push('<div>');
      ret.push(YSCutinDetail(ci));
      ret.push('</div>');
    });

    // funsindanmaku
    if (sp.fd) {
      ret.push('<div>&nbsp;</div>');
    }

    return ret.join('');
  }

  private rateSp(ship: ShipInfoSp): string {
    let ret:string[] = [];
    const ships = this.ships;

    const thrate = KcsUtil.rateTH(ship, ships);
    if (thrate) {
      ret.push('<div>');
      //ret.push(THCutinTag(thrate)+' ');
      ret.push(MathUtil.floor(thrate.rate*100, 1)+'%');
      ret.push('</div>');
    }

    const farate = KcsUtil.rateFA(ship, ships);
    if (farate.length) {
      let rates:number[][] = [[],[]];
      farate.forEach((rate) => {
        rates[0].push(rate.rate[0]);
        rates[1].push(rate.rate[1]);
        ret.push('<div>');
        //ret.push(FACutinTag(rate)+' ');
        ret.push(MathUtil.floor(rate.rate[0]*100, 1)+'%');
        ret.push('/');
        ret.push(MathUtil.floor(rate.rate[1]*100, 1)+'%');
        ret.push('</div>');
      });
      if (rates.length > 1) {
        ret.push('<div>');
        //ret.push('合計発動率:')
        ret.push(MathUtil.floor(MathUtil.totalRate(rates[0]).total*100, 1)+'%');
        ret.push('/');
        ret.push(MathUtil.floor(MathUtil.totalRate(rates[1]).total*100, 1)+'%');
        ret.push('</div>');
      }
    }

    const aarate = KcsUtil.rateAA(ship, ships);
    if (aarate.length) {
      let rates:number[][] = [[],[]];
      aarate.forEach((rate) => {
        if (rate.enable) {
          rates[0].push(rate.rate[0]);
          rates[1].push(rate.rate[1]);
        }
        ret.push('<div>');
        //ret.push(AACutinTag(rate)+' ');
        ret.push(MathUtil.floor(rate.rate[0]*100, 1)+'%');
        ret.push('/');
        ret.push(MathUtil.floor(rate.rate[1]*100, 1)+'%');
        ret.push('</div>');
      });
      if (rates.length > 1) {
        ret.push('<div>');
        //ret.push('合計発動率:')
        ret.push(MathUtil.floor(MathUtil.totalRate(rates[0]).total*100, 1)+'%');
        ret.push('/');
        ret.push(MathUtil.floor(MathUtil.totalRate(rates[1]).total*100, 1)+'%');
        ret.push('</div>');
      }
    }

    const yrate = KcsUtil.rateY(ship, ships);
    if (yrate.length) {
      let rates: number[] = [];
      yrate.forEach((rate) => {
        rates.push(rate.rate);
        ret.push('<div>');
        //ret.push(YCutinTag(rate)+' ');
        ret.push(MathUtil.floor(rate.rate*100, 1)+'%');
        ret.push('</div>');
      });
      if (rates.length > 1) {
        ret.push('<div>');
        //ret.push('合計発動率:')
        ret.push(MathUtil.floor(MathUtil.totalRate(rates).total*100, 1)+'%');
        ret.push('</div>');
      }
    }

    const ysrate = KcsUtil.rateYS(ship, ships);
    if (ysrate.length) {
      let rates: number[] = [];
      ysrate.forEach((rate) => {
        if (rate.enable) {
          rates.push(rate.rate);
        }
        ret.push('<div>');
        //ret.push(YSCutinTag(rate)+' ');
        ret.push(MathUtil.floor(rate.rate*100, 1)+'%');
        ret.push('</div>');
      });
      if (rates.length > 1) {
        ret.push('<div>');
        ret.push('合計発動率:')
        ret.push(MathUtil.floor(MathUtil.totalRate(rates).total*100, 1)+'%');
        ret.push('</div>');
      }
    }

    const fdrate = KcsUtil.rateFD(ship);
    if (fdrate) {
        ret.push('<div>');
        //ret.push(FunsindanmakuTag()+' ');
        ret.push(MathUtil.floor(fdrate.rate*100, 1)+'%');
        ret.push('</div>');
    }
    return ret.join('');
  }

  private get isDeckEmpty(): boolean {
    return !this.deck.api_ship.some(id => id > 0);
  }

  private get ships(): ShipInfoSp[] {
    console.log('ships called');
    return svdata.shipInfoSps(this.deck.api_ship);
  }

  private hpClass(ship: ShipInfoSp): string {
    return RUtil.hpClass(ship.api);
  }

  private condClass(ship: ShipInfoSp): string {
    return RUtil.condClass(ship.api);
  }

  private condText(ship: ShipInfoSp): string {
    let cond = ship.api.api_cond;
    if (cond < 20) {
      return '&#x1f621;'+cond;
    }
    else if (cond < 30) {
      return '&#x1f626;'+cond;
    }
    return ''+cond;
  }

  private sokuClass(ship: ShipInfoSp): string {
    if (ship.api.api_soku === ApiSoku.teisoku) {
      return 'minus-color';
    }
    if (ship.api.api_soku === ApiSoku.kousoku_plus ||
        ship.api.api_soku === ApiSoku.saisoku) {
      return 'plus-color';
    }
    return '';
  }

  private sokuText(ship: ShipInfoSp): string {
    return SokuText[ship.api.api_soku/5] ?? '';
  }

  private isTTPlus(ship: ShipInfoSp): boolean {
    return KcsUtil.isTTPlus(ship);
  }

  private syateiClass(ship: ShipInfoSp): string {
    return ship.api.api_leng === ApiRange.tyoutyou ? 'plus-color' : '';
  }

  private get syateiTextTTPlus(): string {
    return SyateiText[ApiRange.tyoutyou_plus];    
  }

  private syateiText(ship: ShipInfoSp): string {
    return SyateiText[ship.api.api_leng] ?? '';
  }

  private slotTypeImg(slot: Slot) : string {
    return RUtil.slotTypeImg(slot);
  }

  private onslotHtml(ship: ShipInfo, index: number, slot: Slot): string {
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
  }

  private levelHtml(ship: ShipInfo, index: number, slot: Slot): string {
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
    }
    return `<span class="${cls}">${txt}</span>`;
  }

  private shipBanner(ship: ShipInfoSp): string {
    const dmg = (ShipHpState.tyuuha <= KcsUtil.shipHpState(ship.api));
    return RUtil.shipBannerImg(ship.mst.api_id, dmg);
  }

  private shipSpHtml(ship: ShipInfoSp): string {
    let ret: string[] = [];
    const sp = ship.sp;

    // thcutin
    if (sp.th) {
      ret.push(THCutinTag(sp.th));
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
    sp.fa.forEach((ci) => ret.push(FACutinTag(ci)));

    // aacutin
    sp.aa.forEach((ci) => ret.push(AACutinTag(ci)));
    
    // ycutin
    sp.y.forEach((ci) => ret.push(YCutinTag(ci)));

    // yscutin
    sp.ys.forEach((ci) => ret.push(YSCutinTag(ci)));

    // funsindanmaku
    if (sp.fd) {
      ret.push(FunsindanmakuTag());
    }

    // expand width
    if (ret.length >= 6) {
      this.$el.querySelector('.deck-ship-list')?.classList.add('expanded');
    }

    return ret.join('');
  }
  
  private hasAADefence(mst: MstSlotitem): boolean {
    if (! mst) {
      return false;
    }
    return KcsUtil.hasAADefence(mst.api_type[2]);
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

  private seiku(ship: ShipInfo): number {
    return KcsUtil.shipSeiku(ship);
  }

  private shipHpState(ship: ApiShip) : string {
    switch(KcsUtil.shipHpState(ship)) {
      case ShipHpState.syouha:
        return '小破';
      case ShipHpState.tyuuha:
        return '中破';
      case ShipHpState.taiha:
        return '大破';
    }
    return '';
  }

  private missioning(data: number[]): boolean {
    return data[ApiMissionStateIndex.state] !== 0;
  }

  private missionState(data: number[]): String {
    const mission = svdata.mission(data[ApiMissionStateIndex.mission_id]);
    const mst = svdata.mstMission(data[ApiMissionStateIndex.mission_id]);
    if (mission && mst) {
      let s: String[] = [];
      s.push(mst.api_name);
      s.push(data[ApiMissionStateIndex.time].toString());
      const dt = new Date(data[ApiMissionStateIndex.time]);
      s.push(dt.toLocaleString());
      return s.join(" ");
    }
    return "";
  }

  private get mapLos(): number {
    return MathUtil.floor(KcsUtil.deckMapLos(this.ships, 1, svdata.basic.api_level), 2);
  }

  private get getItemLos(): number {
    return MathUtil.floor(KcsUtil.deckGetItemLos(this.ships), 2);
  }

  private tooltip_ship_id: number = 0;
  private tooltip_ship_show: boolean = false;

  private get tooltipShipId(): number {
    return this.tooltip_ship_id;
  }

  private get isTooltipShipShow(): boolean {
    return this.tooltip_ship_show;
  }

  private shipMouseEnter(event: Event): void {
    const dataset = (event.currentTarget as HTMLElement).dataset;
    this.tooltip_ship_id = parseInt(dataset.shipId!);
    console.log('ship banner hover ship id:', this.tooltip_ship_id);
    this.tooltip_ship_show = true;
  }

  private shipMouseLeave(): void {
    this.tooltip_ship_show = false;
  }
}
</script>
