import {
  Api,
  ApiCallback,
  ApiCreateItemWithParam,
  ApiCreateShipWithParam,
  ApiRemodelSlotWithParam,
  ApiMapStart,
  ApiMapNext,
  ApiMap,
  ApiMissionResult,
  ApiQuestList,
  PrvBattleInfo,
  KcsUtil,
  ApiQuestState,
} from '@/lib/kcs'
import {
  RecordUtil, 
  BattleRecord, 
  Quest, 
} from '@/lib/record'
import { QuestUpdater } from '@/lib/kcquest';
import NeDB from 'nedb';
import path from 'path';
import { svdata } from '@/main/svdata';
import { PathStuff } from '@/main/path';

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

type QuestUpdated = () => void;

/**
 * 
 */
export class KcRecord {

  private portDB: NeDB;
  private dropDB: NeDB;
  private battleDB: NeDB;
  private itemgetDB: NeDB;
  private itemDB: NeDB;
  private shipDB: NeDB;
  private remodelDB: NeDB;
  private missionDB: NeDB;
  private questDB: NeDB;
  private port_api_id: number = 0;
  private quest_updaters: QuestUpdater[] = [];
  private questlist_called: boolean = false;
  private cbQuestUpdated: QuestUpdated;
  private tmp_quests: Quest[] = [];

  private constructor(user_dir: string, cbQuestUpdated: QuestUpdated) {
    this.cbQuestUpdated = cbQuestUpdated;
    this.portDB = new NeDB({
      filename: path.join(user_dir, 'port.db')
    });
    this.dropDB = new NeDB({
      filename: path.join(user_dir, 'drop.db')
    });
    this.battleDB = new NeDB({
      filename: path.join(user_dir, 'battle.db')
    });
    this.itemgetDB = new NeDB({
      filename: path.join(user_dir, 'itemget.db')
    });
    this.itemDB = new NeDB({
      filename: path.join(user_dir, 'item.db')
    });
    this.shipDB = new NeDB({
      filename: path.join(user_dir, 'ship.db')
    });
    this.remodelDB = new NeDB({
      filename: path.join(user_dir, 'remodel.db')
    });
    this.missionDB = new NeDB({
      filename: path.join(user_dir, 'mission.db')
    });
    this.questDB = new NeDB({
      filename: path.join(user_dir, 'quest.db')
    });
  }

  private load(): boolean {

    let ret = true;
    const ErrorHandler = (err: Error | null): void => {
      if (err) {
        console.log(err);
        ret = false;
      }
    };

    // load db
    this.portDB.loadDatabase(ErrorHandler);
    this.dropDB.loadDatabase(ErrorHandler);
    this.battleDB.loadDatabase(ErrorHandler);
    this.itemgetDB.loadDatabase(ErrorHandler);
    this.itemDB.loadDatabase(ErrorHandler);
    this.shipDB.loadDatabase(ErrorHandler);
    this.remodelDB.loadDatabase(ErrorHandler);
    this.missionDB.loadDatabase(ErrorHandler);
    this.questDB.loadDatabase((err: Error | null) => {
      ErrorHandler(err);
      if (! err) {
        this.questDB.persistence.compactDatafile();
      }
    });

    return ret;
  }

  private regCallback(): void {
    this.port_api_id = ApiCallback.set([Api.PORT_PORT, () => this.portPort()]);
    ApiCallback.set([Api.REQ_SORTIE_BATTLERESULT, (arg: PrvBattleInfo) => this.sortieBattleResult(arg)]);
    ApiCallback.set([Api.REQ_COMBINED_BATTLE_BATTLERESULT, (arg: PrvBattleInfo) => this.combinedBattleResult(arg)]);
    ApiCallback.set([Api.REQ_KOUSYOU_CREATEITEM, (arg: ApiCreateItemWithParam) => this.createItem(arg)]);
    ApiCallback.set([Api.REQ_KOUSYOU_CREATESHIP, (arg: ApiCreateShipWithParam) => this.createShip(arg)]);
    ApiCallback.set([Api.REQ_KOUSYOU_REMODEL_SLOT, (arg: ApiRemodelSlotWithParam) => this.remodelSlot(arg)]);
    ApiCallback.set([Api.REQ_MAP_START, (arg: ApiMapStart) => this.mapStart(arg)]);
    ApiCallback.set([Api.REQ_MAP_NEXT, (arg: ApiMapNext) => this.mapNext(arg)]);
    ApiCallback.set([Api.REQ_MISSION_RESULT, (arg: ApiMissionResult) => this.missionResult(arg)]);
    ApiCallback.set([Api.GET_MEMBER_QUESTLIST, (arg: ApiQuestList) => this.onApiQuestList(arg)]);
  }

