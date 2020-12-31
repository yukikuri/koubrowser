import {
  Api,
  ApiShip,
  ApiCallback,
  ApiCreateItemWithParam,
  ApiMissionResult,
  PrvBattleInfo,
  KcsUtil,
  ApiQuest,
  ApiQuestState,
  ApiMissionClearResult,
  ApiDestroyShipWithParam,
  ApiDestroyItem2WithParam,
  SlotitemType,
  ApiShipType,
  MstShipIdBeginEnemy,
  ApiEventId,
  ApiQuestType,
  ApiMapNext,
  MstShip,
  ApiQuestLabelTypeYearLy,
  PrvPracticeBattleInfo,
  ApiPowerUpWothParam,
  ApiMap,
  SlotitemImgType,
  ApiDeckPortId,
} from '@/lib/kcs'
import {
  Quest, 
  recordDate, 
  QuestState, 
  questCounter, 
  QuestCounter,
  calcEnemyHps,
  serverDate,
  isQuestCounter,
} from '@/lib/record'
import NeDB from 'nedb';
import { svdata } from '@/main/svdata';
import moment from 'moment';

const updaterCreators: {[key: number]: 
  ((p: UpdaterCtorParam) => QuestUpdater) | undefined } = {};

export const detailFormatters: {[key: number]: ((quest: Quest) => string) | undefined } = {};
const detailFormat = (prefixs: string[], quest: Quest): string => {
  const state = quest.state as QuestCounter;
  return state.count.reduce<string[]>((acc, el, index) => {
    acc.push(`${prefixs[index]}${el}/${state.countMax[index]}`);
    return acc;
  }, []).join(' ');
};

const detailFormatOne = (prefixs: string[], quest: Quest): string => {
  const state = quest.state as QuestCounter;
  return state.count.reduce<string[]>((acc, el, index) => {
    const txt = el === state.countMax[index] ? '済' : '未';
    acc.push(`${prefixs[index]}${txt}`);
    return acc;
  }, []).join(' ');
};

export const questDateKey = (type: ApiQuestType, label_type: number): string => {
  
  // single
  if (type === ApiQuestType.single) {
    return 'single';
  }

  // yearly
  const sdate = moment(serverDate());
  if (type === ApiQuestType.quarterly && label_type > ApiQuestLabelTypeYearLy) {
    return 'yearly-'+sdate.format('YYYY');
  }

  const date = sdate.subtract(5, 'hour');

  // daily
  if (type === ApiQuestType.daily) {
    return 'daily-'+date.format('YYYYMMDD');
  }

  // weekly
  if (type === ApiQuestType.weekly) {
    const week = date.subtract(1, 'day');
    return 'weekly-'+week.weekYear()+'-'+week.week();  
  }

  // monthly
  if (type === ApiQuestType.monthly) {
    return 'monthly-'+date.format('YYYYMM');
  }

  // quarterly
  if (type === ApiQuestType.quarterly) {
    // 3,4,5(2,3,4): 1
    // 6,7,8(5,6,7): 2
    // 9,10,11(8,9,10): 3
    // 12,1,2(11,0,1): 4
    const month = date.month();
    let q = 4;
    if (2 <= month && month <= 4) {
      q = 1;
    } else if (5 <= month && month <= 7) {
      q = 2;
    } else if (8 <= month && month <= 10) {
      q = 3;
    }
    return 'quarterly-'+date.format('YYYY')+'-'+q;
  }

  return '';
};


const handleDBErr = <T>(err: Error | null, newDoc: T, msg: string = '') => {
  if (msg) {
    console.log(msg);
  }
  if (err) {
    console.log(err);
  }
  if (newDoc) {
    console.log(JSON.stringify(newDoc));
  }
};

const updateLog = (
  err: Error | null, numberOfUpdate: number, doc: any, upsert: boolean) => {
  if (err) {
    console.log('update quest err', err);
  } else {
    console.log('number of updated:', numberOfUpdate, 'upsert:', upsert);
    if (doc) {
      console.log('doc');
      console.log(JSON.stringify(doc));
    }
  }
};

type UpdatedCallback = (updater: QuestUpdater) => void;
type QuestRecordLoaded = (record: Quest) => void;

const questPer = (quest: ApiQuest): number => {
  return [0, 0.5, 0.8]?.[quest.api_progress_flag] ?? 0;
};

const questPerValue = (quest: ApiQuest, max: number): number => {
  return Math.floor(max * questPer(quest));
};

const questDbMeta = {
  key: 'meta'
} as const;

interface QuestDbMetaRecord {
  readonly key: string;
  inProgress: number[];
}

interface UpdaterCtorParam {
  db: NeDB;
  quest: ApiQuest;
  updated: UpdatedCallback;
}

/**
 * 
 */
export abstract class QuestUpdater {
  public apiData: boolean = false;
  public abstract record: Quest | null;
  public tmpRecord: QuestState | null = null;
  protected db: NeDB;
  public quest: ApiQuest;
  protected updated: UpdatedCallback;
  constructor(p: UpdaterCtorParam) {
    this.db = p.db;
    this.quest = p.quest;
    this.updated = p.updated;
  }

  public abstract dateKey(): string;
  public abstract insert(): void;
  public abstract update(doNotify: boolean): void;
  public abstract newState(quest: ApiQuest): QuestState;
  public abstract fixState(quest: ApiQuest, state: QuestState): boolean;
  public abstract setCallback(): void;
  public abstract unsetCallback(): void;

  public static updateNos(db: Nedb, nos: number[]): void {
    console.log('update in progress quests:', nos);
    const options = { upsert: true };
    db.update<QuestDbMetaRecord>(questDbMeta, { ...questDbMeta, inProgress: nos }, options, updateLog);
  }

  public static insertNotSupportQuest(db: Nedb, quest: ApiQuest): void {
    const options = { upsert: true };
    const record: Quest<null> = {
      no: quest.api_no,
      dateKey: questDateKey(quest.api_type, quest.api_label_type),
      date: '',
      quest,
      state: null,
    };
    db.update<Quest<null>>({ no: quest.api_no }, record, options, updateLog);
  }

  public static isValidNotSupportQuest(record: Quest): boolean {
    const quest = record.quest;
    const dateKey = questDateKey(quest.api_type, quest.api_label_type);
    if (record.dateKey !== dateKey) {
      return false;
    }
    return record.state === null;
  }

  public static popNo(db: Nedb, no: number): void {
    console.log('pop in progress quests:', no);
    const options = { };
    db.update(questDbMeta, { $pull: { inProgress: no } }, options, updateLog);
  }

  public static load(db: Nedb, cb: QuestRecordLoaded): void {
    db.findOne<QuestDbMetaRecord>(questDbMeta, (err: Error | null, doc) => {
      if (err) {
        console.log('quest db load err', err);
      } else if (doc) {
        const nos = doc.inProgress.map(no => ({ no }));
        console.log(nos);
        db.find<Quest>({ $or: nos }, (err: Error | null, records) => {
          records?.forEach((record) => {
            console.log('finded quest record', JSON.stringify(record));
            cb(record);
          });
        });
      }
    });
  }

  public static create(db: NeDB, quest: ApiQuest, cb: UpdatedCallback, record: Quest | undefined = undefined): QuestUpdater | undefined | null {
    return createQuestUpdater(db, quest, cb, record);
  }
}

/**
 * 
 */
abstract class QuestUpdaterImplDB extends QuestUpdater {

  /**
   * 
   */
  dateKey(): string {
    return questDateKey(this.quest.api_type, this.quest.api_label_type);
  }

  /**
   * insert in progress quest
   */
  insert(): void {
    const no = this.quest.api_no;
    this.db.findOne<Quest<any>>({ no }, (err: Error | null, doc) => {
      handleDBErr(err, doc, 'quest updater impl db')

      if (err) {
        console.log(err);
        return ;
      }

      const quest = this.quest;
      const dateKey = this.dateKey();

      // check valididate
      const invalidated = (! doc || (doc.dateKey !== dateKey) || doc.state === null);
      let needUpdate = invalidated;
      if (invalidated) {
        const state = this.newState(quest);
        this.fixState(quest, state);
        doc = {
          no,
          date: recordDate(false),
          dateKey: dateKey,
          quest,
          state,
        };
      }
      else {
        if (doc && doc.state) {
          needUpdate = this.fixState(quest, doc.state);
        }
      }

      if (needUpdate) {
        const options = { upsert: true };
        this.db.update({ no }, doc, options, updateLog);
      }
      console.log('quest updater impl db set record', doc);
      console.log('quest updater impl db set record', doc.state);
      this.apiData = true;
      this.record = doc;
      this.updated(this);
      this.setCallback();
    });
  }

  /**
   * update in progress quest state
   */
  update(doNotify: boolean = true): void {
    if (this.record) {
      if (this.apiData) {
        const no = this.quest.api_no;
        const options = { };
        this.db.update({ no }, this.record, options, updateLog);
      }
      if (doNotify) {
        this.updated(this);
      }
    }
  }

  /**
   * remove in progress quest
   */
  popNo(): void {
    QuestUpdater.popNo(this.db, this.quest.api_no);
  }
}

/**
 * 
 */
abstract class QuestAnyCounter extends QuestUpdaterImplDB {
  abstract max: number[];

  record: Quest<QuestCounter> | null = null;
  get state(): QuestCounter {
    return this.record!.state;
  }

  newState(quest: ApiQuest): QuestCounter {
    if (this.max.length === 1) {
      return questCounter([questPerValue(quest, this.max[0])], this.max);
    }
    return questCounter(this.max.slice().fill(0), this.max);
  }

  fixState(quest: ApiQuest, state: QuestCounter): boolean {

    // fix state
    let ret = false;
    if ((state.countMax.length === this.max.length)) {
      this.max.forEach((el, index) => {
        if (state.countMax[index] !== el) {
          state.countMax[index] = el;
          ret = true;
        }
      });
    } else {
      state.countMax = this.max.slice();
      state.count = this.max.slice();
      state.count.fill(0);
      ret = true;
    }

    if (this.max.length === 1) {
      // percent < corrent count
      // or
      // not completed != corrent count completed
      const count = questPerValue(quest, this.max[0]);
      if (state.count[0] < count || (state.count[0] === state.countMax[0] && quest.api_state !== ApiQuestState.completed) ) {
        state.count[0] = count;
        ret = true;
      }
    }
    return ret;
  }

  protected increment(inc: number = 1, index: number = 0) {
    if(inc === 0) {
      return ;
    }

    const state = this.state;
    if (state.count[index] === state.countMax[index]) {
      return ;
    }

    state.count[index] += inc;
    if (state.count[index] > state.countMax[index]) {
      state.count[index] = state.countMax[index];
    }

    if (! state.count.some((el, index) => el < state.countMax[index])) {
      this.unsetCallback();
      this.popNo();
    }
    this.update();
  }

  protected increments(incs: number[]) {

    let doUpdate = false;

    const state = this.state;

    incs.forEach((el, index) => {
      if (el > 0) {
        if (state.count[index] < state.countMax[index]) {
          state.count[index] += el;
          doUpdate = true;
          if (state.count[index] > state.countMax[index]) {
            state.count[index] = state.countMax[index];
          }
        }
      }
    });

    if (doUpdate) {
      if (! state.count.some((el, index) => el < state.countMax[index])) {
        this.unsetCallback();
        this.popNo();
      }
      this.update();
    }
  }

}

/**
 * 
 */
abstract class QuestPractice extends QuestAnyCounter {
  cb: number = 0;
  abstract need_win_rank: string;

