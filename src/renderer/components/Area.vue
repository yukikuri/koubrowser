<template>
  <div v-if="isDataOk">
    <div class="map">
      <b-image class="map-img" :src="mapSrc" src-fallback="/img/map/nodata.png" />
      <div v-for="(spot, index) in enemySpots" :key="index">
        <div :class="spot.seikuClass" :style="spot.spotXY">
          <div v-if="spot.airbase!==undefined" class="spot-airbases">
            <div v-for="(result, index) in spot.airbase" :key="index" class="spot-airbase">
              {{result.name}}{{result.seikuText}}: {{result.afterAA}}
            </div>
          </div>
          <span class="state">{{spot.seikuStateText}}</span>
          <span v-if="spot.spot.maxAA > 0" class="seikubar">
            <span :style="spot.seikubarStyle[0]" class="seikubar-s"></span>
            <span :style="spot.seikubarStyle[1]" class="seikubar-e"></span>
          </span>
        </div>
      </div>
      <div v-for="(spot, index) in airsearchSpots" :key="index">
        <div class="airsearch" :style="spot.spotXY">
          <span class="state">{{spot.stateText}}</span>
        </div>
      </div>
      <div v-for="(spot, index) in maplosSpots" :key="index">
        <div :style="spot.spotXY" class="maplos" >
          <span class="state">{{spot.stateText}}</span>
        </div>
      </div>
      <a v-for="(spot, index) in enemySpots" :key="index"
        :class="spot.cellClass"
        :style="spot.cellXY"
        href="#" 
        :data-label="spot.spot.label"
        @click="enemySpotClick"
        ></a>
      <!--
      <a v-for="(spot, index) in airsearchSpots" :key="index"
        :class="spot.cellClass"
        :style="spot.cellXY"
        href="#" 
        :title="spot.no"
        :data-no="spot.no"
        ></a>
      -->
      <div v-if="hasGauge" class="map-gauge">
        <DoneImg v-if="isCleared"/> {{mepGaugeText}}
      </div>
      <div v-if="hasAirbase" class="map-airbase">
        <div class="map-airbase-decks">出撃可能 x {{airbaseDecks}} 飛行隊</div>
        <air-base v-for="(airbase, index) in airbases" :key="index" 
          :airbase="airbase" :index="index" :target_label="target_label[index]" />
      </div>
      <div v-if="hasAirbase" class="map-airbase-spots">
        <b-field v-for="(info, airbase_index) in airbaseSpots" :key="airbase_index">
          <span class="map-airbase-spots-name">{{info.txt}}</span>
          <b-radio-button v-for="(spot, spot_index) in info.spots" :key="spot_index" 
            :native-value="spot.label" :disabled="spot.disabled" 
            @input="onChangeAirbaseSpot" v-model="target_label[airbase_index]">
            {{spot.txt}}
          </b-radio-button>
        </b-field>
      </div>
      <div v-for="(passed, index) in passedCells" class="current-cell is-passed" :style="passed.cellXY" :key="index">
        <PassedCellImage />
      </div>
      <div v-if="inArea" class="current-cell active" :class="{ 'is-started': isStarted}" :style="currentPosStyle">
        <CurrentLocationImage />
      </div>
      <div v-if="isProduction" class="debug-info">
        <span>cell count:{{spots.length}}</span>
        <div>
          <div class="deckport" v-for="(seiku, index) in deckSeikus" :key="index">
            <div>{{index}}:{{seiku}}</div>
          </div>
          <div v-if="isCombined">
            <div>連合艦隊:{{combinedFlag}}</div>
            <div>連合艦隊制空値:{{combinedSeiku}}</div>
          </div>
          <div v-if="mapinfo && mapinfo.api_air_base_decks">
            <div>airbase有: {{mapinfo.api_air_base_decks}}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { 
  SvData, 
  ApiKDock, 
  ApiShip, 
  MstShip, 
  ApiDeckPort, 
  CombinedFlag, 
  ApiMapInfo, 
  KcsUtil, 
  ApiDeckPortId,
  Api,
  ApiCallback,
  ApiGaugeType,
  GaugeAreaNo,
  ApiAirBase,
  ApiDispSeiku,
  AirBaseActionKind,
  MstSlotitem,
  ApiAirBaseAttack,
  MapLv
} from '@/lib/kcs';
import { svdata } from '@/renderer/store/svdata';
import { MathUtil } from '@/lib/math';
import { Component, Vue, Prop, PropSync } from 'vue-property-decorator';
import { CellInfo, CheckType, Spot, Check, MapStuff } from '@/lib/map';
import CurrentLocationImage from '@/renderer/assets/current-location.svg';
import DoneImg from '@/renderer/assets/done-outline.svg';
import PassedCellImage from '@/renderer/assets/passed-cell.svg';
import { AirbaseSpot, AirbaseTargetSpots, AppStuff, MainChannel } from '@/lib/app';
import { AirbaseActionKindText, MapLvText, StateText } from '@/lib/locale';
import AirBase from '@/renderer/components/AirBase.vue';
import { RUtil } from '@/renderer/util';
import { EnemyEtc } from '@/lib/enemy_etc';
import { ipcRenderer } from 'electron';

