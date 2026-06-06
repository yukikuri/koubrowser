import { drop, dropResponse, type DropData, type DropItem } from "@main/orval/generated/kc-intake";
import { DropRecord } from "@common/record";
import { svdata } from '@main/svdata'
import { Env } from "@common/env";

/////////////////////////////////////////////////////////////////////////////////////
// debug
const DEBUG = false;

const debug = (...args: any[]) => {
  if (DEBUG) console.info("[Intake]", ...args);
};

/////////////////////////////////////////////////////////////////////////////////////

const toISOForDt = (dt: string): string =>{
  const d = new Date(dt);
  d.setMilliseconds(0);
  return d.toISOString().replace(".000Z", "Z");
}

const getItemOwnCount = (id: number): number => {
  const founded = svdata.useitems.find(item => item.api_id === id);
  return founded?.api_count ?? 0;
}

const toDropItem = (record: DropRecord): DropItem => {
  return {
    id: record.itemId,
    ocnt: getItemOwnCount(record.itemId),
  }
}

function toDropData(record: DropRecord): DropData {
  return {
    v: 1,
    mid: record.mapId,
    cno: record.cellId,
    efm: record.enemyFormation as DropData["efm"],
    mlv: record.mapLv as DropData["mlv"],
    sid: record.shipId,
    ocnt: record.shipCounts.reduce((sum, cur) => sum + cur, 0),
    rank: record.rank as DropData["rank"],
    es1: record.enemyShips1,
    es2: record.enemyShips2,
    dt: toISOForDt(record.date),
    srv: svdata.serverId.toString(),
    its: record.itemId > 0 ? [toDropItem(record)] : undefined,
  };
}

/**
 * ドロップ情報取込クラス
 */
export class Intaker {

  static datas: DropData[] = [];
  static intaking: DropData[] = [];
  static readonly maxCount = 40;
  static readonly maxRetry = 3;
  static counter = 0;
  static readonly intakeIntervalMs = Env.isTestMode ? 5 * 1000 : 30 * 60 * 1000; // 30 minute
  static readonly intakeRetryIntervalMs = 10 * 1000; // 10 second
  static isfailureState = false;
  static onQuitPerformed = false;
  static isEnabled = true;

  private static get intervalMs(): number {
    if (this.isfailureState) {
      return this.intakeIntervalMs * 2;
    }
    return this.intakeIntervalMs;
  }

  static addDropData(data: DropRecord): void {
    debug('add intake drop data. length:', this.datas.length, 'enable:', this.isEnabled);
    if (!this.isEnabled) {
      return;
    }
    this.datas.push(toDropData(data));
    debug('add intake drop data. length:', this.datas.length);
  }

  static setEnabled(enabled: boolean): void {
    const changed = this.isEnabled !== enabled;
    this.isEnabled = enabled;
    debug('set enable.', 'enable:', Intaker.isEnabled, 'arg:', enabled, 'changed:', changed);
    if (!enabled) {
      this.clearDropData();
      return;
    }
    if (changed && !this.onQuitPerformed) {
      this.setIntakeSchedule();
    }
  }

  static clearDropData(): void {
    this.datas = [];
    this.intaking = [];
    this.counter = 0;
    this.isfailureState = false;
  }

  private static retry(): boolean {

    if (this.isfailureState) {
      debug('Intaker is in failure state. skip retry.');
      return false;
    }

    // retry
    this.counter++;
    if (this.counter < this.maxRetry) {
      setTimeout(() => {
        debug(`Intaker retry dropData... attempt #${this.counter}, ${new Date()}`);
        this.doIntakeDrop();
      }, this.intakeRetryIntervalMs);

      // retried
      return true;
    }

    // no retry
    // 状態を障害に設定、インターバルとリトライ回数を制限する
    this.isfailureState = true;
    return false;
  }

  private static doIntakeDrop(): void {

    if (this.onQuitPerformed) {
      debug('Intaker on quit performed. skip doIntakeDrop.');
      return;
    }

    if (!this.isEnabled) {
      this.clearDropData();
      debug('Intaker disabled. skip doIntakeDrop.');
      return;
    }

    drop(this.intaking).then((responses: dropResponse) => {
      debug('Intaker dropData responses status:', responses.status);

      if (responses.status >= 500) {

        // retry
        if (this.retry()) {
          return;
        }

        debug('Intaker dropData reached max retry. ' + new Date());

        // サーバエラーでは情報元に戻し再スケジュールでもう一度処理する
        this.datas.unshift(...this.intaking);
        this.intaking = [];

        // reschedule
        this.setIntakeSchedule();

      } else {
        // clear datas on success or client error
        // client error: invalid data...
        // clear failure state
        this.isfailureState = false;
        this.intaking = [];

        // reschedule
        this.setIntakeSchedule();
      }
    }).catch((error: any) => {
      // network or other error
      debug('Intaker dropData error:', error);

      // retry
      if (this.retry()) {
        return;
      }

      debug('Intaker dropData reached max retry on error. ' + new Date());

      // サーバ接続NGでは情報元に戻し再スケジュールでもう一度処理する
      this.datas.unshift(...this.intaking);
      this.intaking = [];

      // reschedule
      this.setIntakeSchedule();
    });
  }

  static setIntakeSchedule(): void {
    setTimeout(() => {
      if (!this.isEnabled) {
        this.clearDropData();
        return;
      }
      debug('sendintaker. length1:', this.datas.length)
      if (this.datas.length > 0) {
        this.counter = 0;
        this.intaking = this.datas.splice(0, this.maxCount);
        debug('sendintaker. length2:', this.datas.length)
        this.doIntakeDrop();
      } else {
        // reschedule
        this.setIntakeSchedule();
      }
    }, this.intervalMs);
  }

  static doIntakeDropOnQuit() : Promise<void> {
    this.onQuitPerformed = true;

    // 終了時の送信は、すべてではなく最大数分だけ送信する
    // すべて送信できない場合、サーバ障害時が発生している
    return new Promise((resolve) => {
      if (!this.isEnabled) {
        this.clearDropData();
        resolve();
        return;
      }
      debug('sendintaker on quit. length:', this.datas.length, 'max:', this.maxCount);
      if (this.datas.length > 0) {
        this.intaking = this.datas.splice(0, this.maxCount);
        drop(this.intaking).then((responses: dropResponse) => {
          debug('Intaker dropData responses status on quit:', responses.status);
          resolve();
        }).catch((error: any) => {
          debug('Intaker dropData error on quit:', error);
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}