  setCallback(): void {
    this.cb = ApiCallback.set([Api.REQ_PRACTICE_BATTLE_RESULT, (arg: PrvPracticeBattleInfo) => this.onPractice(arg)]);
  }

  unsetCallback(): void {
    if (this.cb) {
      ApiCallback.unset(this.cb);
      this.cb = 0;
    }
  }

  onPractice(result: PrvPracticeBattleInfo): void {
    if (! fullfillWinCond(result.result.api_win_rank, this.need_win_rank)) {
      return ;
    }
    this.increment();
  }
}

/**
 * 
 */
abstract class QuestPracticeDeck extends QuestPractice {
  abstract isDeckMatch: IsDeckMatch | null;

  onPractice(result: PrvPracticeBattleInfo): void {

    console.log('quest practice deck', JSON.stringify(result));
    if (! fullfillWinCond(result.result.api_win_rank, this.need_win_rank)) {
      return ;
    }

    if (this.isDeckMatch) {
      const deck = svdata.deckPort(result.deck_id);
      if (! deck) {
        return ;
      }
      if (! this.isDeckMatch(deck.api_ship)) {
        return ;
      }
    }

    this.increment();
  }
}

/**
 * 
 */
abstract class QuestBattle extends QuestAnyCounter {
  cb_battle: number = 0;
  cb_combined_battle: number = 0;

  setCallback(): void {
    this.cb_battle = ApiCallback.set([Api.REQ_SORTIE_BATTLERESULT, (arg: PrvBattleInfo) => this.onBattle(arg)]);
    this.cb_combined_battle = ApiCallback.set([Api.REQ_COMBINED_BATTLE_BATTLERESULT, (arg: PrvBattleInfo) => this.onBattle(arg)]);
  }

  unsetCallback(): void {
    if (this.cb_battle) {
      ApiCallback.unset(this.cb_battle);
      this.cb_battle = 0;
    }
    if (this.cb_combined_battle) {
      ApiCallback.unset(this.cb_combined_battle);
      this.cb_combined_battle = 0;
    }
  }

  abstract onBattle(result: PrvBattleInfo): void;
}

/**
 * 
 */
abstract class QuestBattleSimple extends QuestBattle {
  abstract need_win: boolean;

  onBattle(result: PrvBattleInfo): void {
    if (this.need_win && ! KcsUtil.isVictory(result.result?.api_win_rank)) {
      return ;
    }
    this.increment();
  }
}


const enemy_ship_type_ids: {[key: string]: number[]} = {};
const getEnemyShipTypeIds = (type: ApiShipType): number[] => {
  const key = type.toString();
  let ret = enemy_ship_type_ids[key];
  if (! ret) {
    const ships = svdata.mstShips.filter(el => (el.api_id >= MstShipIdBeginEnemy) && (el.api_stype === type));
    ret = ships.map(el => el.api_id);
    enemy_ship_type_ids[key] = ret;
    console.log('enemy ship types:', type, 'ids:', enemy_ship_type_ids[key]);
  }
  return ret;
};

/**
 * 
 */
abstract class QuestBattleEnemy extends QuestBattle {
  abstract type: ApiShipType[];

  onBattle(result: PrvBattleInfo): void {
    const enemies = calcEnemyHps(result);
    const check_ids = enemies.filter(el => el.hp <= 0).map(el => el.id);
    if (check_ids.length) {
      const check_enemy_ids = this.type.reduce<number[]>((acc, el) => acc = acc.concat(getEnemyShipTypeIds(el)), []);
      const inc = check_ids.reduce((acc, el) => {
        if (check_enemy_ids.includes(el)) {
          ++acc;
        }
        return acc;
      }, 0);
      console.log('quest battle enemy type:', this.type, 'destroies ids:', check_ids,  'inc:', inc);
      this.increment(inc);
    }
  }
}

/**
 * 
 */
class QuestBattle214 extends QuestBattle {
  max = [36, 6, 24, 12]; // start, S, boss, win boss
  cb_map_start: number = 0;
  cb_map_next: number = 0;

  readonly idx_start = 0 as const;
  readonly idx_s = 1 as const;
  readonly idx_boss = 2 as const;
  readonly idx_boss_win = 3 as const;

  setCallback(): void {
    super.setCallback();
    const state = this.state;
    if (state.count[this.idx_start] < state.countMax[this.idx_start]) {
      this.cb_map_start = ApiCallback.set([Api.REQ_MAP_START, () => this.onMapStart()]);
    }
    if (state.count[this.idx_boss] < state.countMax[this.idx_boss]) {
      this.cb_map_next = ApiCallback.set([Api.REQ_MAP_NEXT, (map: ApiMapNext) => this.onMapNext(map)]);
    }
  }

  unsetCallback(): void {
    super.unsetCallback();
    if (this.cb_map_start) {
      ApiCallback.unset(this.cb_map_start);
      this.cb_map_start = 0;
    }
    if (this.cb_map_next) {
      ApiCallback.unset(this.cb_map_next);
      this.cb_map_next = 0;
    }
  }

  onMapStart(): void {
    this.increment(1, this.idx_start);
  }

  onMapNext(map: ApiMapNext): void {
    if (map.api_event_id === ApiEventId.bossBattle) {
      this.increment(1, this.idx_boss);
    }
  }

  onBattle(result: PrvBattleInfo): void {

    if (result.result?.api_win_rank.toUpperCase() === 'S') {
      this.increment(1, this.idx_s);
    }

    if ((result.map.api_event_id === ApiEventId.bossBattle) &&
      KcsUtil.isVictory(result.result?.api_win_rank)) {
      this.increment(1, this.idx_boss_win);
    }
  }
}

/**
 * 
 */
type QuestMap = [number, number, 'S' | 'A' | 'B' ]; // area_id, area_no, win_rank
type QuestMapCell = [number, number, 'S' | 'A' | 'B', number[] | undefined ]; // area_id, area_no, win_rank, cells
type QuestMapOrCell = QuestMap | QuestMapCell;
const win_ranks = ['S', 'A', 'B'];
const toWinRankNum = (win_rank: string): number => {
  return win_ranks.indexOf(win_rank.toUpperCase());
};

const fullfillWinCond = (this_win_rank: string, need_win_rank: string): boolean => {

  // no cond
  if (! need_win_rank.length) {
    return true;
  }

  const this_rank = toWinRankNum(this_win_rank);
  if (this_rank < 0) {
    return false;
  }

  const need_rank = toWinRankNum(need_win_rank);
  return this_rank <= need_rank;
};

abstract class QuestBattleMap extends QuestBattle {
  private cb_map_next: number = 0;
  abstract area_and_rank: (QuestMap | QuestMapCell)[];

  setCallback(): void {
    super.setCallback();
    // no battle: 1-6
    if (this.area_and_rank.some(el => el[0] === 1 && el[1] === 6)) {
      this.cb_map_next = ApiCallback.set([Api.REQ_MAP_NEXT, (map: ApiMapNext) => this.mapNext(map) ]);
    }
  }

  unsetCallback(): void {
    super.unsetCallback();
    if (this.cb_map_next) {
      ApiCallback.unset(this.cb_map_next);
      this.cb_map_next = 0;
    }
  }

  onBattle(result: PrvBattleInfo): void {
    const index = this.matchMap(result.map, result.result?.api_win_rank);
    if (-1 === index) {
      return ;
    }
    this.increment(1, this.max.length < index ? 0 : index);
  }

  protected matchMap(map: Pick<ApiMap, 'api_event_id' | 'api_bosscell_no'>, win_rank: string | undefined): number {

    const map_start = svdata.mapStart;
    if (! map_start) {
      return -1;
    }

    // 1-6 no boss: 1-6
    const isBossExist = map_start.api_bosscell_no !== 0;
    if (isBossExist && map.api_event_id !== ApiEventId.bossBattle) {
      return -1;
    }

    const index = this.area_and_rank.findIndex(el => el[0] === map_start.api_maparea_id && el[1] === map_start.api_mapinfo_no);
    if (-1 === index) {
      return -1;
    }

    const area_and_map = this.area_and_rank[index];
    if (Array.isArray(area_and_map[3])) {
      const cells = area_and_map[3];
      //console.log('is target cell:', JSON.stringify(this.record));
      //console.log('is target cell map:', map, cells.includes(result.map.api_bosscell_no));
      //console.log('is target cell result:', result);
      if (!cells.includes(map.api_bosscell_no)) {
        return -1;
      }
    }

    if (! isBossExist) {
      return index;
    }

    if (fullfillWinCond(win_rank ?? '', area_and_map[2])) {
      return index;
    }

    return -1;
  }

  mapNext(map: ApiMapNext): void {
    if(! map.api_itemget_eo_comment) {
      return ;
    } 

    const index = this.matchMap(map, undefined);
    if (-1 === index) {
      return ;
    }
    this.increment(1, this.max.length < index ? 0 : index);
  }
}

/**
 * 
 */
type isShipType = (mst: MstShip) => boolean;
type ShipCond = [ isShipType, number, boolean ]; // shiptype, count, == count
type IsDeckMatch = (ship_ids: number[]) => boolean;

abstract class QuestBattleMapDeck extends QuestBattleMap {
  abstract isDeckMatch: IsDeckMatch | null;

  onBattle(result: PrvBattleInfo): void {
  
    const index = this.matchMap(result.map, result.result?.api_win_rank);
    if (-1 === index) {
      return ;
    }

    if (this.isDeckMatch && result.result) {
      const deck = svdata.battleDeck;
      if (! deck) {
        return ;
      }
      if (! this.isDeckMatch(deck.api_ship)) {
        return ;
      }
    }

    this.increment(1, this.max.length < index ? 0 : index);
  }
}

const isShipIds = (ship_id: number, mst_ship_ids: number[]): boolean => {
  const mst = svdata.mstShipFrom(ship_id);
  if (mst) {
    return mst_ship_ids.includes(mst.api_id)
  }
  return false;
};

const isShipType = (ship_id: number, types: ApiShipType[]): boolean => {
  const mst = svdata.mstShipFrom(ship_id);
  if (mst) {
    return types.includes(mst.api_stype)
  }
  return false;
};

const isDeckShipType = (ship_ids: number[] | undefined, ship_types: ShipCond[]): boolean => {

  const counts = ship_ids?.reduce<number[]>((acc, ship_id) => {
    const mst = svdata.mstShipFrom(ship_id);
    if (mst) {
      const stype_index = ship_types.findIndex(el => el[0](mst));
      //console.log('multi map mst ship type index', stype_index);
      if (stype_index >= 0) {
        ++acc[stype_index];
      }
    }
    return acc;
  }, Array<number>(ship_types.length).fill(0));
  //console.log('multi map counts:', counts, 'map index', index);

  if (counts?.some((el, index) => {
    const type = ship_types[index];
    if (type[2]) {
      return el !== type[1];
    } 
    return el < type[1];
  })) {
    //console.log('shi count not hit multi map counts:', counts);
    return false;
  }

  return true;
};

interface ShipMst {
  readonly api: ApiShip;
  readonly mst: MstShip;
}

const toShipMsts = (ship_ids: number[]) : ShipMst[] => {
  return ship_ids.reduce<ShipMst[]>((acc, ship_id) => {
    const api = svdata.ship(ship_id);
    let mst = undefined;
    if (api) {
      mst = svdata.mstShip(api.api_ship_id);
      if (mst) {
        acc.push({api, mst});
      }
    }
    return acc;
  }, []);
};