  private loadQuest(): void {
    QuestUpdater.load(this.questDB, (record: Quest): void => {
      if (! svdata.questlist) {
        
        const questUpdated = (updater: QuestUpdater): void => {
          this.questUpdated(updater);
        };

        const updater = QuestUpdater.create(this.questDB, record.quest, questUpdated, record);
        if (updater) {

          // check validate
          if (record.dateKey === updater.dateKey()) {
            this.quest_updaters.push(updater);
            this.questUpdated(updater);
          }
        } else {
          if (QuestUpdater.isValidNotSupportQuest(record)) {
            this.tmp_quests.push(record);
          }
        }
      }
    });
  }

  public static init(cbQuestUpdated: QuestUpdated): KcRecord | null {

    const kcrecord = new KcRecord(PathStuff.storePathUser, cbQuestUpdated);
    if (kcrecord.load()) {
      kcrecord.regCallback();

      // read quest record
      kcrecord.loadQuest();

      return kcrecord;
    }

    return null;
  }

  private portPort(): void {
    if (this.port_api_id) {
      ApiCallback.unset(this.port_api_id);
      this.port_api_id = 0;
    }
  
    // first record port
    process.nextTick(() => {
      this.portReport();
    });
  
    // 60*5s record port
    this.portReportSet();
  }

  private portReportSet(): void {
    const reportMinutes = 30;
    const now = new Date();
    const msecnext = (reportMinutes - (now.getMinutes() % reportMinutes)) * 60000 - now.getSeconds() * 1000 - now.getMilliseconds();
    setTimeout(() => {
      this.portReport();
      this.portReportSet();
    }, msecnext);
  }
  
  private portReport(): void {
    console.log('port record to', Date.now());
    const record = RecordUtil.toPortRecord(svdata);
    if (record) {
      console.log('port record >>', Date.now());
      this.portDB.insert(record, (err, newDoc) => {
        handleDBErr(err, newDoc);
        console.log('port record inserted', Date.now());
      });
      console.log('port record <<', Date.now());
    }
  }
  
  /**
   * 
   */
  public portRecord(): void {
    this.portReport();
  }

  private itemgetReport(arg: ApiMap): void {
    console.log('itemget record >>', Date.now());
    const record = RecordUtil.toItemGetRecord(svdata, arg);
    console.log('itemget record <<', Date.now(), record !== undefined);
    if (record) {
      this.itemgetDB.insert(record, (err, newDoc) => {
        handleDBErr(err, newDoc);
      });
    }
  }

  private mapStart(arg: ApiMapStart): void {
    this.itemgetReport(arg);
  }
  
  private mapNext(arg: ApiMapNext): void {
    this.itemgetReport(arg);
  }

  private battleResult(arg: PrvBattleInfo): void {
    const drop = RecordUtil.toDropRecord(svdata, arg);
    if (drop) {
      this.dropDB.insert(drop, (err, newDoc) => {
        handleDBErr(err, newDoc);
      });
  
      const battle = RecordUtil.toBattleRecord(svdata, arg, drop);
      if (battle) {
        this.battleDB.insert(battle, handleDBErr);
      }
    }
  }
  
  private sortieBattleResult(arg: PrvBattleInfo): void {
    this.battleResult(arg);
  }
  
  private combinedBattleResult(arg: PrvBattleInfo): void {
    this.battleResult(arg);
  }
  
  private createItem(arg: ApiCreateItemWithParam): void {
    const record = RecordUtil.toItemRecord(svdata, arg);
    if (record) {
      this.itemDB.insert(record, handleDBErr);
    }
  }
  