const SEIKU_UNIT = 200.0;
const MAP_RATIO = 0.5;
const ratio = (v: number): number => {
  return v*MAP_RATIO;
};

// last: deck seiku
interface AirBaseSeiku {
  name: string;
  airbase: ApiAirBase;
  seikuText: string;
  afterAA: number;
  //seiku: [number, number];
  //seikubarStyle: [string, string];
}

interface SpotAirBase {
  seikus: AirBaseSeiku[];
}

interface EShipAA {
  readonly ship: EnemyEtc;
  mstSlot: (MstSlotitem | undefined)[];
  slot: number[];
  onslot: number[];
  aa: number;
}

interface AreaSpot {
  spot: Spot;
  seikuClass: string;
  seikuStateText: string;
  spotXY: string;
  seikubarStyle: [string, string];
  cellClass: string;
  cellXY: string;
  airbase?: AirBaseSeiku[];
}

interface AreaCheck {
  check: Check;
  spotXY: string;
  stateText: string;
  cellClass: string;
  cellXY: string;
}

interface PassedCell {
  cellXY: object;
}

interface AirBaseInfo {
  airbase: ApiAirBase;
}

interface SpotMod {
  x: number;
  y: number;
}
const modSpotXYData: {[key: string]: { [key: string]: SpotMod | undefined } | undefined} = {
  '1-1': {
    'A': {x: -25, y:-15},
    'B': {x: 0, y:-5},
    'C': {x: 5, y:0},
  },
  '1-3': {
    'C': {x: -35, y:20},
    'E': {x: -45, y:-5},
    'F': {x: -35, y:20},
    'J': {x: -35, y:25},
  },
  '1-4': {
    'B': {x: -35, y:-15},
    'D': {x: -40, y:20},
    'H': {x: -10, y:-15},
    'I': {x: -75, y:-10},
    'J': {x: -35, y:35},
    'L': {x: -15, y:-25},
  },
  '1-5': {
    'C': {x: -45, y:0},
  },
  '1-6': {
    'B': {x: -65, y:10},
    'C': {x: 5, y:15},
    'D': {x: -40, y:-25},
    'E': {x: -35, y:18},
    'F': {x: 10, y:0},
    'I': {x: 0, y:-10},
    'K': {x: 5, y:15},
    'J': {x: -40, y:-15},
    'L': {x: -40, y:-10},
  },
  '2-3': {
    'J': {x: -25, y:-15},
    'K': {x: -25, y:-15},
    'M': {x: -25, y:-15},
    'N': {x: -40, y:40},
  },
  '2-5': {
    'B': {x: -49, y:0},
    'C': {x: -58, y:-12},
    'E': {x: -47, y:-5},
    'F': {x: -25, y:-17},
    'G': {x: -5, y:10},
    'I': {x: -20, y:5},
    'J': {x: 0, y:5},
    'L': {x: 0, y:5},
    'O': {x: -5, y:10},
  },
  '3-1': {
    'B': {x: -25, y:-17},
    'C': {x: -25, y:-17},
    'D': {x: -75, y:-5},
    'G': {x: -40, y:-22},
  },
  '3-2': {
    'A': {x: -77, y:-5},
    'C': {x: -45, y:5},
    'H': {x: -20, y:-15},
    'J': {x: -25, y:-20},
    'K': {x: -40, y:-15},
    'L': {x: 5, y:5},
  },
  '3-3': {
    'A': {x: -40, y:15},
    'B': {x: -35, y:15},
    'E': {x: -40, y:-10},
    'K': {x: -35, y:15},
    'G': {x: -80, y:20},
    'M': {x: 5, y:0},
  },
  '3-4': {
    'A': {x: -25, y:-15},
    'B': {x: 0, y:-2},
    'C': {x: -45, y:-10},
    'G': {x: 12, y:13},
    'H': {x: -10, y:-13},
    'M': {x: -45, y:-9},
    'N': {x: -70, y:-7},
    'P': {x: -25, y:-15},
  },
  '3-5': {
    'B': {x: -25, y:-17},
    'D': {x: -50, y:-10},
    'E': {x: -75, y:22},
    'F': {x: -35, y:17},
    'G': {x: -65, y:20},
    'H': {x: -70, y:10},
    'K': {x: 5, y:-5},
  },
  '4-1': {
    'C': {x: -40, y:15},
    'D': {x: -40, y:20},
    'G': {x: -40, y:15},
    'H': {x: -30, y:-15},
    'J': {x: -30, y:40},
  },  
  '4-2': {
    'B': {x: -37, y:20},
    'C': {x: 10, y:15},
    'D': {x: -80, y:23},
    'E': {x: -75, y:-10},
    'H': {x: -37, y:18},
    'J': {x: -35, y:18},
    'G': {x: -45, y:-10},
    'L': {x: -35, y:40},
  },
  '4-3': {
    'A': {x: -10, y:-15},
    'C': {x: 7, y:10},
    'D': {x: -35, y:-15},
    'F': {x: 7, y:20},
    'G': {x: -35, y:-18},
    'H': {x: 0, y:11},
    'I': {x: -50, y:-15},
    'L': {x: -42, y:17},
    'N': {x: -45, y:-15},
  },
  '4-4': {
    'A': {x: -23, y:-17},
    'B': {x: 5, y:15},
    'E': {x: -35, y:20},
    'F': {x: 7, y:20},
    'G': {x: -45, y:-10},
    'H': {x: -85, y:10},
    'I': {x: -45, y:-5},
    'K': {x: -70, y:30},
  },
  '4-5': {
    'B': {x: 0, y:-5},
    'D': {x: 0, y:-7},
    'E': {x: 7, y:12},
    'F': {x: 0, y:-3},
    'G': {x: 0, y:-3},
    'H': {x: -5, y:-5},
    'J': {x: -7, y:0},
    'K': {x: -10, y:-10},
    'N': {x: -40, y:17},
    'S': {x: -70, y:-10},
    'Q': {x: -5, y:7},
    'T': {x: -40, y:-20},
  },
  '5-1': {
    'B': {x: -40, y:15},
    'D': {x: -80, y:25 },
    'E': {x: -38, y:17},
    'F': {x: -85, y:15},
    'G': {x: -55, y:42},
    'J': {x: -10, y:-20},
  },
  '5-2': {
    'C': {x: 7, y:20 },
    'D': {x: 0, y:-10 },
    'E': {x: 7, y:23 },
    'F': {x: -20, y:0 },
    'K': {x: -37, y:17 },
    'I': {x: -65, y:10 },
    'L': {x: -10, y:-5 },
    'O': {x: -80, y:25 },
  },
  '5-3': {
    'C': {x: -25, y:-17 },
    'J': {x: -40, y:-15 },
    'I': {x: -25, y:-20 },
    'K': {x: -37, y:20 },
    'M': {x: 0, y:5 },
    'N': {x: -5, y:-12 },
    'P': {x: 0, y:-2 },
    'Q': {x: -80, y:25 },
  },
  '5-4': {
    'C': {x: -45, y:-10 },
    'E': {x: -25, y:-17 },
    'F': {x: 0, y:-1 },
    'G': {x: -50, y:-9 },
    'H': {x: -2, y:-10 },
    'L': {x: -35, y:15 },
    'M': {x: -50, y:5 },
    'P': {x: 5, y:5 },
  },
  '5-5': {
    'B': {x: -23, y:-17 },
    'C': {x: -45, y:15 },
    'H': {x: -35, y:-10 },
    'G': {x: -5, y:-10 },
    'N': {x: -23, y:-17 },
    'P': {x: 5, y:12 },
    'O': {x: 10, y:15 },
    'S': {x: 5, y:12 },
  },
  '6-1': {
    'C': {x: -85, y:10 },
    'D': {x: 0, y:-10 },
    'F': {x: 0, y:-15 },
    'H': {x: -45, y:15 },
    'I': {x: 0, y:-5 },
    'K': {x: 5, y:10 },
  },
  '6-2': {
    'B': {x: -70, y:-10 },
    'C': {x: -85, y:18 },
    'F': {x: -85, y:0 },
    'H': {x: -75, y:-5 },
    'I': {x: -75, y:-10 },
    'J': {x: 10, y:5 },
    'K': {x: 10, y:10 },
  },
  '6-3': {
    'B': {x: -25, y:-17 },
    'C': {x: 10, y:10 },
    'D': {x: 0, y:-15 },
    'E': {x: -8, y:-15 },
    'F': {x: 5, y:10 },
    'G': {x: 25, y:-40 },
    'H': {x: -50, y:0 },
    'J': {x: 5, y:-5 },
  },
  '6-4': {
    'D': {x: -40, y:37 },
    'E': {x: -25, y:-17 },
    'G': {x: -45, y:-13 },
    'H': {x: 0, y:-10 },
    'I': {x: -50, y:-15 },
    'J': {x: 0, y:7 },
    'K': {x: 15, y:10 },
    'L': {x: -30, y:-7 },
    'M': {x: 0, y:-2 },
    'N': {x: -10, y:-20 },
  },
  '6-5': {
    'A': {x: -22, y:-15 },
    'B': {x: -40, y:-15 },
    'C': {x: -40, y:-15 },
    'D': {x: -45, y:-10 },
    'E': {x: -23, y:-17 },
    'G': {x: -30, y:-20 },
    'H': {x: -40, y:-10 },
    'M': {x: -10, y:-15 },
  },
  '7-1': {
    'B': {x: -75, y:25 },
    'C': {x: -40, y:-10 },
    'G': {x: -25, y:-17 },
    'H': {x: -25, y:-17 },
    'K': {x: 5, y:0 },
  },
  '7-2': {
    'B': {x: -35, y:17 },
    'C': {x: -50, y:0 },
    'E': {x: -35, y:15 },
    'G': {x: 5, y:-5 },
    'H': {x: 8, y:30 },
    'J': {x: 3, y:-2 },
    'M': {x: 5, y:0 },
  },
  '7-3': {
    'B': {x: -35, y:15 },
    'C': {x: -45, y:15 },
    'D': {x: 0, y:-15 },
    'E': {x: -40, y:7 },
    'J': {x: -25, y:-13 },
    'M': {x: -5, y:-15 },
    'N': {x: -40, y:40 },
    'P': {x: -52, y:15 },
  },
  '49-1': {
    'B': {x: 5, y:15 },
    'C': {x: 0, y:27 },
    'D': {x: -20, y:-20 },
    'H': {x: -35, y:-15 },
    'J': {x: 10, y:10 },
    'K': {x: -30, y:-15 },
    'G': {x: -25, y:-20 },
    'L': {x: -50, y:-10 },
    'O': {x: -35, y:40 },
  },
  '49-2': {
    'A': {x: -30, y:-15 },
    'C': {x: -40, y:-14 },
    'D': {x: -47, y:0 },
    'E': {x: -47, y:-2 },
    'F': {x: -25, y:40 },
    'G': {x: -15, y:-20 },
    'N': {x: 5, y:0 },
    'Q': {x: 5, y:0 },
  },
  '49-3': {
    'C': {x: -35, y:20 },
    'D': {x: -47, y:-5 },
    'F': {x: -45, y:-20 },
    'H': {x: -70, y:-15 },
    'I': {x: -35, y:15 },
    'J': {x: -45, y:-15 },
    'K': {x: 8, y:15 },
    'G': {x: -40, y:35 },
    'Q': {x: -40, y:20 },
    'P': {x: 5, y:0 },
    'R': {x: 7, y:15 },
    'T': {x: -35, y:20 },
    'X': {x: -55, y:-10 },
    'Z': {x: -30, y:-10 },
  },
  '49-4': {
    'A': {x: 5, y:35 },
    'R': {x: -85, y:15 },
    'S': {x: -10, y:-25 },
    'B': {x: 5, y:35 },
    'F': {x: -35, y:13 },
    'H': {x: -35, y:20 },
    'I': {x: 0, y:-5 },
    'J': {x: -35, y:20 },
    'K': {x: -40, y:-20 },
    'G': {x: -40, y:-20 },
    'L': {x: -40, y:15 },
    'Q': {x: -35, y:0 },
    'T': {x: 3, y:15 },
    'U': {x: 5, y:10 },
    'W': {x: 0, y:35 },
    'X2': {x: -5, y:-10 },
    'Y1': {x: -5, y:-10 },
    'Y2': {x: -35, y:-15 },
    'Y3': {x: 0, y:5 },
    'Y5': {x: -75, y:25 },
    'Z': {x: -90, y:0 },
  }
} as const;