const shipCount = (ships: ShipMst[], mst_ship_ids: number[]): number => {
  return ships.reduce((acc, ship) => {
    if(mst_ship_ids.includes(ship.mst.api_id)) {
      ++acc;
    }
    return acc;
  }, 0);
};


const shipTypeCount = (ships: ShipMst[], ship_types: ApiShipType[]): number => {
  return ships.reduce((acc, ship) => {
    if (ship_types.includes(ship.mst.api_stype)) {
      ++acc;
    } 
    return acc;
  }, 0);
};

/**
 * 
 */
abstract class QuestMission extends QuestAnyCounter {
  cb: number = 0;

  setCallback(): void {
    this.cb = ApiCallback.set([Api.REQ_MISSION_RESULT, (arg: ApiMissionResult) => this.onMissionResult(arg)]);
  }

  unsetCallback(): void {
    if (this.cb) {
      ApiCallback.unset(this.cb);
      this.cb = 0;
    }
  }

  onMissionResult(result: ApiMissionResult): void {
    if (result.api_clear_result === ApiMissionClearResult.failed) {
      return ;
    }
    this.increment();
  }
}

/**
 * 
 */
abstract class QuestMissionA extends QuestMission {
  abstract quest_names: string[][];

  onMissionResult(result: ApiMissionResult): void {
    if (result.api_clear_result === ApiMissionClearResult.failed) {
      return ;
    }

    const index = this.quest_names.findIndex(el => el.includes(result.api_quest_name));
    if (-1 === index) {
      return ;
    }
    this.increment(1, index);
  }
}

/**
 * 
 */
abstract class QuestNyukyo extends QuestAnyCounter {
  cb: number = 0;

  setCallback(): void {
    this.cb = ApiCallback.set([Api.REQ_NYUKYO_START, () => this.onNyukyoStart()]);
  }

  unsetCallback(): void {
    if (this.cb) {
      ApiCallback.unset(this.cb);
      this.cb = 0;
    }
  }

  onNyukyoStart(): void {
    this.increment();
  }
}

/**
 * 
 */
abstract class QuestKaisou extends QuestAnyCounter {
  cb: number = 0;

  setCallback(): void {
    this.cb = ApiCallback.set([Api.REQ_KAISOU_POWERUP, (arg: ApiPowerUpWothParam) => this.onPowerUp(arg)]);
  }

  unsetCallback(): void {
    if (this.cb) {
      ApiCallback.unset(this.cb);
      this.cb = 0;
    }
  }

  onPowerUp(arg: ApiPowerUpWothParam): void {
    if (arg.api_data.api_powerup_flag) {
      this.increment();
    }
  }
}

/**
 * 
 */
type ShipTypeCount = [ApiShipType, number];
abstract class QuestKaisouUseType extends QuestKaisou {
  abstract powerup_ship_type: ApiShipType | null;
  abstract use_ship_type: ShipTypeCount | null;

  onPowerUp(arg: ApiPowerUpWothParam): void {
    if (arg.api_data.api_powerup_flag) {
      if (this.powerup_ship_type !== null) {
        const mst = svdata.mstShip(arg.api_data.api_ship.api_ship_id);
        if (! mst) {
          return ;
        }
        if (mst.api_stype !== this.powerup_ship_type) {
          return ;
        }
      }
    }
    if (this.use_ship_type !== null) {
      if (arg.ship_types.length === this.use_ship_type[1]) {
        const count = arg.ship_types.reduce((acc, el) => {
          if (el === this.use_ship_type![0]) {
            ++acc;
          }
          return acc;
        }, 0);
        if (count == this.use_ship_type[1]) {
          this.increment();
        }
      }
    }
  }
}


/**
 * 
 */
abstract class QuestHokyu extends QuestAnyCounter {
  cb: number = 0;

  setCallback(): void {
    this.cb = ApiCallback.set([Api.REQ_HOKYU_CHARGE, () => this.onHokyuCharge()]);
  }

  unsetCallback(): void {
    if (this.cb) {
      ApiCallback.unset(this.cb);
      this.cb = 0;
    }
  }

  onHokyuCharge(): void {
    this.increment();
  }
}

/**
 * 
 */
abstract class QuestRemodel extends QuestAnyCounter {
  cb: number = 0;

  setCallback(): void {
    this.cb = ApiCallback.set([Api.REQ_KOUSYOU_REMODEL_SLOT, () => this.OnRemodel()]);
  }

  unsetCallback(): void {
    if (this.cb) {
      ApiCallback.unset(this.cb);
      this.cb = 0;
    }
  }

  OnRemodel(): void {
    this.increment();
  }
}

/**
 * 
 */
abstract class QuestCreateItem extends QuestAnyCounter {
  cb: number = 0;

  setCallback(): void {
    this.cb = ApiCallback.set([Api.REQ_KOUSYOU_CREATEITEM, (arg: ApiCreateItemWithParam) => this.onCreateItem(arg)]);
  }

  unsetCallback(): void {
    if (this.cb) {
      ApiCallback.unset(this.cb);
      this.cb = 0;
    }
  }

  onCreateItem(arg: ApiCreateItemWithParam): void {
    this.increment(arg.api_get_items.length);
  }
}

/**
 * 
 */
abstract class QuestDestroyItem extends QuestAnyCounter {
  cb: number = 0;
  flagship_ids: number[] = [];
  flagship_slotitem_id: number = 0;

  setCallback(): void {
    this.cb = ApiCallback.set(
      [Api.REQ_KOUSYOU_DESTROYITEM2, (arg: ApiDestroyItem2WithParam) => this.onDestroyItem(arg)]);
  }

  unsetCallback(): void {
    if (this.cb) {
      ApiCallback.unset(this.cb);
      this.cb = 0;
    }
  }

  abstract onDestroyItem(arg: ApiDestroyItem2WithParam): void;

  protected checkFlagshId(): boolean {
    if (this.flagship_ids.length === 0) {
      return true;
    }

    if (this.flagship_slotitem_id === 0) {
      return true;
    }

    const deck = svdata.deckPort(ApiDeckPortId.deck1st);
    if (! deck) {
      return false;
    }

    if (! isShipIds(deck.api_ship[0], this.flagship_ids)) {
      return false;
    }

    if (this.flagship_slotitem_id === 0) {
      return true;
    }

    const ship = svdata.ship(deck.api_ship[0]);
    if (! ship) {
      return false;
    }

    const slot = svdata.slot(ship.api_slot[0]);
    if (! slot) {
      return false;
    }

    return slot.mst.api_id === this.flagship_slotitem_id;
  }
}

/**
 * 
 */
abstract class QuestDestroyItemA extends QuestDestroyItem {
  abstract types: SlotitemType[];

  onDestroyItem(arg: ApiDestroyItem2WithParam): void {

    if (! this.checkFlagshId()) {
      return ;
    }

    if (! this.types.length) {
      this.increment();
      return ;
    }

    const incs = this.max.slice().fill(0);
    arg.mst_ids.forEach(el => {
      const mst = svdata.mstSlotitem(el);
      if (mst) {
        const item_type = KcsUtil.slotitemType(mst);
        const index = this.types.findIndex(type => type === item_type);
        if (index !== -1) {
          ++incs[index];
        }
      }
    });
    this.increments(incs);
  }
}

/**
 * 
 */
abstract class QuestDestroyItemT extends QuestDestroyItem {
  abstract types: SlotitemImgType[];

  onDestroyItem(arg: ApiDestroyItem2WithParam): void {

    if (! this.checkFlagshId()) {
      return ;
    }

    if (! this.types.length) {
      this.increment();
      return ;
    }

    const incs = this.max.slice().fill(0);
    arg.mst_ids.forEach(el => {
      const mst = svdata.mstSlotitem(el);
      if (mst) {
        const item_type = KcsUtil.slotitemImgType(mst);
        const index = this.types.findIndex(type => type === item_type);
        if (index !== -1) {
          ++incs[index];
        }
      }
    });
    this.increments(incs);
  }
}

/**
 * 
 */
abstract class QuestDestroyItemId extends QuestDestroyItem {
  abstract ids: number[];

  onDestroyItem(arg: ApiDestroyItem2WithParam): void {

    if (! this.checkFlagshId()) {
      return ;
    }

    if (! this.ids.length) {
      this.increment();
      return ;
    }

    const incs = this.max.slice().fill(0);
    arg.mst_ids.forEach(el => {
      const mst = svdata.mstSlotitem(el);
      if (mst) {
        const index = this.ids.findIndex(id => id === mst.api_id);
        if (index !== -1) {
          ++incs[index];
        }
      }
    });
    this.increments(incs);
  }
}


/**
 * 
 */
abstract class QuestCreateShip extends QuestAnyCounter {
  cb: number = 0;

  setCallback(): void {
    this.cb = ApiCallback.set([Api.REQ_KOUSYOU_CREATESHIP, () => this.onCreateShip()]);
  }

  unsetCallback(): void {
    if (this.cb) {
      ApiCallback.unset(this.cb);
      this.cb = 0;
    }
  }

  onCreateShip(): void {
    this.increment();
  }
}

/**
 * 
 */
abstract class QuestDestroyShip extends QuestAnyCounter {
  cb: number = 0;

  setCallback(): void {
    this.cb = ApiCallback.set(
      [Api.REQ_KOUSYOU_DESTROYSHIP, (arg: ApiDestroyShipWithParam) => this.onDestroyShip(arg)]);
  }

  unsetCallback(): void {
    if (this.cb) {
      ApiCallback.unset(this.cb);
      this.cb = 0;
    }
  }

  onDestroyShip(arg: ApiDestroyShipWithParam): void {
    this.increment(arg.ship_ids.length);
  }
}

// 201: 敵艦隊を撃破せよ！	
class Quest201 extends QuestBattleSimple {
  max = [1];
  need_win = true;
}
updaterCreators[201] = (p: UpdaterCtorParam) => new Quest201(p);
detailFormatters[201] = (quest: Quest): string => detailFormat(['戦闘勝利: '], quest);

// 210: 敵艦隊を 10 回邀撃せよ！	
class Quest210 extends QuestBattleSimple {
  max = [10];
  need_win = false;
}
updaterCreators[210] = (p: UpdaterCtorParam) => new Quest210(p);
detailFormatters[210] = (quest: Quest): string => detailFormat(['戦闘: '], quest);

// 211: 敵空母を 3 隻撃沈せよ！
class Quest211 extends QuestBattleEnemy {
  max = [3];
  type = [ApiShipType.kei_kuubo, ApiShipType.seiki_kuubo];
  dateKey(): string {
    return questDateKey(ApiQuestType.daily, this.quest.api_label_type);
  }
}
updaterCreators[211] = (p: UpdaterCtorParam) => new Quest211(p);
detailFormatters[211] = (quest: Quest): string => detailFormat(['空母系撃沈: '], quest);

// 212:	敵輸送船団を叩け！
class Quest212 extends QuestBattleEnemy {
  max = [5];
  type = [ApiShipType.hokyuukan_enemy];
  dateKey(): string {
    return questDateKey(ApiQuestType.daily, this.quest.api_label_type);
  }
}
updaterCreators[212] = (p: UpdaterCtorParam) => new Quest212(p);
detailFormatters[212] = (quest: Quest): string => detailFormat(['補給艦撃沈: '], quest);

// 213:	海上通商破壊作戦
class Quest213 extends QuestBattleEnemy {
  max = [20];
  type = [ApiShipType.hokyuukan_enemy];
}
updaterCreators[213] = (p: UpdaterCtorParam) => new Quest213(p);
detailFormatters[213] = (quest: Quest): string => detailFormat(['補給艦撃沈: '], quest);

