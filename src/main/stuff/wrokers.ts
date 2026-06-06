import { WorkerDriver } from "@main/worker/driver";

// singleton worker driver
let workerDriver: WorkerDriver | undefined = undefined

// singleton worker driver for quest
let workerDriverQuest: WorkerDriver | undefined = undefined

/**
 * 
 * @param appDir 
 */
export function start(appDir: string) {

  // singleton worker driver
  workerDriver = new WorkerDriver(appDir);

  // singleton worker driver for quest
  // クエストDB worker は他DB worker と分けて管理する
  // 他DBのサイズが大となる傾向があることから他DB読み込み時間の影響を避けるため
  workerDriverQuest = new WorkerDriver(appDir);
}

/**
 * 
 * @returns 
 */
export function getWorkerDriver(): WorkerDriver {
  if (! workerDriver) {
    throw new Error('WorkerDriver not started')
  }
  return workerDriver;
}

/**
 * 
 * @returns 
 */
export function getWorkerDriverQuest(): WorkerDriver {
  if (! workerDriverQuest) {
    throw new Error('WorkerDriverQuest not started')
  }
  return workerDriverQuest;
}

/**
 * 
 * @returns 
 */
export async function shutdown() {
  const tasks: Promise<unknown>[] = [];

  if (workerDriver) {
    tasks.push(workerDriver.shutdown());
    workerDriver = undefined;
  }

  if (workerDriverQuest) {
    tasks.push(workerDriverQuest.shutdown());
    workerDriverQuest = undefined;
  }

  return Promise.all(tasks);
}