const modSpotXY = (area_id: number, area_no: number, label: string): SpotMod | undefined => {
  const mod = modSpotXYData[`${area_id}-${area_no}`];
  if (mod) {
    return mod[label];
  }
};

const nos = [
  '第一', '第二', '第三'
] as const;

const style = ['kinkou', 'kakuho', 'yuusei', 'ressei', 'sousitu'] as const;
const seikuClass = (state: ApiDispSeiku, aa: number, hasAirbase: boolean): string => {
  let ret = 'seiku ';
  if (!aa) {
    ret += 'noAA ';
  }
  if (hasAirbase) {
    ret += ' hasAirbase ';
  }
  return ret + style[state];
};

const seikuStateText = (state: ApiDispSeiku, deck_aa: number, enemy_aa: number): string => {
  if (0 === enemy_aa) {
    return StateText[ApiDispSeiku.kakuho];
  }

  // todo: deck
  return `${StateText[state]} ${deck_aa}:${enemy_aa}`;
};

const seikubarStyle = (deck_aa: number, enemy_aa: number): [string, string] => {
  const total_aa = deck_aa + enemy_aa;
  return [ `width: ${deck_aa/total_aa*100}%`, `width: ${enemy_aa/total_aa*100}%`];
}

interface AirBaseSpotInfo {
  txt: string;
  spots: AirBaseSpot[];
}