// 214: あ号作戦
class Quest214 extends QuestBattle214 {
}
updaterCreators[214] = (p: UpdaterCtorParam) => new Quest214(p);
detailFormatters[214] = (quest: Quest): string => detailFormat(['出撃:', 'S勝利:', 'Boss到達:', 'Boss勝利:'], quest);

// 216: 敵艦隊主力を撃滅せよ！	
class Quest216 extends QuestBattleSimple {
  max = [1];
  need_win = false;
}
updaterCreators[216] = (p: UpdaterCtorParam) => new Quest216(p);
detailFormatters[216] = (quest: Quest): string => detailFormat(['戦闘: '], quest);

// 218:	敵補給艦を 3 隻撃沈せよ！
class Quest218 extends QuestBattleEnemy {
  max = [3];
  type = [ApiShipType.hokyuukan_enemy];
}
updaterCreators[218] = (p: UpdaterCtorParam) => new Quest218(p);
detailFormatters[218] = (quest: Quest): string => detailFormat(['補給艦撃沈: '], quest);

// 220: い号作戦
class Quest220 extends QuestBattleEnemy {
  max = [20];
  type = [ApiShipType.kei_kuubo, ApiShipType.seiki_kuubo];
}
updaterCreators[220] = (p: UpdaterCtorParam) => new Quest220(p);
detailFormatters[220] = (quest: Quest): string => detailFormat(['空母系撃沈: '], quest);

// 221:	ろ号作戦
class Quest221 extends QuestBattleEnemy {
  max = [50];
  type = [ApiShipType.hokyuukan_enemy];
}
updaterCreators[221] = (p: UpdaterCtorParam) => new Quest221(p);
detailFormatters[221] = (quest: Quest): string => detailFormat(['補給艦撃沈: '], quest);

// 226:	南西諸島海域の制海権を握れ！
class Quest226 extends QuestBattleMap {
  max = [5];
  area_and_rank: QuestMap[] = [ [ 2, 1, 'B' ], [ 2, 2, 'B' ], [ 2, 3, 'B' ], [ 2, 4, 'B' ], [ 2, 5, 'B' ] ];
}
updaterCreators[226] = (p: UpdaterCtorParam) => new Quest226(p);
detailFormatters[226] = (quest: Quest): string => detailFormat(['2-X B勝利以上: '], quest);

// 228:	海上護衛戦
class Quest228 extends QuestBattleEnemy {
  max = [15];
  type = [ApiShipType.sensuikan];
}
updaterCreators[228] = (p: UpdaterCtorParam) => new Quest228(p);
detailFormatters[228] = (quest: Quest): string => detailFormat(['潜水艦撃沈: '], quest);

// 229: 敵東方艦隊を撃滅せよ！
class Quest229 extends QuestBattleMap {
  max = [12];
  area_and_rank: QuestMap[] = [ [ 4, 1, 'B' ], [ 4, 2, 'B' ], [ 4, 3, 'B' ], [ 4, 4, 'B' ], [ 4, 5, 'B' ] ];
}
updaterCreators[229] = (p: UpdaterCtorParam) => new Quest229(p);
detailFormatters[229] = (quest: Quest): string => detailFormat(['4-X B勝利以上: '], quest);

// 230: 敵潜水艦を制圧せよ！
class Quest230 extends QuestBattleEnemy {
  max = [6];
  type = [ApiShipType.sensuikan];
}
updaterCreators[230] = (p: UpdaterCtorParam) => new Quest230(p);
detailFormatters[230] = (quest: Quest): string => detailFormat(['潜水艦撃沈: '], quest);

// 241:	敵北方艦隊主力を撃滅せよ！
class Quest241 extends QuestBattleMap {
  max = [5];
  area_and_rank: QuestMap[] = [ [ 3, 3, 'B' ], [ 3, 4, 'B' ], [ 3, 5, 'B' ] ];
}
updaterCreators[241] = (p: UpdaterCtorParam) => new Quest241(p);
detailFormatters[241] = (quest: Quest): string => detailFormat(['3-3 3-4 3-5 B勝利以上: '], quest);

// 242:	敵東方中枢艦隊を撃破せよ！
class Quest242 extends QuestBattleMap {
  max = [1];
  area_and_rank: QuestMap[] = [ [ 4, 4, 'B' ] ];
}
updaterCreators[242] = (p: UpdaterCtorParam) => new Quest242(p);
detailFormatters[242] = (quest: Quest): string => detailFormatOne(['4-4 B勝利以上:'], quest);

// 243:	南方海域珊瑚諸島沖の制空権を握れ！
class Quest243 extends QuestBattleMap {
  max = [2];
  area_and_rank: QuestMap[] = [ [ 5, 2, 'S' ] ];
}
updaterCreators[243] = (p: UpdaterCtorParam) => new Quest243(p);
detailFormatters[243] = (quest: Quest): string => detailFormat(['5-2 S勝利: '], quest);

// 249:	「第五戦隊」出撃せよ！
class Quest249 extends QuestBattleMapDeck {
  max = [1];
  area_and_rank: QuestMap[] = [ [ 2, 5, 'S' ] ];
  isDeckMatch = ((ship_ids: number[]) => {
    const check_ids = [ 
      svdata.shipMstIds(62), 
      svdata.shipMstIds(63), 
      svdata.shipMstIds(65), 
     ].flat();
    return 3 === shipCount(toShipMsts(ship_ids), check_ids);
  });
}
updaterCreators[249] = (p: UpdaterCtorParam) => new Quest249(p);
detailFormatters[249] = (quest: Quest): string => detailFormat(['第五戦隊 2-5 S勝利: '], quest);

// 256:	「潜水艦隊」出撃せよ！
class Quest256 extends QuestBattleMap {
  max = [3];
  area_and_rank: QuestMap[] = [ [ 6, 1, 'S' ] ];
}
updaterCreators[256] = (p: UpdaterCtorParam) => new Quest256(p);
detailFormatters[256] = (quest: Quest): string => detailFormat(['6-1 S勝利: '], quest);

// 257:	「水雷戦隊」南西へ！
class Quest257 extends QuestBattleMapDeck {
  max = [1];
  area_and_rank: QuestMap[] = [ [ 1, 4, 'S' ] ];
  isDeckMatch = (ship_ids: number[]) => {
    if (! isShipType(ship_ids[0], [ApiShipType.keijyun])) {
      return false;
    }

    const ships = toShipMsts(ship_ids);
    const kutiku = shipTypeCount(ships, [ApiShipType.kutikukan]);
    const keijyun = shipTypeCount(ships, [ApiShipType.keijyun]);
    if ((kutiku + keijyun) != 6) {
      return false;
    }
    if (keijyun > 3) {
      return false;
    }
    return true;
  };
}
updaterCreators[257] = (p: UpdaterCtorParam) => new Quest257(p);
detailFormatters[257] = (quest: Quest): string => detailFormat(['1-4 S勝利: '], quest);

// 259:「水上打撃部隊」南方へ！
class Quest259 extends QuestBattleMapDeck {
  max = [1];
  area_and_rank: QuestMap[] = [ [ 5, 1, 'S' ] ];
  isDeckMatch = (ship_ids: number[]) => {

    const ships = toShipMsts(ship_ids);
    const keijyun = shipTypeCount(ships, [ApiShipType.keijyun]);
    if (keijyun < 1) {
      return false;
    }

    const check_ids = [ 
      svdata.shipMstIds(131), 
      svdata.shipMstIds(143), 
      svdata.shipMstIds(80), 
      svdata.shipMstIds(81),
      svdata.shipMstIds(77),
      svdata.shipMstIds(87),
      svdata.shipMstIds(26),
      svdata.shipMstIds(27),
     ].flat();
    const senkan = shipCount(ships, check_ids);
    if (senkan != 3) {
      return false;
    }
    return true;
  };
}
updaterCreators[259] = (p: UpdaterCtorParam) => new Quest259(p);
detailFormatters[259] = (quest: Quest): string => detailFormat(['5-1 S勝利: '], quest);

// 261:	海上輸送路の安全確保に努めよ！
class Quest261 extends QuestBattleMap {
  max = [3];
  area_and_rank: QuestMap[] = [ [ 1, 5, 'A' ] ];
}
updaterCreators[261] = (p: UpdaterCtorParam) => new Quest261(p);
detailFormatters[261] = (quest: Quest): string => detailFormat(['1-5 A勝利以上: '], quest);

// 264:「空母機動部隊」西へ！
class Quest264 extends QuestBattleMapDeck {
  max = [1];
  area_and_rank: QuestMap[] = [ [ 4, 2, 'S' ] ];
  ship_conds: ShipCond[] = [ 
    [ (mst: MstShip): boolean => 
      mst.api_stype === ApiShipType.kei_kuubo || 
      mst.api_stype === ApiShipType.seiki_kuubo || 
      mst.api_stype === ApiShipType.soukou_kuubo, 2, false],
    [ (mst: MstShip): boolean => mst.api_stype === ApiShipType.kutikukan, 2, false] 
 ];
 isDeckMatch = (ship_ids: number[]) => isDeckShipType(ship_ids, this.ship_conds);
}
updaterCreators[264] = (p: UpdaterCtorParam) => new Quest264(p);
detailFormatters[264] = (quest: Quest): string => detailFormat(['4-2 S勝利: '], quest);

// 265:	海上護衛強化月間
class Quest265 extends QuestBattleMap {
  max = [10];
  area_and_rank: QuestMap[] = [ [ 1, 5, 'A' ] ];
}
updaterCreators[265] = (p: UpdaterCtorParam) => new Quest265(p);
detailFormatters[265] = (quest: Quest): string => detailFormat(['1-5 A勝利以上: '], quest);

// 266:「水上反撃部隊」突入せよ！
class Quest266 extends QuestBattleMapDeck {
  max = [1];
  area_and_rank: QuestMap[] = [[2, 5, 'S']];
  isDeckMatch = ((ship_ids: number[]) => {
    if (!isShipType(ship_ids[0], [ApiShipType.kutikukan])) {
      return false;
    }

    const ships = toShipMsts(ship_ids);
    if (1 !== shipTypeCount(ships, [ApiShipType.keijyun])) {
      return false;
    }

    if (1 !== shipTypeCount(ships, [ApiShipType.jyuujyun])) {
      return false;
    }

    if (4 !== shipTypeCount(ships, [ApiShipType.kutikukan])) {
      return false;
    }
    return true;
  });
}
updaterCreators[266] = (p: UpdaterCtorParam) => new Quest266(p);
detailFormatters[266] = (quest: Quest): string => detailFormatOne(['2-5S:'], quest);

// 280: 兵站線確保！海上警備を強化実施せよ！
class Quest280 extends QuestBattleMapDeck {
  max = [1, 1, 1, 1];
  area_and_rank: QuestMap[] = [ [ 1, 2, 'S' ], [ 1, 3, 'S'], [ 1, 4, 'S'], [ 2, 1, 'S'] ];
  ship_conds: ShipCond[] = [ 
    [ (mst: MstShip): boolean => mst.api_stype === ApiShipType.kei_kuubo || mst.api_stype === ApiShipType.keijyun, 1, false],
    [ (mst: MstShip): boolean => mst.api_stype === ApiShipType.kutikukan || mst.api_stype === ApiShipType.kaiboukan, 3, false] 
 ];
 isDeckMatch = (ship_ids: number[]) => isDeckShipType(ship_ids, this.ship_conds);
}
updaterCreators[280] = (p: UpdaterCtorParam) => new Quest280(p);
detailFormatters[280] = (quest: Quest): string => detailFormatOne(['1-2S:', '1-3S:', '1-4S:','2-1S:'], quest);

