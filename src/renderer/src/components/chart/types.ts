import { AggregateShipType } from "@common/calc_record"

export interface PieData {
  name: string
  y: number
}

export interface ShipTypePieData extends PieData {
  type: AggregateShipType
}