interface AirBaseSpot {
  label: string;
  txt: string;
  disabled: boolean;
}

@Component({
  components: {
    CurrentLocationImage,
    PassedCellImage,
    DoneImg,
    AirBase,
  },
})
export default class extends Vue {

  @Prop({required: true})
  public area_id!: number;

  @Prop({required: true})
  public area_no!: number;

  @PropSync('selected_label', { type: String })
  private selected_spot_label!: string;

  private cell_info: CellInfo;
  private area_id_no: string;
  private active_cell: HTMLElement | undefined;
  private cb_port: number = 0;
  private home_location_setted: boolean = false;
  private target_label: [string, string, string];
  private target_spot_loaded: boolean = false;
  private target_spot_invoked: boolean = false;
  /**
   * 
   */
  constructor() {
    super();
    this.cell_info = MapStuff.cellInfo(this.area_id, this.area_no);
    this.area_id_no = `${('00'+this.area_id).substr(-3)}_${('0'+this.area_no).substr(-2)}`;
    this.target_label = ['-', '-', '-'];
  }

  private mounted(): void {
    console.log('area mounted', this.area_id_no, 'set home', this.home_location_setted);  
    this.cb_port = ApiCallback.set([Api.PORT_PORT, () => this.onPort()]);
  }

  private destroyed(): void {
    console.log('area destroyed', this.area_id_no);
    ApiCallback.unset(this.cb_port);
  }