// 284:	南西諸島方面「海上警備行動」発令！
class Quest284 extends QuestBattleMapDeck {
  max = [1, 1, 1, 1];
  area_and_rank: QuestMap[] = [ [ 1, 4, 'S' ], [ 2, 1, 'S'], [ 2, 2, 'S'], [ 2, 3, 'S'] ];
  ship_conds: ShipCond[] = [ 
    [ (mst: MstShip): boolean => mst.api_stype === ApiShipType.kei_kuubo || mst.api_stype === ApiShipType.keijyun, 1, false],
    [ (mst: MstShip): boolean => mst.api_stype === ApiShipType.kutikukan || mst.api_stype === ApiShipType.kaiboukan, 3, false] 
 ];
 isDeckMatch = (ship_ids: number[]) => isDeckShipType(ship_ids, this.ship_conds);
}
updaterCreators[284] = (p: UpdaterCtorParam) => new Quest284(p);
detailFormatters[284] = (quest: Quest): string => detailFormatOne(['1-4S:', '2-1S:', '2-2S:','2-3S:'], quest);

// 302: 大規模演習
class Quest302 extends QuestPractice {
  max = [20];
  need_win_rank = 'B';
}
updaterCreators[302] = (p: UpdaterCtorParam) => new Quest302(p);
detailFormatters[302] = (quest: Quest): string => detailFormat(['演習勝利: '], quest);

// 303:「演習」で練度向上！
class Quest303 extends QuestPractice {
  max = [3];
  need_win_rank = '';
}
updaterCreators[303] = (p: UpdaterCtorParam) => new Quest303(p);
detailFormatters[303] = (quest: Quest): string => detailFormat(['演習: '], quest);

// 304:「演習」で他提督を圧倒せよ！
class Quest304 extends QuestPractice {
  max = [5];
  need_win_rank = 'B';
}
updaterCreators[304] = (p: UpdaterCtorParam) => new Quest304(p);
detailFormatters[304] = (quest: Quest): string => detailFormat(['演習勝利: '], quest);

// 311: 精鋭艦隊演習
class Quest311 extends QuestPractice {
  max = [7];
  need_win_rank = 'B';
  dateKey(): string {
    return questDateKey(ApiQuestType.daily, this.quest.api_label_type);
  }
}
updaterCreators[311] = (p: UpdaterCtorParam) => new Quest311(p);
detailFormatters[311] = (quest: Quest): string => detailFormat(['演習勝利: '], quest);

// 330:	空母機動部隊、演習始め！
class Quest330 extends QuestPracticeDeck {
  max = [4];
  need_win_rank = 'B';
  ship_conds: ShipCond[] = [ 
    [ (mst: MstShip): boolean => mst.api_stype === ApiShipType.seiki_kuubo || mst.api_stype === ApiShipType.kei_kuubo || mst.api_stype === ApiShipType.soukou_kuubo, 2, false],
    [ (mst: MstShip): boolean => mst.api_stype === ApiShipType.kutikukan, 2, false ]
  ];

  isDeckMatch = (ship_ids: number[]) => {
    if (! isShipType(ship_ids[0], [ApiShipType.seiki_kuubo, ApiShipType.kei_kuubo, ApiShipType.soukou_kuubo])) {
      return false;
    }
    return isDeckShipType(ship_ids, this.ship_conds);
  };

  dateKey(): string {
    return questDateKey(ApiQuestType.daily, this.quest.api_label_type);
  }
}
updaterCreators[330] = (p: UpdaterCtorParam) => new Quest330(p);
detailFormatters[330] = (quest: Quest): string => detailFormat(['演習勝利: '], quest);

// 337:	「十八駆」演習！
class Quest337 extends QuestPracticeDeck {
  max = [3];
  need_win_rank = 'S';

  isDeckMatch = (ship_ids: number[]) => {
    const ships = toShipMsts(ship_ids);
    const check_ids = [
      svdata.shipMstIds(49),      
      svdata.shipMstIds(48),
      svdata.shipMstIds(17),
      svdata.shipMstIds(18),
    ].flat();
    return 4 === shipCount(ships, check_ids);
  };

  dateKey(): string {
    return questDateKey(ApiQuestType.daily, this.quest.api_label_type);
  }
}
updaterCreators[337] = (p: UpdaterCtorParam) => new Quest337(p);
detailFormatters[337] = (quest: Quest): string => detailFormat(['演習 S勝利: '], quest);

// 339:	「十九駆」演習！
class Quest339 extends QuestPracticeDeck {
  max = [3];
  need_win_rank = 'S';

  isDeckMatch = (ship_ids: number[]) => {
    const ships = toShipMsts(ship_ids);
    const check_ids = [
      svdata.shipMstIds(12),
      svdata.shipMstIds(486),
      svdata.shipMstIds(13),
      svdata.shipMstIds(14),
    ].flat();
    return 4 === shipCount(ships, check_ids);
  };

  dateKey(): string {
    return questDateKey(ApiQuestType.daily, this.quest.api_label_type);
  }
}
updaterCreators[339] = (p: UpdaterCtorParam) => new Quest339(p);
detailFormatters[339] = (quest: Quest): string => detailFormat(['演習 S勝利: '], quest);

// 342:	小艦艇群演習強化任務
class Quest342 extends QuestPracticeDeck {
  max = [4];
  need_win_rank = 'A';

  isDeckMatch = (ship_ids: number[]) => {
    const ships = toShipMsts(ship_ids);
    const kutiku_kaibou = shipTypeCount(ships, [ApiShipType.kutikukan, ApiShipType.kaiboukan]);
    if (4 <= kutiku_kaibou) {
      return true;
    }    
    const keijyun = shipTypeCount(ships, [ApiShipType.keijyun]);
    if (3 <= kutiku_kaibou && 1 <= keijyun) {
      return true;
    }

    return false;
  };

  dateKey(): string {
    return questDateKey(ApiQuestType.daily, this.quest.api_label_type);
  }
}
updaterCreators[342] = (p: UpdaterCtorParam) => new Quest342(p);
detailFormatters[342] = (quest: Quest): string => detailFormat(['演習 A勝利以上: '], quest);

// 345:	演習ティータイム！
class Quest345 extends QuestPracticeDeck {
  max = [4];
  need_win_rank = 'A';

  isDeckMatch = (ship_ids: number[]) => {
    const ships = toShipMsts(ship_ids);
    const check_ids = [
      svdata.shipMstIds(439),
      svdata.shipMstIds(78),
      svdata.shipMstIds(515),
      svdata.shipMstIds(571),
      svdata.shipMstIds(519),
      svdata.shipMstIds(520),
    ].flat();
    return 4 === shipCount(ships, check_ids);
  };

  dateKey(): string {
    return questDateKey(ApiQuestType.daily, this.quest.api_label_type);
  }
}
updaterCreators[345] = (p: UpdaterCtorParam) => new Quest345(p);
detailFormatters[345] = (quest: Quest): string => detailFormat(['演習 A勝利以上: '], quest);

// 346:	最精鋭！主力オブ主力、演習開始！
class Quest346 extends QuestPracticeDeck {
  max = [4];
  need_win_rank = 'A';

  isDeckMatch = (ship_ids: number[]) => {
    const ships = toShipMsts(ship_ids);
    const check_ids = [ 542, 563, 564, 648 ];
    return 4 === shipCount(ships, check_ids);
  };

  dateKey(): string {
    return questDateKey(ApiQuestType.daily, this.quest.api_label_type);
  }
}
updaterCreators[346] = (p: UpdaterCtorParam) => new Quest346(p);
detailFormatters[346] = (quest: Quest): string => detailFormat(['演習 A勝利以上: '], quest);

// 347: 奇跡の駆逐艦
class Quest347 extends QuestPracticeDeck {
  max = [4];
  need_win_rank = 'S';
  ship_conds: ShipCond[] = [ 
    [ (mst: MstShip): boolean => mst.api_stype === ApiShipType.kutikukan, 4, false] 
  ];

  isDeckMatch = (ship_ids: number[]) => {
    const check_ids = svdata.shipMstIds(20);
    console.log('deck flagship:', isShipIds(ship_ids[0], check_ids));
    console.log('deck type:', isDeckShipType(ship_ids, this.ship_conds));
    if (! isShipIds(ship_ids[0], check_ids)) {
      return false;     
    }
    return isDeckShipType(ship_ids, this.ship_conds);
  };

  dateKey(): string {
    return questDateKey(ApiQuestType.daily, this.quest.api_label_type);
  }
}
updaterCreators[347] = (p: UpdaterCtorParam) => new Quest347(p);
detailFormatters[347] = (quest: Quest): string => detailFormat(['演習 S勝利: '], quest);

// 402: 「遠征」を 3 回成功させよう！
class Quest402 extends QuestMission {
  max = [3];
}
updaterCreators[402] = (p: UpdaterCtorParam) => new Quest402(p);
detailFormatters[402] = (quest: Quest): string => detailFormat(['遠征成功: '], quest);

// 403: 「遠征」を１０回成功させよう！
class Quest403 extends QuestMission {
  max = [10];
}
updaterCreators[403] = (p: UpdaterCtorParam) => new Quest403(p);
detailFormatters[403] = (quest: Quest): string => detailFormat(['遠征成功: '], quest);

// 404: 大規模遠征作戦、発令！
class Quest404 extends QuestMission {
  max = [30];
}
updaterCreators[404] = (p: UpdaterCtorParam) => new Quest404(p);
detailFormatters[404] = (quest: Quest): string => detailFormat(['遠征成功: '], quest);

// 410:	南方への輸送作戦を成功させよ！
class Quest410 extends QuestMissionA {
  max = [1];
  quest_names = [ ['東京急行', '東京急行(弐)'] ];
}
updaterCreators[410] = (p: UpdaterCtorParam) => new Quest410(p);
detailFormatters[410] = (quest: Quest): string => detailFormat(['東急系成功: '], quest);

// 411: 南方への鼠輸送を継続実施せよ！
class Quest411 extends QuestMissionA {
  max = [6];
  quest_names = [ ['東京急行', '東京急行(弐)'] ];
}
updaterCreators[411] = (p: UpdaterCtorParam) => new Quest411(p);
detailFormatters[411] = (quest: Quest): string => detailFormat(['東急系成功: '], quest);

// 424:	輸送船団護衛を強化せよ！
class Quest424 extends QuestMissionA {
  max = [4];
  quest_names = [ ['海上護衛任務'] ];
}
updaterCreators[424] = (p: UpdaterCtorParam) => new Quest424(p);
detailFormatters[424] = (quest: Quest): string => detailFormat(['海上護衛任務: '], quest);

// 426:	海上通商航路の警戒を厳とせよ！
class Quest426 extends QuestMissionA {
  max = [1, 1, 1, 1];
  quest_names = [ ['警備任務'], ['対潜警戒任務'], ['海上護衛任務'], ['強行偵察任務'] ];
}
updaterCreators[426] = (p: UpdaterCtorParam) => new Quest426(p);
detailFormatters[426] = (quest: Quest): string => detailFormatOne(['遠征3:', '遠征4:', '遠征5:', '遠征10:'], quest);