  private createShip(arg: ApiCreateShipWithParam): void {
    const record = RecordUtil.toShipRecord(svdata, arg);
    if (record) {
      this.shipDB.insert(record, handleDBErr);
    }
  }
  
  private remodelSlot(arg: ApiRemodelSlotWithParam): void {
    const record = RecordUtil.toRemodelRecord(svdata, arg);
    if (record) {
      this.remodelDB.insert(record, handleDBErr);
    }
  }
  
  private missionResult(arg: ApiMissionResult): void {
    const record = RecordUtil.toMissionRecord(svdata, arg);
    if (record) {
      this.missionDB.insert(record, handleDBErr);
    }
  }

  private questUpdated(updater: QuestUpdater): void {
    console.log('updated quest updater', JSON.stringify(updater.record));
    this.cbQuestUpdated();
  }

  public get quests(): Quest[] {

    if (! svdata.questlist) {
      console.log('quest list not getted');
      //console.log(this.quest_updaters.map(el => el.record));
      //console.log(' -- ');
      //console.log(this.tmp_quests);
      const ret: Quest[] = this.tmp_quests.slice();
      this.quest_updaters.forEach(el => ret.push(el.record!));
      ret.sort((a, b) => a.no - b.no);
      return ret;
    }

    const quests = KcsUtil.questlistInProgress(svdata.questlist);
    return quests.map((quest) => {
      
      // find updater
      const updater = this.quest_updaters.find(updater => updater.record?.no === quest.api_no);
      if (updater) {
        console.log('updater finded:', quest.api_no)
        return updater.record!;
      }

      console.log('updater not finded:', quest.api_no)
      return {
        no: quest.api_no,
        dateKey: '',
        date: '',
        quest,
        state: null,
      }
    });
  }

  private onApiQuestList(arg: ApiQuestList): void {
    this.questDB.persistence.compactDatafile();

    // get in progress quest
    const progress_quests = KcsUtil.questlistInProgress(arg).filter(el => el.api_state !== ApiQuestState.completed);

    // remove not selected
    this.quest_updaters = this.quest_updaters.filter(el => {
      if (! progress_quests.find(quest => quest.api_no === el.quest.api_no)) {
        el.unsetCallback();
        return false;
      }
      return true;
    });
    
    this.questlist_called = true;

    const questUpdated = (updater: QuestUpdater): void => {
      this.questUpdated(updater);
    };

    progress_quests.forEach(quest => {
        const updater = QuestUpdater.create(this.questDB, quest, questUpdated);
        if (updater) {

          const index = this.quest_updaters.findIndex(el => el.quest.api_no === quest.api_no);
          if (index === -1 || (this.quest_updaters[index].dateKey() !== updater.dateKey())) {
            if (index !== -1) {
              this.quest_updaters[index].unsetCallback();
              this.quest_updaters[index] = updater;
            } else {
              this.quest_updaters.push(updater);
            }

            updater.insert();
          } else {
            const loaded_updater = this.quest_updaters[index];
            loaded_updater.apiData = true;
            loaded_updater.quest = quest;
            loaded_updater.fixState(quest, loaded_updater.record!.state);
            loaded_updater.update(false);
          }
        } else {
          QuestUpdater.insertNotSupportQuest(this.questDB, quest);
        }
      });

    // save in progress quest
    QuestUpdater.updateNos(this.questDB, progress_quests.map(quest => quest.api_no));

    this.cbQuestUpdated();
 }
  
  /**
   * 
   */
  public async findLastBattle(): Promise<BattleRecord[]> {
    return new Promise<BattleRecord[]>((resolve, reject) => {
      this.battleDB.find<BattleRecord>({})
        .limit(10)
        .sort({'date': -1})
        .exec((err, docs: BattleRecord[]): void => {
          if (err) {
            reject(err);
          } else {
            resolve(docs);
          }
        });
    });
  }

  /*
  const getDrop = (): DropRecord[] => {
    dropDB.find({}, (err: Error, docs: DropRecord[]) => {
      if (err) {
        console.log(err);
      } else {
        console.log(docs[0]);
      }
    });
    return [];
  };
  */
}