  private get mapSrc(): string {
    return '/img/map/'+this.area_id_no+'.png';
  }

  private get inArea(): boolean {
    if (! svdata.inMap) {
      return false;
    }

    const map = svdata.mapStart;
    return map?.api_maparea_id === this.area_id && map.api_mapinfo_no === this.area_no;
  }

  private get isEventMap(): boolean {
    return this.area_id > 40;
  }

  private get isStarted(): boolean {
    return this.home_location_setted;
  }

  private get airbaseDecks(): number {
    const mapinfo = svdata.mapinfoFrom(this.area_id, this.area_no);
    return mapinfo?.api_air_base_decks ?? 0;
  }

  private get airbases(): ApiAirBase[] {
    const airbases = svdata.airbase(this.area_id);
    if (! airbases) {
      return [];
    }

    return airbases;
    // for test
    //return airbases.concat(Object.assign({}, airbases[0]));
  }

  private get airbaseSpots(): AirBaseSpotInfo[] {
    const enemySpots = this.enemySpots;
    //const airbase_count = this.airbaseDecks;
    const airbases = svdata.airbase(this.area_id);
    if (! airbases) {
      return [];
    }
    return airbases.map((airbase, index) => {
      const range = airbase.api_distance.api_base+airbase.api_distance.api_bonus;
      const bonus = airbase.api_distance.api_bonus ? '+'+airbase.api_distance.api_bonus: '';
      let spots: AirBaseSpot[] = [{ label: '-', txt: 'なし', disabled: this.target_spot_loaded ? false : true }];
      spots = spots.concat(enemySpots.map((spot) => ({
          label: spot.spot.label, txt: spot.spot.label+'('+spot.spot.distance+')', 
          disabled: this.target_spot_loaded ? (range < (spot.spot?.distance ?? 0)) : true,
      })));
      return {
        //txt: `${nos[index]}基地航空隊(半径${airbase.api_distance.api_base}${bonus})`,
        //txt: `${nos[index]}基地航空隊(半径${range})`,
        txt: `${nos[index]}航空隊(半径${range})`,
        spots,
      };
    });
  }

  private updateCurrentPos(): void {
    if (! svdata.inMap) {
      return ;
    }
  }

  private get passedCells(): PassedCell[] {
    if (! this.inArea) {
      return [];
    }

    let ret: PassedCell[] = [];
    const home_spot = this.homeSpot;
    if (home_spot) {
      ret.push({ cellXY: this.locationXY(home_spot) });
    }

    const battleMap = svdata.battleMap;
    for (let i = 0; i < (battleMap.length-1); ++i) {
      const map = battleMap[i];
      const cell = this.cell_info.spots.find(el => el.no === map.api_no);
      if (cell) {
        ret.push({ cellXY: this.locationXY(cell) });
      }
    }
    console.log('passed celld', JSON.stringify(ret));
    return ret;
  }
  
  private locationXY(spot: Spot): object {
    let mod_y = 2;
    if (spot.no > 0) {
      mod_y = 12
    }
    return {
      '--left': ratio(spot.x)-12 +'px',
      '--top': ratio(spot.y)-mod_y +'px',
    }
  }

  private get homeSpot(): Spot | undefined {
    const mapStart= svdata.mapStart;
    if (! mapStart) {
      return undefined;
    }
    return this.cell_info.spots.find(spot => spot.no === mapStart.api_from_no);
  }

  private get currentPosStyle(): object {
    const battleMap = svdata.battleMap;

    const lastMapPos = (map_index: number): object => {
      const cur_cell_no = battleMap[map_index].api_no;
      const cell = this.cell_info.spots.find(spot => spot.no === cur_cell_no);
      console.log('area current cell', JSON.stringify(cell), 'cur no:', cur_cell_no);
      if (cell) {
        return this.locationXY(cell);
      }
      return {};
    };

    // home pos
    if (! this.home_location_setted) {
      this.$nextTick(() => this.home_location_setted = true);

      if (svdata.battleMap.length > 1) {
        return lastMapPos(battleMap.length-2);
      }

      const home_spot = this.homeSpot;
      if (home_spot) {
        return this.locationXY(home_spot);
      }
      return {};
    }

    if (battleMap.length > 0) {
        return lastMapPos(battleMap.length-1);
    }

    return {};
  }