// 428:	近海に侵入する敵潜を制圧せよ！
class Quest428 extends QuestMissionA {
  max = [2, 2, 2];
  quest_names = [ ['対潜警戒任務'], ['海峡警備行動'], ['長時間対潜警戒'] ];
}
updaterCreators[428] = (p: UpdaterCtorParam) => new Quest428(p);
detailFormatters[428] = (quest: Quest): string => detailFormat(['遠征4: ', '遠征A2: ', '遠征A3: '], quest);

// 434:	特設護衛船団司令部、活動開始！
class Quest434 extends QuestMissionA {
  max = [1, 1, 1, 1, 1];
  quest_names = [ ['警備任務'], ['海上護衛任務'], ['兵站強化任務'], ['海峡警備行動'], ['タンカー護衛任務'] ];
}
updaterCreators[434] = (p: UpdaterCtorParam) => new Quest434(p);
detailFormatters[434] = (quest: Quest): string => detailFormatOne(['遠征3:', '遠征5:', '遠征A1:', '遠征A2:', '遠征9:'], quest);

// 436:	練習航海及び警備任務を実施せよ！
class Quest436 extends QuestMissionA {
  max = [1, 1, 1, 1, 1];
  quest_names = [ ['練習航海'], ['長距離練習航海'], ['警備任務'], ['対潜警戒任務'], ['強行偵察任務'] ];
}
updaterCreators[436] = (p: UpdaterCtorParam) => new Quest436(p);
detailFormatters[436] = (quest: Quest): string => detailFormatOne(['遠征1:', '遠征2:', '遠征3:', '遠征4:', '遠征10:'], quest);

// 437:	小笠原沖哨戒線の強化を実施せよ！
class Quest437 extends QuestMissionA {
  max = [1, 1, 1, 1];
  quest_names = [ ['対潜警戒任務'], ['小笠原沖哨戒線'], ['小笠原沖戦闘哨戒'], ['南西方面航空偵察作戦'] ];
}
updaterCreators[437] = (p: UpdaterCtorParam) => new Quest437(p);
detailFormatters[437] = (quest: Quest): string => detailFormatOne(['遠征4:', '遠征A5:', '遠征A6:', '遠征B1:'], quest);

// 438:	南西諸島方面の海上護衛を強化せよ！
class Quest438 extends QuestMissionA {
  max = [1, 1, 1, 1];
  quest_names = [ ['兵站強化任務'], ['対潜警戒任務'], ['タンカー護衛任務'], ['南西諸島捜索撃滅戦'] ];
}
updaterCreators[438] = (p: UpdaterCtorParam) => new Quest438(p);
detailFormatters[438] = (quest: Quest): string => detailFormatOne(['遠征A1:', '遠征4:', '遠征9:', '遠征B5:'], quest);

// 439:	兵站強化遠征任務【基本作戦】
class Quest439 extends QuestMissionA {
  max = [1, 1, 1, 1];
  quest_names = [ ['海上護衛任務'], ['兵站強化任務'], ['ボーキサイト輸送任務'], ['南西方面航空偵察作戦'] ];
}
updaterCreators[439] = (p: UpdaterCtorParam) => new Quest439(p);
detailFormatters[439] = (quest: Quest): string => detailFormatOne(['遠征5:', '遠征A1:', '遠征11:', '遠征B1:'], quest);

// 440:	兵站強化遠征任務【拡張作戦】
class Quest440 extends QuestMissionA {
  max = [1, 1, 1, 1, 1];
  quest_names = [ ['ブルネイ泊地沖哨戒'], ['海上護衛任務'], ['水上機前線輸送'], ['強行鼠輸送作戦'], ['南西海域戦闘哨戒'] ];
}
updaterCreators[440] = (p: UpdaterCtorParam) => new Quest440(p);
detailFormatters[440] = (quest: Quest): string => detailFormatOne(['遠征41:', '遠征5:', '遠征40:', '遠征E2:', '遠征46:'], quest);

// 503: 艦隊大整備！
class Quest503 extends QuestNyukyo {
  max = [5];
}
updaterCreators[503] = (p: UpdaterCtorParam) => new Quest503(p);
detailFormatters[503] = (quest: Quest): string => detailFormat(['入渠: '], quest);

// 504: 艦隊酒保祭り！
class Quest504 extends QuestHokyu {
  max = [15];
}
updaterCreators[504] = (p: UpdaterCtorParam) => new Quest504(p);
detailFormatters[504] = (quest: Quest): string => detailFormat(['補給: '], quest);

// 605:	新装備「開発」指令
class Quest605 extends QuestCreateItem {
  max = [1];
}
updaterCreators[605] = (p: UpdaterCtorParam) => new Quest605(p);
detailFormatters[605] = (quest: Quest): string => detailFormat(['開発: '], quest);

// 606:	新造艦「建造」指令
class Quest606 extends QuestCreateShip {
  max = [1];
}
updaterCreators[606] = (p: UpdaterCtorParam) => new Quest606(p);
detailFormatters[606] = (quest: Quest): string => detailFormat(['建造: '], quest);

// 607:	装備「開発」集中強化！
class Quest607 extends QuestCreateItem {
  max = [3];
}
updaterCreators[607] = (p: UpdaterCtorParam) => new Quest607(p);
detailFormatters[607] = (quest: Quest): string => detailFormat(['開発: '], quest);

// 608:	新造艦「建造」指令
class Quest608 extends QuestCreateShip {
  max = [3];
}
updaterCreators[608] = (p: UpdaterCtorParam) => new Quest608(p);
detailFormatters[608] = (quest: Quest): string => detailFormat(['建造: '], quest);

// 609:	軍縮条約対応！
class Quest609 extends QuestDestroyShip {
  max = [2];
}
updaterCreators[609] = (p: UpdaterCtorParam) => new Quest609(p);
detailFormatters[609] = (quest: Quest): string => detailFormat(['解体: '], quest);

// 613: 資源の再利用
class Quest613 extends QuestDestroyItemA {
  max = [24];
  types = [];
}
updaterCreators[613] = (p: UpdaterCtorParam) => new Quest613(p);
detailFormatters[613] = (quest: Quest): string => detailFormat(['破棄: '], quest);

// 619: 装備の改修強化
class Quest619 extends QuestRemodel {
  max = [1];
}
updaterCreators[619] = (p: UpdaterCtorParam) => new Quest619(p);
detailFormatters[619] = (quest: Quest): string => detailFormat(['改修: '], quest);

// 638:	対空機銃量産
class Quest638 extends QuestDestroyItemA {
  max = [6];
  types = [SlotitemType.AAGun];
}
updaterCreators[638] = (p: UpdaterCtorParam) => new Quest638(p);
detailFormatters[638] = (quest: Quest): string => detailFormat(['機銃破棄: '], quest);

// 643:	主力「陸攻」の調達
class Quest643 extends QuestDestroyItemId {
  max = [2];
  ids = [20];
  fixState(quest: ApiQuest, state: QuestCounter): boolean {
    return false;
  }
}
updaterCreators[643] = (p: UpdaterCtorParam) => new Quest643(p);
detailFormatters[643] = (quest: Quest): string => detailFormat(['零式艦戦21型破棄: '], quest);

// 653:	工廠稼働！次期作戦準備！
class Quest653 extends QuestDestroyItemId {
  max = [6];
  ids = [4];
  fixState(quest: ApiQuest, state: QuestCounter): boolean {
    return false;
  }
}
updaterCreators[653] = (p: UpdaterCtorParam) => new Quest653(p);
detailFormatters[653] = (quest: Quest): string => detailFormat(['14cm単装砲破棄: '], quest);

// 663:	新型艤装の継続研究
class Quest663 extends QuestDestroyItemA {
  max = [10];
  types = [SlotitemType.LargeMainGun];
}
updaterCreators[663] = (p: UpdaterCtorParam) => new Quest663(p);
detailFormatters[663] = (quest: Quest): string => detailFormat(['大口径破棄: '], quest);

// 655: 工廠フル稼働！新兵装を開発せよ！
class Quest655 extends QuestDestroyItemA {
  max = [5, 5, 5, 5, 5];
  types = [
    SlotitemType.SmallMainGun, 
    SlotitemType.MediumMainGun, 
    SlotitemType.LargeMainGun,
    SlotitemType.RecSeaplane, 
    SlotitemType.TorpedoBomber
  ];
}
updaterCreators[655] = (p: UpdaterCtorParam) => new Quest655(p);
detailFormatters[655] = (quest: Quest): string => detailFormat(['破棄 小口径: ', '中口径: ', '大口径: ', '偵察機: ', '魚雷: '], quest);

// 657:	新型兵装開発整備の強化
class Quest657 extends QuestDestroyItemA {
  max = [6, 5, 4];
  types = [
    SlotitemType.SmallMainGun, 
    SlotitemType.MediumMainGun, 
    SlotitemType.TorpedoBomber,
  ];
}
updaterCreators[657] = (p: UpdaterCtorParam) => new Quest657(p);
detailFormatters[657] = (quest: Quest): string => detailFormat(['小口径破棄: ', '中口径破棄: ', '艦攻破棄: '], quest);

// 673:	装備開発力の整備
class Quest673 extends QuestDestroyItemA {
  max = [4];
  types = [SlotitemType.SmallMainGun];
}
updaterCreators[673] = (p: UpdaterCtorParam) => new Quest673(p);
detailFormatters[673] = (quest: Quest): string => detailFormat(['小口径破棄: '], quest);

// 674:	工廠環境の整備
class Quest674 extends QuestDestroyItemA {
  max = [3];
  types = [SlotitemType.AAGun];
}
updaterCreators[674] = (p: UpdaterCtorParam) => new Quest674(p);
detailFormatters[674] = (quest: Quest): string => detailFormat(['機銃破棄: '], quest);

// 675:	運用装備の統合整備
class Quest675 extends QuestDestroyItemA {
  max = [6, 4];
  types = [SlotitemType.Fighter, SlotitemType.AAGun];
}
updaterCreators[675] = (p: UpdaterCtorParam) => new Quest675(p);
detailFormatters[675] = (quest: Quest): string => detailFormat(['艦戦破棄: ', '機銃破棄: '], quest);

// 676:	装備開発力の集中整備
class Quest676 extends QuestDestroyItemA {
  max = [3, 3, 1];
  types = [SlotitemType.MediumMainGun, SlotitemType.SecondaryGun, SlotitemType.STContainer];
}
updaterCreators[676] = (p: UpdaterCtorParam) => new Quest676(p);
detailFormatters[676] = (quest: Quest): string => detailFormat(['中口径破棄: ', '副砲破棄: ', 'ドラム缶破棄: '], quest);

// 677:	継戦支援能力の整備
class Quest677 extends QuestDestroyItemA {
  max = [4, 2, 3];
  types = [SlotitemType.LargeMainGun, SlotitemType.RecSeaplane, SlotitemType.Torpedo];
}
updaterCreators[677] = (p: UpdaterCtorParam) => new Quest677(p);
detailFormatters[677] = (quest: Quest): string => detailFormat(['大口径破棄: ', '水偵破棄: ', '魚雷破棄: '], quest);

// 678: 主力艦上戦闘機の更新
class Quest678 extends QuestDestroyItemId {
  max = [3, 5];
  ids = [19, 20];
  fixState(quest: ApiQuest, state: QuestCounter): boolean {
    return false;
  }
}
updaterCreators[678] = (p: UpdaterCtorParam) => new Quest678(p);

