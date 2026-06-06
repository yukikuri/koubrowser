import { MapLv } from "@common/kcs";

export interface DropShipMapInfo {
  area_id: number;
  area_no: number;
  map_lv: MapLv
  cell_no: number;
  cell_label?: string;
  is_boss: boolean;
  hilight_ship_id: number;
}