  private onPort(): void {
    this.home_location_setted = false;
  }

  private get isDataOk(): boolean {
    return svdata.isShipDataOk;
  }

  private get spots(): Spot[] {
    return this.cell_info.spots;
  }

  private get enemySpots(): AreaSpot[] {
    const spots = 
      MapStuff.spotsFromLevel(this.cell_info, svdata.mapLevel(this.area_id, this.area_no));

    let filtered = spots.filter((spot) => {
      switch(spot.type)
      {
        case 'enemy':
        case 'boss':
          return true;
      }
      return false;
    });
    const deckSeiku = this.currentSeikuu;
    const ret = filtered.map((el) => {
      const airbase = this.spotAirBase(el);
      let aa = el.maxAa;
      let hasAirbase = false;
      if (airbase && airbase.length) {
        aa = airbase[airbase.length-1].afterAA;
        hasAirbase = true;
      }
      const state = KcsUtil.seikuState(deckSeiku, aa);

      return {
        spot: el, 
        seikuClass: seikuClass(state, aa, hasAirbase),
        seikuStateText: seikuStateText(state, deckSeiku, aa),
        spotXY: this.spotXY(el),
        seikubarStyle: seikubarStyle(deckSeiku, aa),
        cellClass: this.cellClass(el.type),
        cellXY: this.cellXY(el, el.type),
        airbase,
      }
    });
    console.log('enemy spots', ret);
    return ret;
  }

  private spotAirBase(spot: Spot): AirBaseSeiku[] | undefined {
    if (! this.hasAirbase) {
      return undefined;
    }

    const airbases = this.airbases.filter((airbase, index) => {
      if (airbase.api_action_kind !== AirBaseActionKind.syutugeki) {
        return false;
      }
      return this.target_label[index] === spot.label;
    }).slice(0, this.airbaseDecks);

    if (0 === airbases.length) {
      return undefined;
    }

    let enemy_aa = spot.maxAa;
    const enemy_index = spot.aa.findIndex(el => el === spot.maxAa);
    const enemys = RUtil.eshipInfos(spot.enemy[enemy_index], false).map<EShipAA>((eship) => {
      const mstSlot = eship.status.api_slot.map((slotitem_id, index) => {
        if (eship.status.api_onslot[index]) {
          return svdata.mstSlotitem(slotitem_id);
        }
      });
      return {
        ship: eship.status,
        mstSlot,
        slot: eship.status.api_slot.slice(),
        onslot: eship.status.api_onslot.slice(),
        aa: RUtil.eshipSeiku(eship.status, mstSlot),
      };
    });

    const ret = airbases.reduce<AirBaseSeiku[]>((acc, airbase) => {

      if (airbase.api_action_kind === AirBaseActionKind.syutugeki) {

        let name_added = false;
        //for (let i = 0; i < airbase.target_spot.length; ++i) {
        for (let i = 0; i < 2; ++i) {
          /*
          if (! airbase.target_spot[i]) {
            continue;
          }
          if (airbase.target_spot[i]!.x !== spot.x || airbase.target_spot[i]!.y !== spot.y) {
            continue;
          }
          */

          const airbase_aa = svdata.airbaseSeiku(airbase);
          const sstate = KcsUtil.seikuState(airbase_aa, enemy_aa);
          const rate_max = [0.60, 1.00, 0.80, 0.40, 0.10][sstate];

          console.log('airbase_aa:', airbase_aa, 'enemy_aa:', enemy_aa, 'sstate:', StateText[sstate], 'rate_max:', rate_max);
          enemys.forEach((eship) => {
            eship.onslot = eship.onslot.map(onslot => {
              if(0 === onslot) {
                return 0;
              }

              const rate_rand = ((Math.floor(Math.random()*100.0)+1)/100.0) * rate_max;
              console.log(eship.ship.api_name, 'onslot:', onslot, 'rand:', rate_rand, 'lost onslot:', Math.floor(onslot * rate_rand));
              return onslot - Math.floor(onslot * rate_rand);
            });
          });
          enemy_aa = enemys.reduce((acc, eship) => {
            return acc + RUtil.eshipSeiku({api_onslot: eship.onslot}, eship.mstSlot);
          }, 0);

          acc.push(
            {
              name: name_added ? '' : nos[airbase.api_rid-1]+' ',
              airbase,
              seikuText: StateText[sstate],
              afterAA: enemy_aa,
            }
          );
          name_added = true;
          console.log('enemy_aa:', enemy_aa, 'enemy_onslot:', enemys.map(el => el.onslot));
        }
      }
      
      return acc;
    }, []);
    console.log('spot air base', ret);
    return ret;
  }