// 680:	対空兵装の整備拡充
class Quest680 extends QuestDestroyItemT {
  max = [4, 4];
  types = [SlotitemImgType.kijyu, SlotitemImgType.dentan];
}
updaterCreators[680] = (p: UpdaterCtorParam) => new Quest680(p);
detailFormatters[680] = (quest: Quest): string => detailFormat(['機銃破棄: ', '電探破棄: '], quest);

// 688:	航空戦力の強化
class Quest688 extends QuestDestroyItemA {
  max = [3, 3, 3, 3];
  types = [SlotitemType.Fighter, SlotitemType.DiveBomber, SlotitemType.TorpedoBomber, SlotitemType.RecSeaplane];
}
updaterCreators[688] = (p: UpdaterCtorParam) => new Quest688(p);
detailFormatters[688] = (quest: Quest): string => detailFormat(['破棄 艦戦: ', '艦爆: ', '艦攻: ', '偵察機: '], quest);

// 698: 新鋭対潜哨戒航空戦力の導入
class Quest698 extends QuestDestroyItemId {
  max = [2, 1, 1];
  ids = [256, 18, 52];
  flagship_ids = [646];
  flagship_slotitem_id = 257;
  fixState(quest: ApiQuest, state: QuestCounter): boolean {
    return false;
  }
}
updaterCreators[698] = (p: UpdaterCtorParam) => new Quest698(p);
detailFormatters[698] = (quest: Quest): string => detailFormat(['加賀改二護旗艦 破棄 TBF: ', '流星: ', '流星改: '], quest);

// 702:	艦の「近代化改修」を実施せよ！
class Quest702 extends QuestKaisou {
  max = [2];
}
updaterCreators[702] = (p: UpdaterCtorParam) => new Quest702(p);
detailFormatters[702] = (quest: Quest): string => detailFormat(['近代化改修成功: '], quest);

// 703:	「近代化改修」を進め、戦備を整えよ！
class Quest703 extends QuestKaisou {
  max = [15];
}
updaterCreators[703] = (p: UpdaterCtorParam) => new Quest703(p);
detailFormatters[703] = (quest: Quest): string => detailFormat(['近代化改修成功: '], quest);

// 714:	「駆逐艦」の改修工事を実施せよ！
class Quest714 extends QuestKaisouUseType {
  max = [2];
  powerup_ship_type = ApiShipType.kutikukan;
  use_ship_type: ShipTypeCount = [ ApiShipType.kutikukan, 3];
}
updaterCreators[714] = (p: UpdaterCtorParam) => new Quest714(p);
detailFormatters[714] = (quest: Quest): string => detailFormat(['駆逐艦への駆逐艦3隻使用改修成功: '], quest);

// 715: 続：「駆逐艦」の改修工事を実施せよ！
class Quest715 extends QuestKaisouUseType {
  max = [2];
  powerup_ship_type = ApiShipType.kutikukan;
  use_ship_type: ShipTypeCount = [ ApiShipType.keijyun, 3];
}
updaterCreators[715] = (p: UpdaterCtorParam) => new Quest715(p);
detailFormatters[715] = (quest: Quest): string => detailFormat(['駆逐艦への軽巡3隻使用改修成功: '], quest);

// 822:	沖ノ島海域迎撃戦
class Quest822 extends QuestBattleMap {
  max = [2];
  area_and_rank: QuestMap[] = [ [ 2, 4, 'S' ] ];
}
updaterCreators[822] = (p: UpdaterCtorParam) => new Quest822(p);
detailFormatters[822] = (quest: Quest): string => detailFormat(['2-4S: '], quest);

// 845:	発令！「西方海域作戦」
class Quest845 extends QuestBattleMapDeck {
  max = [1, 1, 1, 1, 1];
  area_and_rank: QuestMap[] = [ [ 4, 1, 'S' ], [ 4, 2, 'S'], [ 4, 3, 'S'], [ 4, 4, 'S'], [ 4, 5, 'S'] ];
  isDeckMatch = null;
}
updaterCreators[845] = (p: UpdaterCtorParam) => new Quest845(p);
detailFormatters[845] = (quest: Quest): string => detailFormatOne(['4-1A:', '4-2A:', '4-3A:', '4-4S:', '4-5S:'], quest);

// 854:	戦果拡張任務！「Z 作戦」前段作戦
class Quest854 extends QuestBattleMapDeck {
  max = [1, 1, 1, 1];
  area_and_rank: QuestMap[] = [ [ 2, 4, 'A' ], [ 6, 1, 'A'], [ 6, 3, 'A'], [ 6, 4, 'S'] ];
  isDeckMatch = null;
}
updaterCreators[854] = (p: UpdaterCtorParam) => new Quest854(p);
detailFormatters[854] = (quest: Quest): string => detailFormatOne(['2-4A:', '6-1A:', '6-3A:', '6-4S:'], quest);

// 861:	強行輸送艦隊、抜錨！
class Quest861 extends QuestBattleMapDeck {
  max = [2];
  area_and_rank: QuestMap[] = [ [ 1, 6, 'B' ] ];
  ship_conds: ShipCond[] = [ 
    [ (mst: MstShip): boolean => 
      mst.api_stype === ApiShipType.koukuu_senkan || mst.api_stype === ApiShipType.hokyuukan, 2, false],
  ];
  isDeckMatch = (ship_ids: number[]) => isDeckShipType(ship_ids, this.ship_conds);
}
updaterCreators[861] = (p: UpdaterCtorParam) => new Quest861(p);
detailFormatters[861] = (quest: Quest): string => detailFormat(['1-6 ゴール: '], quest);

// 862: 前線の航空偵察を実施せよ！
class Quest862 extends QuestBattleMapDeck {
  max = [2];
  area_and_rank: QuestMap[] = [ [ 6, 3, 'A' ] ];
  ship_conds: ShipCond[] = [ 
    [ (mst: MstShip): boolean => mst.api_stype === ApiShipType.suibo, 1, false] ,
    [ (mst: MstShip): boolean => mst.api_stype === ApiShipType.keijyun, 2, false] 
  ];
  isDeckMatch = (ship_ids: number[]) => isDeckShipType(ship_ids, this.ship_conds);
}
updaterCreators[862] = (p: UpdaterCtorParam) => new Quest862(p);
detailFormatters[862] = (quest: Quest): string => detailFormat(['6-3A: '], quest);

// 872:	戦果拡張任務！「Z 作戦」後段作戦
class Quest872 extends QuestBattleMapDeck {
  max = [1, 1, 1, 1];
  area_and_rank: QuestMapOrCell[] = [ [ 7, 2, 'S', [15] ], [ 5, 5, 'S' ], [ 6, 2, 'S' ], [ 6, 5, 'S' ] ];
  isDeckMatch = null;
}
updaterCreators[872] = (p: UpdaterCtorParam) => new Quest872(p);
detailFormatters[872] = (quest: Quest): string => detailFormatOne(['7-2(第2)S:', '5-5S:', '6-2S:', '6-5S:',], quest);

// 873: 北方海域警備を実施せよ！
class Quest873 extends QuestBattleMapDeck {
  max = [1, 1, 1];
  area_and_rank: QuestMap[] = [ [ 3, 1, 'A' ], [ 3, 2, 'A'], [ 3, 3, 'A'] ];
  ship_conds: ShipCond[] = [ 
    [ (mst: MstShip): boolean => mst.api_stype === ApiShipType.keijyun, 1, false] 
  ];
  isDeckMatch = (ship_ids: number[]) => isDeckShipType(ship_ids, this.ship_conds);
}
updaterCreators[873] = (p: UpdaterCtorParam) => new Quest873(p);
detailFormatters[873] = (quest: Quest): string => detailFormatOne(['3-1A:', '3-2A:', '3-3A:'], quest);

// 875:	精鋭「三一駆」、鉄底海域に突入せよ！
class Quest875 extends QuestBattleMapDeck {
  max = [2];
  area_and_rank: QuestMap[] = [ [ 5, 4, 'S' ] ];
  isDeckMatch = ((ship_ids: number[]) => {

    const ships = toShipMsts(ship_ids);

    if (! shipCount(ships, [543])) {
      return false;
    }

    const check_ids = [
      svdata.shipMstIds(345), 
      svdata.shipMstIds(359), 
      svdata.shipMstIds(344), 
    ].flat();
    return 1 <= shipCount(ships, check_ids);
  });
}
updaterCreators[875] = (p: UpdaterCtorParam) => new Quest875(p);
detailFormatters[875] = (quest: Quest): string => detailFormat(['5-4S: '], quest);

// 888:	新編成「三川艦隊」、鉄底海峡に突入せよ！
class Quest888 extends QuestBattleMapDeck {
  max = [1, 1, 1];
  area_and_rank: QuestMap[] = [ [ 5, 1, 'S' ], [ 5, 3, 'S' ], [ 5, 4, 'S' ] ];
  isDeckMatch = ((ship_ids: number[]) => {

    const ships = toShipMsts(ship_ids);
    const check_ids = [
      svdata.shipMstIds(69), 
      svdata.shipMstIds(61), 
      svdata.shipMstIds(123), 
      svdata.shipMstIds(60), 
      svdata.shipMstIds(59), 
      svdata.shipMstIds(51), 
      svdata.shipMstIds(115), 
    ].flat();
    return 4 <= shipCount(ships, check_ids);
  });
}
updaterCreators[888] = (p: UpdaterCtorParam) => new Quest888(p);
detailFormatters[888] = (quest: Quest): string => detailFormatOne(['5-1S:', '5-3S:', '5-4S:'], quest);

// 893:	泊地周辺海域の安全確保を徹底せよ！
class Quest893 extends QuestBattleMapDeck {
  max = [3, 3, 3, 3];
  area_and_rank: QuestMapOrCell[] = [ [1, 5, 'S'], [7, 1, 'S'], [ 7, 2, 'S', [7] ], [ 7, 2, 'S', [15] ] ];
  isDeckMatch = null;
}
updaterCreators[893] = (p: UpdaterCtorParam) => new Quest893(p);
detailFormatters[893] = (quest: Quest): string => detailFormat(['1-5S: ', '7-1S: ', '7-2(第1)S: ','7-2(第2)S: '], quest);

// 894: 空母戦力の投入による兵站線戦闘哨戒
class Quest894 extends QuestBattleMapDeck {
  max = [1, 1, 1, 1, 1];
  area_and_rank: QuestMap[] = [ [ 1, 3, 'S' ], [ 1, 4, 'S'], [ 2, 1, 'S'], [ 2, 2, 'S'], [ 2, 3, 'S'] ];
  ship_conds: ShipCond[] = [ 
    [ (mst: MstShip): boolean => ApiShipType.soukou_kuubo === mst.api_stype || ApiShipType.kei_kuubo === mst.api_stype || ApiShipType.seiki_kuubo === mst.api_stype, 1, false] 
  ];
  isDeckMatch = (ship_ids: number[]) => isDeckShipType(ship_ids, this.ship_conds);
}
updaterCreators[894] = (p: UpdaterCtorParam) => new Quest894(p);
detailFormatters[894] = (quest: Quest): string => detailFormatOne(['1-3S:', '1-4S:', '2-1S:','2-2S:', '2-3S:'], quest);

// 898: 北の海から愛をこめて
class Quest898 extends QuestBattleMapDeck {
  max = [1, 1, 1, 1, 1];
  area_and_rank: QuestMap[] = [ [ 3, 1, 'A' ], [ 3, 2, 'A'], [ 3, 3, 'A'], [ 3, 4, 'A'], [ 3, 5, 'A'] ];
  isDeckMatch = null;
}
updaterCreators[898] = (p: UpdaterCtorParam) => new Quest898(p);
detailFormatters[898] = (quest: Quest): string => detailFormatOne(['3-1A:', '3-2A:', '3-3A:','3-4A:', '3-5A:'], quest);

