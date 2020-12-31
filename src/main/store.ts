import { MapStuff } from '@/lib/map';
import path from 'path';
import fs from 'fs';
import { PathStuff } from '@/main/path';

/**
 * 
 */
interface AirbaseSpot {
  readonly area_id: number;
  readonly area_no: number;
  spots: [[string, string], [string, string], [string, string]];
}

class AirbaseSpotStore {
  spots: AirbaseSpot[] = [];
  loaded: boolean = false;

  private get storePath(): string {
    return path.join(PathStuff.storePathUser, 'airbase_spots.json');
  }

  private load_(): void {
    if (! this.loaded) {
      this.loaded = true;
      const filepath = this.storePath;
      if (fs.existsSync(filepath)) {
        try {
         const spots = JSON.parse(fs.readFileSync(filepath, 'utf8'));
         this.spots = spots;
        } catch(err: any) {
          console.error(err);
        }
      }
    }
  }

  private save_(): void {
    fs.writeFile(this.storePath, JSON.stringify(this.spots, undefined, ' '), 'utf8', (err: Error | null) => {
      if (err) {
        console.error(err);
      }
    });
  }

  public getSpots(area_id: number, area_no: number): [[string, string], [string, string], [string, string]] {
    this.load_();

    const finded = this.spots.find(el => el.area_id === area_id && el.area_no === area_no);
    if (finded) {
      return finded.spots;
    }

    const cell_info = MapStuff.cellInfo(area_id, area_no);
    const boss = MapStuff.findBossSpot(cell_info);
    if (boss) {
      const spot: [string, string] = [boss.label, boss.label];
      return [spot, spot, spot];
    }

    const spot: [string, string] = [ '-', '-'];
    return [spot, spot, spot];
  }

  public setSpots(area_id: number, area_no: number, spots: [[string, string], [string, string], [string, string]]): void {
    this.load_();

    const finded = this.spots.find(el => el.area_id === area_id && el.area_no === area_no);
    if (finded) {
      finded.spots = spots;
    } else {
      this.spots.push({area_id, area_no, spots});
    }

    this.save_();
  }
}

export const airbaseSpotStore = new AirbaseSpotStore();