  private onChangeAirbaseSpot(value: boolean): void {
    console.log('onChangeAirbaseSpot', value, this.target_label);
    const arg: AirbaseSpot = {
      area_id: this.area_id,
      area_no: this.area_no,
      spots: [
        [this.target_label[0], this.target_label[0]], 
        [this.target_label[1], this.target_label[1]], 
        [this.target_label[2], this.target_label[2]]
      ],
    };
    ipcRenderer.invoke(MainChannel.set_airbase_spots, arg);
  }

  private get airsearchSpots(): AreaCheck[] {
    const filtered = this.cell_info.checks.filter(check => check.type === 'airsearch');
    const checks = filtered.map(el => {
      return {
        check: el, 
        spotXY: this.spotXY(el),
        stateText: this.airsearchStateText(el),
        cellClass: this.cellClass(el.type),
        cellXY: this.cellXY(el, el.type),
      }
    });
    return checks;
  }
  
  private get maplosSpots(): AreaCheck[] {
    const filtered = this.cell_info.checks.filter(check => check.type === 'maplos');
    const loses = filtered.map(el => {
      return {
        check: el, 
        spotXY: this.spotXY(el),
        stateText: this.maplosStateText(el),
        cellClass: this.cellClass(el.type),
        cellXY: this.cellXY(el),
      }
    });
    return loses;
  }

  private airsearchStateText(check: Check): string {
    const los = check.info.value ?? 0;

    // todo select deck
    const deck = svdata.deckPort(ApiDeckPortId.deck1st);
    let deckLos = 0;
    if (deck) {
      deckLos = svdata.deckGetItemLos(deck);
    }
    return [
      '偵察',
      los, 
      MathUtil.floor(los*16/10, 2), 
      MathUtil.floor(los*22/10, 2), 
      MathUtil.floor(deckLos, 2),
    ].join('/');
  }

  private maplosStateText(check: Check): string {
    const deck = svdata.deckPort(ApiDeckPortId.deck1st);
    let maplos = 0;
    if (deck) {
      maplos = MathUtil.floor(svdata.deckMapLos(deck, check.info.value ?? 0), 2);
    }
    return [
      `係数:${check.info.value ?? 0}`,
      check.info.min ?? 0,
      check.info.max ?? 0,
      maplos,
    ].join(' / ');
  }

  private get decks(): ApiDeckPort[] {
    return svdata.deckPorts;
  }

  private get currentSeikuu(): number {
    if (svdata.isCombined) {
      return this.combinedSeiku;
    }

    const deck = svdata.battleDeck;
    if (deck) {
      return svdata.deckSeiku(deck);
    }

    // todo: select deck
    return svdata.deckSeiku(this.decks[0]);
  }

  private get deckSeikus(): number[] {
    let ret:number[] = [];
    this.decks.forEach((deck) => {      
      ret.push(svdata.deckSeiku(deck));
    });
    console.log('制空:', ret);
    return ret;
  }

  private enemySpotClick(event: MouseEvent): void {
    event.preventDefault();
    if (event.isTrusted) {
      console.log('area click', event);
      const label = (event.target as HTMLElement).dataset.label;
      console.log('area click:', label);
      if (this.active_cell) {
        this.active_cell.classList.remove('active');
      }
      this.active_cell = event.target as HTMLElement;
      this.active_cell.classList.add('active');
      if (label) {
        this.selected_spot_label = label;
      }
    }
  }

  private cellClass(type?: string): string {
    let ret = 'cellarea';
    if (type)
      ret += ' '+type;
    return ret;
  }

  private cellXY(spot: Pick<Spot, 'x' | 'y'>, type?: string): string {
    /*
    let x = ((spot.x/2)+offsetx).toString();
    let y = ((spot.y/2)+offsety).toString();
    return 'left:'+x+'px;top:'+y+'px;';
    */
    const diff = type === 'boss' ? 26: 15;
    const ret = `left: ${ratio(spot.x)-diff}px; top:${ratio(spot.y)-diff}px`;
    return ret;
  }

  private spotXY(spot: Pick<Spot, 'x' | 'y' | 'label' | 'no'>): string {
    /*
    let x = ((spot.x/2)+offsetx).toString();
    let y = ((spot.y/2)+offsety).toString();
    return 'left:'+x+'px;top:'+y+'px;';
    */
    let x = ratio(spot.x);
    let y = ratio(spot.y);
    let label = spot.label;
    /*
    if (! label) {
      const finded = MapStuff.findSpotForLabel(this.cell_info.spots, spot.no);
      console.log('finded', finded);
      if (finded) {
        label = finded.label;
      }
    }
    */
    if (label) {
      const mod = modSpotXY(this.area_id, this.area_no, label);
      //console.log('finded', mod, label);
      if (mod) {
        x += mod.x;
        y += mod.y;
      }
    }
    const ret = `left: ${x+12}px; top: ${y-15}px`;
    //console.log(ret);
    return ret;
  }