// 903:	拡張「六水戦」、最前線へ！
class Quest903 extends QuestBattleMapDeck {
  max = [1, 1, 1, 1];
  area_and_rank: QuestMap[] = [ [ 5, 1, 'S' ], [ 5, 4, 'S' ], [ 6, 4, 'S' ], [ 6, 5, 'S' ] ];
  isDeckMatch = ((ship_ids: number[]) => {

    const flag_check_ids = svdata.shipMstIds(622);
    if (! isShipIds(ship_ids[0], flag_check_ids)) {
      return false;     
    }

    const ships = toShipMsts(ship_ids);

    const check1 = (): boolean => {
      return 1 <= shipCount(ships, svdata.shipMstIds(23));
    };
    const check2 = (): boolean => {
      const check_ids = [
        svdata.shipMstIds(1),
        svdata.shipMstIds(2),
        svdata.shipMstIds(164),
        svdata.shipMstIds(165),
        svdata.shipMstIds(30),
        svdata.shipMstIds(31),
      ].flat();  
      return 2 <= shipCount(ships, check_ids);
    };

    return check1() || check2();
  });
}
updaterCreators[903] = (p: UpdaterCtorParam) => new Quest903(p);
detailFormatters[903] = (quest: Quest): string => detailFormatOne(['5-1S:', '5-4S:', '6-4S:','6-5S:'], quest);

// 904:	精鋭「十九駆」、躍り出る！
class Quest904 extends QuestBattleMapDeck {
  max = [1, 1, 1, 1];
  area_and_rank: QuestMap[] = [ [ 2, 5, 'S' ], [ 3, 4, 'S' ], [ 4, 5, 'S' ], [ 5, 3, 'S' ] ];
  isDeckMatch = ((ship_ids: number[]) => {
    const ships = toShipMsts(ship_ids);
    const check_ids = [195, 627];
    return 2 === shipCount(ships, check_ids);
  });
}
updaterCreators[904] = (p: UpdaterCtorParam) => new Quest904(p);
detailFormatters[904] = (quest: Quest): string => detailFormatOne(['2-5S:', '3-4S:', '4-5S:','5-3S:'], quest);

// 905:	「海防艦」、海を護る！
class Quest905 extends QuestBattleMapDeck {
  max = [1, 1, 1, 1, 1];
  area_and_rank: QuestMap[] = [ [ 1, 1, 'A' ], [ 1, 2, 'A' ], [ 1, 3, 'A' ], [ 1, 5, 'A' ], [ 1, 6, 'A' ] ];
  ship_conds: ShipCond[] = [ 
    [ (mst: MstShip): boolean => ApiShipType.kaiboukan === mst.api_stype, 3, false] 
  ];
  isDeckMatch = ((ship_ids: number[]) => {
    if (ship_ids.length > 5) {
      return false;
    }
    return isDeckShipType(ship_ids, this.ship_conds);
  });
}
updaterCreators[905] = (p: UpdaterCtorParam) => new Quest905(p);
detailFormatters[905] = (quest: Quest): string => detailFormatOne(['1-1A:', '1-2A:', '1-3A:', '1-5A:', '1-6:'], quest);

// 912:	工作艦「明石」護衛任務
class Quest912 extends QuestBattleMapDeck {
  max = [1, 1, 1, 1, 1];
  area_and_rank: QuestMap[] = [ [ 1, 3, 'A' ], [ 2, 1, 'A' ], [ 2, 2, 'A' ], [ 2, 3, 'A' ], [ 1, 6, 'A' ] ];
  ship_conds: ShipCond[] = [ 
    [ (mst: MstShip): boolean => ApiShipType.kutikukan === mst.api_stype, 3, false] 
  ];
  isDeckMatch = ((ship_ids: number[]) => {
    const flag_check_ids = svdata.shipMstIds(182);
    if (! isShipIds(ship_ids[0], flag_check_ids)) {
      return false;     
    }
    return isDeckShipType(ship_ids, this.ship_conds);
  });
}
updaterCreators[912] = (p: UpdaterCtorParam) => new Quest912(p);
detailFormatters[912] = (quest: Quest): string => detailFormatOne(['1-3A:', '2-1A:', '2-2A:', '2-3A:', '1-6:'], quest);

// 914:	重巡戦隊、西へ！
class Quest914 extends QuestBattleMapDeck {
  max = [1, 1, 1, 1];
  area_and_rank: QuestMap[] = [ [ 4, 1, 'A' ], [ 4, 2, 'A' ], [ 4, 3, 'A' ], [ 4, 4, 'A' ] ];
  ship_conds: ShipCond[] = [ 
    [ (mst: MstShip): boolean => ApiShipType.jyuujyun === mst.api_stype, 3, false],
    [ (mst: MstShip): boolean => ApiShipType.kutikukan === mst.api_stype, 1, false] 
  ];
  isDeckMatch = ((ship_ids: number[]) => isDeckShipType(ship_ids, this.ship_conds));
}
updaterCreators[914] = (p: UpdaterCtorParam) => new Quest914(p);
detailFormatters[914] = (quest: Quest): string => detailFormatOne(['4-1A:', '4-2A:', '4-3A:', '4-4A:'], quest);

// 928:	歴戦「第十方面艦隊」、全力出撃！
class Quest928 extends QuestBattleMapDeck {
  max = [2, 2, 2];
  area_and_rank: QuestMapOrCell[] = [ [ 7, 3, 'S', [18, 23, 24 ,25] ], [ 7, 2, 'S', [15] ], [ 4, 2, 'S' ] ];
  isDeckMatch = ((ship_ids: number[]) => {
    const ships = toShipMsts(ship_ids);
    const check_ids = [
      svdata.shipMstIds(65),
      svdata.shipMstIds(64),
      svdata.shipMstIds(62),
      svdata.shipMstIds(66),
      svdata.shipMstIds(471),
    ].flat();
    return shipCount(ships, check_ids) >= 2;
  });
}
updaterCreators[928] = (p: UpdaterCtorParam) => new Quest928(p);
detailFormatters[928] = (quest: Quest): string => detailFormat(['7-3S(第2): ', '7-2S(第2): ', '4-2S: '], quest);

// 931: 精鋭「二七駆」、回避運動は気をつけて
class Quest931 extends QuestBattleMapDeck {
  max = [1, 1, 1, 1, 1];
  area_and_rank: QuestMap[] = [ [ 1, 5, 'S' ], [ 2, 5, 'S' ], [ 7, 1, 'S' ], [ 5, 5, 'S' ], [ 6, 3, 'S' ] ];
  isDeckMatch = ((ship_ids: number[]) => {
    const check_ids = [
      svdata.shipMstIds(471),
      svdata.shipMstIds(145),
    ].flat();
    return shipCount(toShipMsts(ship_ids), check_ids) == 2;
  });
}
updaterCreators[931] = (p: UpdaterCtorParam) => new Quest931(p);
detailFormatters[931] = (quest: Quest): string => detailFormatOne(['1-5S:', '2-5S:', '7-1S:', '5-5S:', '6-3S:'], quest);

// 933:【艦隊司令部強化】艦隊旗艦、出撃せよ！
class Quest933 extends QuestBattleMapDeck {
  max = [2, 2, 2, 2];
  area_and_rank: QuestMap[] = [ [ 1, 3, 'S' ], [ 1, 4, 'S' ], [ 2, 1, 'S' ], [ 2, 2, 'S' ] ];
  isDeckMatch = ((ship_ids: number[]) => {
    const ooyodo = isShipIds(ship_ids[0], svdata.shipMstIds(183));
    const danyang = isShipIds(ship_ids[0], [651]);
    if (! (ooyodo || danyang)) {
      return false;
    }

    const ships = toShipMsts(ship_ids);
    const kaibou = shipTypeCount(ships, [ApiShipType.kaiboukan]);
    if (kaibou >= 3) {
      return true;
    }
    let kutiku = shipTypeCount(ships, [ApiShipType.kutikukan]);
    if (danyang) {
      --kutiku;
    }
    if (kutiku >= 3) {
      return true;
    }
    return false;
  });
}
updaterCreators[933] = (p: UpdaterCtorParam) => new Quest933(p);
detailFormatters[933] = (quest: Quest): string => detailFormatOne(['1-3S:', '1-4S:', '2-1S:', '2-2S:'], quest);

// 934: 奇跡の駆逐艦「雪風」、再び出撃す！
class Quest934 extends QuestBattleMapDeck {
  max = [1, 1, 1, 1, 1];
  area_and_rank: QuestMapOrCell[] = [ [ 2, 3, 'S' ], [ 2, 4, 'S' ], [ 2, 5, 'S' ], [ 3, 3, 'S' ], [ 7, 3, 'S', [18, 23, 24 ,25] ] ];
  isDeckMatch = ((ship_ids: number[]) => isShipIds(ship_ids[0], [651, 656]));
}
updaterCreators[934] = (p: UpdaterCtorParam) => new Quest934(p);
detailFormatters[934] = (quest: Quest): string => detailFormatOne(['2-3S:', '2-4S:', '2-5S:', '3-3S:', '7-3S(第2):'], quest);

// 935:	最精強！「呉の雪風」「佐世保の時雨」
class Quest935 extends QuestBattleMapDeck {
  max = [1, 1, 1, 1, 1];
  area_and_rank: QuestMap[] = [ [ 5, 3, 'S' ], [ 5, 5, 'S' ], [ 4, 5, 'S' ], [ 6, 4, 'S' ], [ 6, 5, 'S' ] ];
  isDeckMatch = ((ship_ids: number[]) => 2 === shipCount(toShipMsts(ship_ids), [145, 656]));
}
updaterCreators[935] = (p: UpdaterCtorParam) => new Quest935(p);
detailFormatters[935] = (quest: Quest): string => detailFormatOne(['5-3S:', '5-5S:', '4-5S:', '6-4S:', '6-5S:'], quest);

/**
 * 
 * @param db 
 * @param quest 
 * @param cb 
 * @param record 
 */
const createQuestUpdater = (db: NeDB, quest: ApiQuest, updated: UpdatedCallback, record: Quest | undefined = undefined): QuestUpdater | undefined | null => {

  // completed
  if (quest.api_state === ApiQuestState.completed) {
    return null;
  }

  // create updater
  const creator = updaterCreators[quest.api_no];
  if (! creator) {
    return ;
  }
  const updater: QuestUpdater = creator({db, quest, updated});

  // not api data
  if (record) {
    if (! record.state) {
      record.state = updater.newState(quest);
    }
    updater.record = record;
    updater.fixState(quest, record.state);
    updater.tmpRecord = Object.assign({}, record.state);
    updater.setCallback();
  }

  return updater;
};

export const questProgressDetailFormat = (quest: Quest): string => {
  if (quest.state) {
    if (isQuestCounter(quest.state)) {
      const state = quest.state as QuestCounter;
      const formatter = detailFormatters[quest.no];
      if (formatter) {
        return formatter(quest);
      }

      return state.count.reduce<string[]>((acc, el, index) => {
        acc.push(`${el}/${state.countMax[index]}`);
        return acc;
      }, []).join(' ');
      // return `${state.count[0]}/${state.countMax[0]}`;
    }
  }

  return '';
};
