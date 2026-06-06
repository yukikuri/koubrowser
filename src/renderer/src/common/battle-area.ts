import { BattleRecord } from "@common/record";

export interface BattleAreaInfo {
  areaId: number;
  areaNo: number;
  records: BattleRecord[];
}