  private maplosXY(spot: Spot): string {
    let x = ratio(spot.x);
    let y = ratio(spot.y);
    return `left: ${x}px; top: ${y}px`;
  }

  private seikubarText(spot: Spot): string {
    return `${this.currentSeikuu}：${spot.maxAa}`;
  }

  private seikuText(spot: Spot): string {
    if (! spot.maxAa) {
      return 'なし';
    }
    return spot.maxAa.toString();
  }

  private seikuStyle(spot: Spot): string {
    let style: string[] = [];
    if (! spot.maxAa) {
      style.push('display: none');
    } else {
      const per = (Math.floor(spot.maxAa*100/SEIKU_UNIT*100)/100).toString();
      //console.log('seikuu:'+seiku);
      //console.log('per:'+per);
      style.push(`width: ${per}%`);
    }
    return style.join(';');
  }

  private get seikuStyleDeck(): string {
    let style: string[] = [];
    const seiku = this.currentSeikuu;
    if (! seiku) {
      style.push('display: none');
    } else {
      const per = (Math.floor(seiku*100/SEIKU_UNIT*100)/100).toString();
      //console.log('seikuu:'+seiku);
      //console.log('per:'+per);
      style.push('width:'+ per +'%');
    }
    return style.join(';');
  }

  public get isCombined(): boolean {
    console.log(`連合艦隊:${svdata.isCombined}`);
    return svdata.isCombined;
  }

  public get combinedFlag(): CombinedFlag {
    return svdata.combinedFlag;
  }

  public get combinedSeiku(): number {
    const decks = svdata.deckPorts;
    return svdata.deckSeiku(decks[0])+svdata.deckSeiku(decks[1]);
  }
  
  private get hasAirbase(): boolean {
    console.log('hasAirbase:', this.area_id, this.area_no, svdata.hasAirbase(this.area_id, this.area_no), 'spot loaded:', this.target_spot_loaded, this.target_spot_invoked);
    const ret = svdata.hasAirbase(this.area_id, this.area_no);
    if (ret && ! this.target_spot_loaded) {
      if (! this.target_spot_invoked) {
        this.target_spot_invoked = true;
        ipcRenderer.invoke(MainChannel.get_airbase_spots, this.area_id, this.area_no).then((spots: AirbaseTargetSpots) => {
          console.log(MainChannel.get_airbase_spots, this.area_id_no, spots);
          this.target_label = [spots[0][0], spots[1][0], spots[2][0]];
          this.target_spot_loaded = true;
        });
      }
    }
    return ret;
  }

  private get mapinfo(): ApiMapInfo | undefined {
    return svdata.mapinfoFrom(this.area_id, this.area_no);
  }

  private get hasGauge(): boolean {

    if (this.isEventMap) {
      return true;
    }

    if (this.mapinfo) {
      return typeof(this.mapinfo.api_cleared) === 'number';
    }

    return GaugeAreaNo[this.area_id].includes(this.area_no);
  }

  private get isCleared(): boolean {
    const mapinfo = this.mapinfo;
    if (! mapinfo) {
      return false;
    }

    if (! mapinfo.api_defeat_count && ! mapinfo.api_required_defeat_count && 
        mapinfo.api_cleared) {
      return true;
    }

    if (mapinfo.api_gauge_type === ApiGaugeType.event) {
      const eventmap = mapinfo.api_eventmap;
      if (eventmap) {
        return 0 === eventmap.api_now_maphp;
      }
    }

    return false;
  }

  private get mepGaugeText(): string {
    const mapinfo = this.mapinfo;
    if (! mapinfo) {
      return 'ゲージ情報が未取得です。出撃画面を開いてください。';
    }

    if (mapinfo.api_gauge_type === ApiGaugeType.event || mapinfo.api_gauge_type === ApiGaugeType.yusou) {
      const eventmap = mapinfo.api_eventmap;
      if (eventmap) {
        const rank = MapLvText[eventmap.api_selected_rank] ?? '';
        if (0 === eventmap.api_now_maphp || mapinfo.api_cleared) {
          return 'クリア ' + rank;
        }
        const gauge_name = mapinfo.api_gauge_type === ApiGaugeType.event ? '戦力' : '輸送';
        return `${gauge_name}: ${eventmap.api_now_maphp}/${eventmap.api_max_maphp} ${rank}`;
      }
    }

    if (! mapinfo.api_defeat_count && ! mapinfo.api_required_defeat_count && 
        mapinfo.api_cleared) {
      return 'クリア';
    }

    if (mapinfo.api_gauge_type === ApiGaugeType.counter) {
      return `${mapinfo.api_defeat_count}/${mapinfo.api_required_defeat_count} クリア`;
    }

    return '';
  }

  private get isProduction(): boolean {
    return false;
    //return AppStuff.isProduction;
  }

}
</script>
