import path from 'path';
import fs from 'fs';
import { svdata } from '@/main/svdata';

const store_dirname = 'store';
const capture_dirname = 'capture'; 

/**
 * 
 */
export class PathStuff {

  /**
   * 
   */
  public static createStoreDir(): void {
    const store = this.storePathExe;
    if (!fs.existsSync(store)) {
      fs.mkdirSync(store);
    }

    const user = this.storePathUser;
    if (!fs.existsSync(user)) {
      fs.mkdirSync(user);
    }

  }

  /**
   * 
   */
  public static get storePathExe(): string {
    //return path.join(__dirname, dirname);
    return path.join(__dirname, '..', store_dirname);
  }

  /**
   * 
   */
  public static capturePathExe(createIf: boolean): string {
    //return path.join(__dirname, dirname);
    const ret = path.join(__dirname, '..', capture_dirname);
    if (createIf && !fs.existsSync(ret)) {
      fs.mkdirSync(ret);
    }

    return ret;
  }

  /**
   * 
   */
  public static get storePathUser(): string {
    return path.join(this.storePathExe, svdata.serverId + '_' + svdata.basic.api_member_id);
  }

}
