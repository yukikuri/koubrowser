import {
  MapAreaId,
  ApiMissionClearResult,
  ApiDeckPort,
  SvData,
  ApiShipType,
  ShipInfo,
  KcsUtil,
  SlotitemType,
  Slot,
  ApiMissionId,
  MstSlotitem,
  SlotitemImgType,
  ApiItemId
} from '@common/kcs'

export const AreaName = {
  Area1: 'Area1', // 鎮守府海域
  Area2: 'Area2', // 南西諸島海域
  Area3: 'Area3', // 北方海域
  Area4: 'Area4', // 西方海域
  Area5: 'Area5', // 南方海域
  Area6: 'Area6', // 南西海域
  Area7: 'Area7' // 中部海域
}
export type AreaName = (typeof AreaName)[keyof typeof AreaName]

export const MissionId = {
  // area1 鎮守府海域
  Id01: '01',
  Id02: '02',
  Id03: '03',
  Id04: '04',
  Id05: '05',
  Id06: '06',
  Id07: '07',
  Id08: '08',
  IdA1: 'A1',
  IdA2: 'A2',
  IdA3: 'A3',
  IdA4: 'A4',
  IdA5: 'A5',
  IdA6: 'A6',

  // area2 南西諸島海域
  Id09: '09',
  Id10: '10',
  Id11: '11',
  Id12: '12',
  Id13: '13',
  Id14: '14',
  Id15: '15',
  Id16: '16',
  IdB1: 'B1',
  IdB2: 'B2',
  IdB3: 'B3',
  IdB4: 'B4',
  IdB5: 'B5',
  IdB6: 'B6',

  // area3 北方海域
  Id17: '17',
  Id18: '18',
  Id19: '19',
  Id20: '20',
  Id21: '21',
  Id22: '22',
  Id23: '23',
  Id24: '24',

  // area4 西方海域
  Id25: '25',
  Id26: '26',
  Id27: '27',
  Id28: '28',
  Id29: '29',
  Id30: '30',
  Id31: '31',
  Id32: '32',
  IdD1: 'D1',
  IdD2: 'D2',
  IdD3: 'D3',

  // area5 南方海域
  Id33: '33',
  Id34: '34',
  Id35: '35',
  Id36: '36',
  Id37: '37',
  Id38: '38',
  Id39: '39',
  Id40: '40',
  IdE1: 'E1',
  IdE2: 'E2',

  // area6 南西海域
  Id41: '41',
  Id42: '42',
  Id43: '43',
  Id44: '44',
  Id45: '45',
  Id46: '46'
} as const
export type MissionId = (typeof MissionId)[keyof typeof MissionId]

export const AreaMissionMap: Map<AreaName, MissionId[]> = new Map([
  [
    AreaName.Area1,
    [
      MissionId.Id01,
      MissionId.Id02,
      MissionId.Id03,
      MissionId.Id04,
      MissionId.Id05,
      MissionId.Id06,
      MissionId.Id07,
      MissionId.Id08,
      MissionId.IdA1,
      MissionId.IdA2,
      MissionId.IdA3,
      MissionId.IdA4,
      MissionId.IdA5,
      MissionId.IdA6
    ]
  ],

  [
    AreaName.Area2,
    [
      MissionId.Id09,
      MissionId.Id10,
      MissionId.Id11,
      MissionId.Id12,
      MissionId.Id13,
      MissionId.Id14,
      MissionId.Id15,
      MissionId.Id16,
      MissionId.IdB1,
      MissionId.IdB2,
      MissionId.IdB3,
      MissionId.IdB4,
      MissionId.IdB5,
      MissionId.IdB6
    ]
  ],

  [
    AreaName.Area3,
    [
      MissionId.Id17,
      MissionId.Id18,
      MissionId.Id19,
      MissionId.Id20,
      MissionId.Id21,
      MissionId.Id22,
      MissionId.Id23,
      MissionId.Id24
    ]
  ],

  [
    AreaName.Area4,
    [
      MissionId.Id25,
      MissionId.Id26,
      MissionId.Id27,
      MissionId.Id28,
      MissionId.Id29,
      MissionId.Id30,
      MissionId.Id31,
      MissionId.Id32,
      MissionId.IdD1,
      MissionId.IdD2,
      MissionId.IdD3
    ]
  ],

  [
    AreaName.Area5,
    [
      MissionId.Id33,
      MissionId.Id34,
      MissionId.Id35,
      MissionId.Id36,
      MissionId.Id37,
      MissionId.Id38,
      MissionId.Id39,
      MissionId.Id40,
      MissionId.IdE1,
      MissionId.IdE2
    ]
  ],

  [
    AreaName.Area6,
    [MissionId.Id41, MissionId.Id42, MissionId.Id43, MissionId.Id44, MissionId.Id45, MissionId.Id46]
  ]
])

export const MissionResult = {
  invalid: 'invalid', // チェックできなかった
  failed: 'failed', // 失敗
  succeeded: 'succeeded', // 成功
  succeeded2: 'succeeded2' // 確定大成功
} as const
export type MissionResult = (typeof MissionResult)[keyof typeof MissionResult]

const MissionResultText = {
  failed: '失敗',
  succeeded: '成功',
  succeeded2: '大成功'
}
export type MissionResultText = (typeof MissionResultText)[keyof typeof MissionResultText]

export interface MissionConstBase {
  id: MissionId
  mapAreaId: MapAreaId
  timeStr: string
  isMonthly?: boolean
}

interface ShipTypeCount {
  ship_type: ApiShipType[]
  count: number
}

interface ShipTypeCounts {
  flagship_type?: ApiShipType[]
  types: ShipTypeCount[]
}

interface ShipTypeCountsResult {
  flagship_type: MissionChecked
  types: MissionChecked
}

export const MissionChecked = {
  noop: 0, // 条件に含まれない
  clear: 1, // クリア
  not_cleared: 2 // 未クリア
} as const
export type MissionChecked = (typeof MissionChecked)[keyof typeof MissionChecked]

interface Succeeded2State {
  flagship_lv?: number
  cond_ship_count: number
  drum_slot_count?: number
  drum_ship_count?: number
}

interface Succeeded2CheckResult {
  flagship_lv: MissionChecked
  cond_ship_count: MissionChecked
  drum_slot_count: MissionChecked
  drum_ship_count: MissionChecked
}

const Succeeded2ComState1: Succeeded2State = {
  flagship_lv: 33,
  cond_ship_count: 5
}

const Succeeded2ComState2: Succeeded2State = {
  flagship_lv: 128,
  cond_ship_count: 4
}

const Succeeded2ComStates: Succeeded2State[] = [Succeeded2ComState1, Succeeded2ComState2]

const Succeeded2DefStates: Succeeded2State[] = [
  {
    cond_ship_count: 6
  }
]

interface MissionRequirements {
  ship_count: number
  type_count?: ShipTypeCounts[]
  flagship_lv: number
  drum_ship_count?: number
  drum_slot_count?: number
  total_lv?: number
  total_fire?: number
  total_tor?: number
  total_aa?: number
  total_asw?: number
  total_los?: number
  succeeded2?: Succeeded2State[]
}

interface MissionMeterial {
  fuel: number
  bull: number
  steel: number
  buxite: number
}
const toMaterial = (fuel: number, bull: number, steel: number, buxite: number): MissionMeterial => {
  return { fuel, bull, steel, buxite }
}

const MissionGetType = {
  normal: 'normal',  // 入手確率50%
  succeeded2: 'succeeded2'// 大成功時100%入手
}
type MissionGetType = (typeof MissionGetType)[keyof typeof MissionGetType]

export interface MissionKitInfo {
  api_item_id: ApiItemId
  count: number
  getType: MissionGetType
}
const toKitInfo = (api_item_id: ApiItemId, count: number, getType: MissionGetType): MissionKitInfo => {
  return { api_item_id, count, getType }
}

export interface MissionDetail {
  id: MissionId
  api_id: ApiMissionId
  name: string
  mapAreaId: MapAreaId
  durationMinute: number
  material: MissionMeterial
  kitNormal?: MissionKitInfo;
  kitSucceeded2?: MissionKitInfo;
  isMonthly: boolean
  isCombat: boolean
  requirements: MissionRequirements
}

export interface MissionCheckResult {
  result: MissionResult
  ship_count: MissionChecked
  type_count: ShipTypeCountsResult[]
  flagship_lv: MissionChecked
  drum_ship_count: MissionChecked
  drum_slot_count: MissionChecked
  total_lv: MissionChecked
  total_fire: MissionChecked
  total_tor: MissionChecked
  total_aa: MissionChecked
  total_asw: MissionChecked
  total_los: MissionChecked
  succeeded2: Succeeded2CheckResult[]
}

const missionDetails: MissionDetail[] = [
  // area1
  {
    id: MissionId.Id01,
    api_id: ApiMissionId.練習航海,
    name: '練習航海',
    mapAreaId: MapAreaId.area1,
    durationMinute: 15,
    material: toMaterial(0, 30, 0, 0),
    isMonthly: false,
    isCombat: false,
    requirements: {
      ship_count: 2,
      flagship_lv: 1,
      succeeded2: Succeeded2DefStates
    }
  },
  {
    id: MissionId.Id02,
    api_id: ApiMissionId.長距離練習航海,
    name: '長距離練習航海',
    mapAreaId: MapAreaId.area1,
    durationMinute: 30,
    material: toMaterial(0, 100, 30, 0),
    kitNormal: toKitInfo(ApiItemId.fast_repair, 1, MissionGetType.normal),
    isMonthly: false,
    isCombat: false,
    requirements: {
      ship_count: 4,
      flagship_lv: 2,
      succeeded2: Succeeded2DefStates
    }
  },
  {
    id: MissionId.Id03,
    api_id: ApiMissionId.警備任務,
    name: '警備任務',
    mapAreaId: MapAreaId.area1,
    durationMinute: 20,
    material: toMaterial(30, 30, 40, 0),
    isMonthly: false,
    isCombat: false,
    requirements: {
      ship_count: 3,
      flagship_lv: 3,
      succeeded2: Succeeded2DefStates
    }
  },
  {
    id: MissionId.Id04,
    api_id: ApiMissionId.対潜警戒任務,
    name: '対潜警戒任務',
    mapAreaId: MapAreaId.area1,
    durationMinute: 50,
    material: toMaterial(0, 70, 0, 0),
    kitNormal: toKitInfo(ApiItemId.fast_repair, 1, MissionGetType.normal), 
    kitSucceeded2: toKitInfo(ApiItemId.kagu_small, 1, MissionGetType.succeeded2),
    isMonthly: false,
    isCombat: false,
    requirements: {
      ship_count: 3,
      flagship_lv: 3,
      type_count: [
        {
          types: [
            { ship_type: [ApiShipType.keijyun], count: 1 },
            { ship_type: [ApiShipType.kutikukan, ApiShipType.kaiboukan], count: 2 }
          ]
        },
        {
          types: [
            { ship_type: [ApiShipType.kutikukan], count: 1 },
            { ship_type: [ApiShipType.kaiboukan], count: 3 }
          ]
        },
        {
          types: [
            { ship_type: [ApiShipType.internal_goei_kuubo], count: 1 },
            { ship_type: [ApiShipType.kutikukan], count: 2 }
          ]
        },
        {
          types: [
            { ship_type: [ApiShipType.internal_goei_kuubo], count: 1 },
            { ship_type: [ApiShipType.kaiboukan], count: 2 }
          ]
        },
        {
          types: [
            { ship_type: [ApiShipType.renjyun], count: 1 },
            { ship_type: [ApiShipType.kaiboukan], count: 2 }
          ]
        }
      ],
      succeeded2: Succeeded2DefStates
    }
  },
  {
    id: MissionId.Id05,
    api_id: ApiMissionId.海上護衛任務,
    name: '海上護衛任務',
    mapAreaId: MapAreaId.area1,
    durationMinute: 90,
    material: toMaterial(200, 200, 20, 20),
    isMonthly: false,
    isCombat: false,
    requirements: {
      ship_count: 4,
      flagship_lv: 3,
      type_count: [
        {
          types: [
            { ship_type: [ApiShipType.keijyun], count: 1 },
            { ship_type: [ApiShipType.kutikukan, ApiShipType.kaiboukan], count: 2 }
          ]
        },
        {
          types: [
            { ship_type: [ApiShipType.kutikukan], count: 1 },
            { ship_type: [ApiShipType.kaiboukan], count: 3 }
          ]
        },
        {
          types: [
            { ship_type: [ApiShipType.internal_goei_kuubo], count: 1 },
            { ship_type: [ApiShipType.kutikukan], count: 2 }
          ]
        },
        {
          types: [
            { ship_type: [ApiShipType.internal_goei_kuubo], count: 1 },
            { ship_type: [ApiShipType.kaiboukan], count: 2 }
          ]
        },
        {
          types: [
            { ship_type: [ApiShipType.renjyun], count: 1 },
            { ship_type: [ApiShipType.kaiboukan], count: 2 }
          ]
        }
      ],
      succeeded2: Succeeded2DefStates
    }
  },
  {
    id: MissionId.Id06,
    api_id: ApiMissionId.防空射撃演習,
    name: '防空射撃演習',
    mapAreaId: MapAreaId.area1,
    durationMinute: 40,
    material: toMaterial(0, 0, 0, 80),
    kitNormal: toKitInfo(ApiItemId.kagu_small, 1, MissionGetType.normal),
    isMonthly: false,
    isCombat: false,
    requirements: {
      ship_count: 4,
      flagship_lv: 4,
      succeeded2: Succeeded2DefStates
    }
  },
  {
    id: MissionId.Id07,
    api_id: ApiMissionId.観艦式予行,
    name: '観艦式予行',
    mapAreaId: MapAreaId.area1,
    durationMinute: 60,
    material: toMaterial(0, 0, 50, 30),
    kitNormal: toKitInfo(ApiItemId.fast_build, 1, MissionGetType.normal),
    isMonthly: false,
    isCombat: false,
    requirements: {
      ship_count: 6,
      flagship_lv: 5,
      succeeded2: Succeeded2DefStates
    }
  },
  {
    id: MissionId.Id08,
    api_id: ApiMissionId.観艦式,
    name: '観艦式',
    mapAreaId: MapAreaId.area1,
    durationMinute: 180,
    material: toMaterial(50, 100, 50, 50),
    kitNormal:toKitInfo(ApiItemId.fast_build, 2, MissionGetType.normal),
    kitSucceeded2: toKitInfo(ApiItemId.build_kit, 1, MissionGetType.succeeded2),
    isMonthly: false,
    isCombat: false,
    requirements: {
      ship_count: 6,
      flagship_lv: 6,
      succeeded2: Succeeded2DefStates
    }
  },
  {
    id: MissionId.IdA1,
    api_id: ApiMissionId.兵站強化任務,
    name: '兵站強化任務',
    mapAreaId: MapAreaId.area1,
    durationMinute: 25,
    material: toMaterial(45, 45, 0, 0),
    isMonthly: false,
    isCombat: false,
    requirements: {
      ship_count: 4,
      flagship_lv: 5,
      total_lv: 10,
      type_count: [
        {
          types: [{ ship_type: [ApiShipType.kutikukan, ApiShipType.kaiboukan], count: 3 }]
        }
      ],
      succeeded2: Succeeded2DefStates
    }
  },
  {
    id: MissionId.IdA2,
    api_id: ApiMissionId.海峡警備行動,
    name: '海峡警備行動',
    mapAreaId: MapAreaId.area1,
    durationMinute: 55,
    material: toMaterial(70, 40, 0, 10),
    kitNormal: toKitInfo(ApiItemId.build_kit, 1, MissionGetType.normal),
    kitSucceeded2: toKitInfo(ApiItemId.fast_repair, 1, MissionGetType.succeeded2),
    isMonthly: false,
    isCombat: false,
    requirements: {
      ship_count: 4,
      flagship_lv: 20,
      type_count: [
        {
          types: [{ ship_type: [ApiShipType.kutikukan, ApiShipType.kaiboukan], count: 4 }]
        }
      ],
      total_fire: 50,
      total_aa: 70,
      total_asw: 180,
      succeeded2: Succeeded2ComStates
    }
  },
  {
    id: MissionId.IdA3,
    api_id: ApiMissionId.長時間対潜警戒,
    name: '長時間対潜警戒',
    mapAreaId: MapAreaId.area1,
    durationMinute: 135,
    material: toMaterial(120, 0, 60, 60),
    kitNormal: toKitInfo(ApiItemId.fast_repair, 1, MissionGetType.normal),
    kitSucceeded2: toKitInfo(ApiItemId.build_kit, 2, MissionGetType.succeeded2),
    isMonthly: false,
    isCombat: false,
    requirements: {
      ship_count: 5,
      flagship_lv: 35,
      total_lv: 185,
      type_count: [
        {
          types: [
            { ship_type: [ApiShipType.keijyun], count: 1 },
            { ship_type: [ApiShipType.kutikukan, ApiShipType.kaiboukan], count: 3 }
          ]
        },
        {
          types: [
            { ship_type: [ApiShipType.kutikukan], count: 1 },
            { ship_type: [ApiShipType.kaiboukan], count: 3 }
          ]
        },
        {
          types: [
            { ship_type: [ApiShipType.internal_goei_kuubo], count: 1 },
            { ship_type: [ApiShipType.kutikukan], count: 2 }
          ]
        },
        {
          types: [
            { ship_type: [ApiShipType.internal_goei_kuubo], count: 1 },
            { ship_type: [ApiShipType.kaiboukan], count: 2 }
          ]
        },
        {
          types: [
            { ship_type: [ApiShipType.renjyun], count: 1 },
            { ship_type: [ApiShipType.kaiboukan], count: 2 }
          ]
        },
        {
          types: [
            { ship_type: [ApiShipType.keijyun], count: 1 },
            { ship_type: [ApiShipType.kaiboukan], count: 2 }
          ]
        }
      ],
      total_asw: 280,
      total_los: 60,
      succeeded2: Succeeded2ComStates
    }
  },
  {
    id: MissionId.IdA4,
    api_id: ApiMissionId.南西方面連絡線哨戒,
    name: '南西方面連絡線哨戒',
    mapAreaId: MapAreaId.area1,
    durationMinute: 110,
    material: toMaterial(80, 120, 0, 100),
    kitNormal: toKitInfo(ApiItemId.fast_repair, 2, MissionGetType.normal),
    kitSucceeded2: toKitInfo(ApiItemId.fast_build, 2, MissionGetType.succeeded2),
    isMonthly: true,
    isCombat: false,
    requirements: {
      ship_count: 5,
      flagship_lv: 40,
      total_lv: 200,
      type_count: [
        {
          types: [
            { ship_type: [ApiShipType.keijyun], count: 1 },
            { ship_type: [ApiShipType.kutikukan], count: 2 }
          ]
        },
        {
          types: [
            { ship_type: [ApiShipType.kutikukan], count: 1 },
            { ship_type: [ApiShipType.kaiboukan], count: 3 }
          ]
        },
        {
          types: [
            { ship_type: [ApiShipType.internal_goei_kuubo], count: 1 },
            { ship_type: [ApiShipType.kutikukan], count: 2 }
          ]
        },
        {
          types: [
            { ship_type: [ApiShipType.internal_goei_kuubo], count: 1 },
            { ship_type: [ApiShipType.kaiboukan], count: 2 }
          ]
        },
        {
          types: [
            { ship_type: [ApiShipType.renjyun], count: 1 },
            { ship_type: [ApiShipType.kaiboukan], count: 2 }
          ]
        },
        {
          types: [
            { ship_type: [ApiShipType.keijyun], count: 1 },
            { ship_type: [ApiShipType.kaiboukan], count: 2 }
          ]
        }
      ],
      total_fire: 300,
      total_aa: 200,
      total_asw: 200,
      total_los: 120,
      succeeded2: Succeeded2ComStates
    }
  },
  {
    id: MissionId.IdA5,
    api_id: ApiMissionId.小笠原沖哨戒線,
    name: '小笠原沖哨戒線',
    mapAreaId: MapAreaId.area1,
    durationMinute: 180,
    material: toMaterial(0, 300, 0, 100),
    kitNormal: toKitInfo(ApiItemId.fast_build, 4, MissionGetType.normal),
    kitSucceeded2: toKitInfo(ApiItemId.fast_repair, 3, MissionGetType.succeeded2),
    isMonthly: true,
    isCombat: true,
    requirements: {
      ship_count: 5,
      flagship_lv: 45,
      total_lv: 230,
      type_count: [
        {
          types: [
            { ship_type: [ApiShipType.keijyun], count: 1 },
            { ship_type: [ApiShipType.kutikukan], count: 3 }
          ]
        },
        {
          types: [
            { ship_type: [ApiShipType.kutikukan], count: 1 },
            { ship_type: [ApiShipType.kaiboukan], count: 3 }
          ]
        },
        {
          types: [
            { ship_type: [ApiShipType.internal_goei_kuubo], count: 1 },
            { ship_type: [ApiShipType.kutikukan], count: 2 }
          ]
        },
        {
          types: [
            { ship_type: [ApiShipType.internal_goei_kuubo], count: 1 },
            { ship_type: [ApiShipType.kaiboukan], count: 2 }
          ]
        },
        {
          types: [
            { ship_type: [ApiShipType.renjyun], count: 1 },
            { ship_type: [ApiShipType.kaiboukan], count: 2 }
          ]
        },
        {
          types: [
            { ship_type: [ApiShipType.keijyun], count: 1 },
            { ship_type: [ApiShipType.kaiboukan], count: 2 }
          ]
        }
      ],
      total_fire: 280,
      total_aa: 220,
      total_asw: 240,
      total_los: 150,
      succeeded2: Succeeded2ComStates
    }
  },
  {
    id: MissionId.IdA6,
    api_id: ApiMissionId.小笠原沖戦闘哨戒,
    name: '小笠原沖戦闘哨戒',
    mapAreaId: MapAreaId.area1,
    durationMinute: 210,
    material: toMaterial(100, 500, 100, 200),
    kitNormal: toKitInfo(ApiItemId.build_kit, 5, MissionGetType.normal),
    kitSucceeded2: toKitInfo(ApiItemId.remodel_kit, 1, MissionGetType.succeeded2),
    isMonthly: true,
    isCombat: true,
    requirements: {
      ship_count: 6,
      flagship_lv: 55,
      total_lv: 290,
      type_count: [
        {
          types: [
            { ship_type: [ApiShipType.keijyun], count: 1 },
            { ship_type: [ApiShipType.kutikukan], count: 3 }
          ]
        },
        {
          types: [
            { ship_type: [ApiShipType.kutikukan], count: 1 },
            { ship_type: [ApiShipType.kaiboukan], count: 3 }
          ]
        },
        {
          types: [
            { ship_type: [ApiShipType.internal_goei_kuubo], count: 1 },
            { ship_type: [ApiShipType.kutikukan], count: 2 }
          ]
        },
        {
          types: [
            { ship_type: [ApiShipType.internal_goei_kuubo], count: 1 },
            { ship_type: [ApiShipType.kaiboukan], count: 2 }
          ]
        },
        {
          types: [
            { ship_type: [ApiShipType.renjyun], count: 1 },
            { ship_type: [ApiShipType.kaiboukan], count: 2 }
          ]
        },
        {
          types: [
            { ship_type: [ApiShipType.keijyun], count: 1 },
            { ship_type: [ApiShipType.kaiboukan], count: 2 }
          ]
        }
      ],
      total_fire: 330,
      total_aa: 300,
      total_asw: 270,
      total_los: 180,
      succeeded2: Succeeded2ComStates
    }
  },

  // area2
  {
    id: MissionId.Id09,
    api_id: ApiMissionId.タンカー護衛任務,
    name: 'タンカー護衛任務',
    mapAreaId: MapAreaId.area2,
    durationMinute: 240,
    material: toMaterial(350, 0, 0, 0),
    kitNormal: toKitInfo(ApiItemId.kagu_small, 1, MissionGetType.normal),    
    kitSucceeded2: toKitInfo(ApiItemId.fast_repair, 2, MissionGetType.succeeded2),
    isMonthly: false,
    isCombat: false,
    requirements: {
      ship_count: 4,
      flagship_lv: 3,
      type_count: [
        {
          types: [
            { ship_type: [ApiShipType.keijyun], count: 1 },
            { ship_type: [ApiShipType.kutikukan, ApiShipType.kaiboukan], count: 2 }
          ]
        },
        {
          types: [
            { ship_type: [ApiShipType.kutikukan], count: 1 },
            { ship_type: [ApiShipType.kaiboukan], count: 3 }
          ]
        },
        {
          types: [
            { ship_type: [ApiShipType.internal_goei_kuubo], count: 1 },
            { ship_type: [ApiShipType.kutikukan], count: 2 }
          ]
        },
        {
          types: [
            { ship_type: [ApiShipType.internal_goei_kuubo], count: 1 },
            { ship_type: [ApiShipType.kaiboukan], count: 2 }
          ]
        },
        {
          types: [
            { ship_type: [ApiShipType.renjyun], count: 1 },
            { ship_type: [ApiShipType.kaiboukan], count: 2 }
          ]
        },
        {
          types: [
            { ship_type: [ApiShipType.keijyun], count: 1 },
            { ship_type: [ApiShipType.kaiboukan], count: 2 }
          ]
        }
      ],
      succeeded2: Succeeded2DefStates
    }
  },
  {
    id: MissionId.Id10,
    api_id: ApiMissionId.強行偵察任務,
    name: '強行偵察任務',
    mapAreaId: MapAreaId.area2,
    durationMinute: 90,
    material: toMaterial(0, 50, 0, 40),
    kitNormal: toKitInfo(ApiItemId.fast_build, 1, MissionGetType.normal),
    kitSucceeded2: toKitInfo(ApiItemId.fast_repair, 1, MissionGetType.succeeded2),
    isMonthly: false,
    isCombat: false,
    requirements: {
      ship_count: 3,
      flagship_lv: 3,
      type_count: [
        {
          types: [{ ship_type: [ApiShipType.keijyun], count: 2 }]
        }
      ],
      succeeded2: Succeeded2DefStates
    }
  },
  {
    id: MissionId.Id11,
    api_id: ApiMissionId.ボーキサイト輸送任務,
    name: 'ボーキサイト輸送任務',
    mapAreaId: MapAreaId.area2,
    durationMinute: 300,
    material: toMaterial(0, 0, 0, 250),
    kitNormal: toKitInfo(ApiItemId.kagu_small, 1, MissionGetType.normal),
    kitSucceeded2: toKitInfo(ApiItemId.fast_repair, 1, MissionGetType.succeeded2),
    isMonthly: false,
    isCombat: false,
    requirements: {
      ship_count: 4,
      flagship_lv: 6,
      type_count: [
        {
          types: [{ ship_type: [ApiShipType.kutikukan, ApiShipType.kaiboukan], count: 2 }]
        }
      ],
      succeeded2: Succeeded2DefStates
    }
  },
  {
    id: MissionId.Id12,
    api_id: ApiMissionId.資源輸送任務,
    name: '資源輸送任務',
    mapAreaId: MapAreaId.area2,
    durationMinute: 480,
    material: toMaterial(50, 250, 200, 50),
    kitNormal: toKitInfo(ApiItemId.kagu_middle, 1, MissionGetType.normal),
    kitSucceeded2: toKitInfo(ApiItemId.build_kit, 1, MissionGetType.succeeded2),
    isMonthly: false,
    isCombat: false,
    requirements: {
      ship_count: 4,
      flagship_lv: 4,
      type_count: [
        {
          types: [{ ship_type: [ApiShipType.kutikukan, ApiShipType.kaiboukan], count: 2 }]
        }
      ],
      succeeded2: Succeeded2DefStates
    }
  },
  {
    id: MissionId.Id13,
    api_id: ApiMissionId.鼠輸送作戦,
    name: '鼠輸送作戦',
    mapAreaId: MapAreaId.area2,
    durationMinute: 240,
    material: toMaterial(240, 300, 0, 0),
    kitNormal: toKitInfo(ApiItemId.fast_repair, 2, MissionGetType.normal),
    kitSucceeded2: toKitInfo(ApiItemId.kagu_small, 1, MissionGetType.succeeded2),
    isMonthly: false,
    isCombat: false,
    requirements: {
      ship_count: 6,
      flagship_lv: 5,
      type_count: [
        {
          types: [
            { ship_type: [ApiShipType.keijyun], count: 1 },
            { ship_type: [ApiShipType.kutikukan], count: 3 }
          ]
        }
      ],
      succeeded2: Succeeded2DefStates
    }
  },
  {
    id: MissionId.Id14,
    api_id: ApiMissionId.包囲陸戦隊撤収作戦,
    name: '包囲陸戦隊撤収作戦',
    mapAreaId: MapAreaId.area2,
    durationMinute: 360,
    material: toMaterial(0, 280, 200, 30),
    kitNormal: toKitInfo(ApiItemId.fast_repair, 1, MissionGetType.normal),
    kitSucceeded2: toKitInfo(ApiItemId.build_kit, 1, MissionGetType.succeeded2),
    isMonthly: false,
    isCombat: false,
    requirements: {
      ship_count: 6,
      flagship_lv: 6,
      type_count: [
        {
          types: [
            { ship_type: [ApiShipType.keijyun], count: 1 },
            { ship_type: [ApiShipType.kutikukan], count: 3 }
          ]
        }
      ],
      succeeded2: Succeeded2DefStates
    }
  },
  {
    id: MissionId.Id15,
    api_id: ApiMissionId.囮機動部隊支援作戦,
    name: '囮機動部隊支援作戦',
    mapAreaId: MapAreaId.area2,
    durationMinute: 720,
    material: toMaterial(0, 0, 300, 0),
    kitNormal: toKitInfo(ApiItemId.kagu_large, 1, MissionGetType.normal),
    kitSucceeded2: toKitInfo(ApiItemId.build_kit, 1, MissionGetType.succeeded2),
    isMonthly: false,
    isCombat: false,
    requirements: {
      ship_count: 6,
      flagship_lv: 8,
      type_count: [
        {
          types: [
            {
              ship_type: [
                ApiShipType.kei_kuubo,
                ApiShipType.seiki_kuubo,
                ApiShipType.soukou_kuubo,
                ApiShipType.suibo
              ],
              count: 2
            },
            { ship_type: [ApiShipType.kutikukan], count: 2 }
          ]
        }
      ],
      succeeded2: Succeeded2DefStates
    }
  },
  {
    id: MissionId.Id16,
    api_id: ApiMissionId.艦隊決戦援護作戦,
    name: '艦隊決戦援護作戦',
    mapAreaId: MapAreaId.area2,
    durationMinute: 900,
    material: toMaterial(500, 500, 200, 200),
    kitNormal: toKitInfo(ApiItemId.fast_build, 2, MissionGetType.normal),
    kitSucceeded2: toKitInfo(ApiItemId.build_kit, 2, MissionGetType.succeeded2),
    isMonthly: false,
    isCombat: false,
    requirements: {
      ship_count: 6,
      flagship_lv: 10,
      type_count: [
        {
          types: [
            { ship_type: [ApiShipType.keijyun], count: 1 },
            { ship_type: [ApiShipType.kutikukan], count: 2 }
          ]
        }
      ],
      succeeded2: Succeeded2DefStates
    }
  },
  {
    id: MissionId.IdB1,
    api_id: ApiMissionId.南西方面航空偵察作戦,
    name: '南西方面航空偵察作戦',
    mapAreaId: MapAreaId.area2,
    durationMinute: 35,
    material: toMaterial(0, 0, 20, 30),
    kitNormal: toKitInfo(ApiItemId.kagu_small, 1, MissionGetType.normal),
    kitSucceeded2: toKitInfo(ApiItemId.fast_repair, 1, MissionGetType.succeeded2),
    isMonthly: false,
    isCombat: false,
    requirements: {
      ship_count: 6,
      flagship_lv: 40,
      total_lv: 150,
      type_count: [
        {
          types: [
            { ship_type: [ApiShipType.suibo], count: 1 },
            { ship_type: [ApiShipType.keijyun], count: 1 },
            { ship_type: [ApiShipType.kutikukan, ApiShipType.kaiboukan], count: 2 }
          ]
        }
      ],
      total_aa: 200,
      total_asw: 200,
      total_los: 140,
      succeeded2: Succeeded2DefStates
    }
  },
  {
    id: MissionId.IdB2,
    api_id: ApiMissionId.敵泊地強襲反撃作戦,
    name: '敵泊地強襲反撃作戦',
    mapAreaId: MapAreaId.area2,
    durationMinute: 520,
    material: toMaterial(300, 200, 100, 0),
    kitNormal: toKitInfo(ApiItemId.fast_repair, 2, MissionGetType.normal),
    kitSucceeded2: toKitInfo(ApiItemId.build_kit, 2, MissionGetType.succeeded2),
    isMonthly: true,
    isCombat: false,
    requirements: {
      ship_count: 6,
      flagship_lv: 45,
      total_lv: 220,
      type_count: [
        {
          types: [
            { ship_type: [ApiShipType.jyuujyun], count: 1 },
            { ship_type: [ApiShipType.keijyun], count: 1 },
            { ship_type: [ApiShipType.kutikukan], count: 3 }
          ]
        }
      ],
      total_fire: 360,
      total_aa: 160,
      total_asw: 160,
      total_los: 140,
      succeeded2: Succeeded2DefStates
    }
  },
  {
    id: MissionId.IdB3,
    api_id: ApiMissionId.南西諸島離島哨戒作戦,
    name: '南西諸島離島哨戒作戦',
    mapAreaId: MapAreaId.area2,
    durationMinute: 170,
    material: toMaterial(0, 100, 100, 180),
    kitNormal: toKitInfo(ApiItemId.kagu_large, 1, MissionGetType.normal),
    kitSucceeded2: toKitInfo(ApiItemId.fast_build, 2, MissionGetType.succeeded2),
    isMonthly: true,
    isCombat: false,
    requirements: {
      ship_count: 6,
      flagship_lv: 50,
      total_lv: 250,
      type_count: [
        {
          types: [
            { ship_type: [ApiShipType.suibo], count: 1 },
            { ship_type: [ApiShipType.keijyun], count: 1 },
            { ship_type: [ApiShipType.kutikukan, ApiShipType.kaiboukan], count: 4 }
          ]
        }
      ],
      total_fire: 400,
      total_aa: 220,
      total_asw: 220,
      total_los: 190,
      succeeded2: Succeeded2ComStates
    }
  },
  {
    id: MissionId.IdB4,
    api_id: ApiMissionId.南西諸島離島防衛作戦,
    name: '南西諸島離島防衛作戦',
    mapAreaId: MapAreaId.area2,
    durationMinute: 450,
    material: toMaterial(0, 0, 1200, 650),
    kitNormal: toKitInfo(ApiItemId.build_kit, 4, MissionGetType.normal),
    kitSucceeded2: toKitInfo(ApiItemId.remodel_kit, 1, MissionGetType.succeeded2),
    isMonthly: true,
    isCombat: true,
    requirements: {
      ship_count: 6,
      flagship_lv: 55,
      total_lv: 300,
      type_count: [
        {
          types: [
            { ship_type: [ApiShipType.jyuujyun], count: 2 },
            { ship_type: [ApiShipType.keijyun], count: 1 },
            { ship_type: [ApiShipType.kutikukan], count: 2 },
            { ship_type: [ApiShipType.sensuikan, ApiShipType.sensui_kuubo], count: 1 }
          ]
        }
      ],
      total_fire: 500,
      total_aa: 280,
      total_asw: 280,
      total_los: 170,
      succeeded2: Succeeded2ComStates
    }
  },
  {
    id: MissionId.IdB5,
    api_id: ApiMissionId.南西諸島捜索撃滅戦,
    name: '南西諸島捜索撃滅戦',
    mapAreaId: MapAreaId.area2,
    durationMinute: 390,
    material: toMaterial(500, 500, 1000, 750),
    kitNormal: toKitInfo(ApiItemId.fast_repair, 4, MissionGetType.normal),
    kitSucceeded2: toKitInfo(ApiItemId.remodel_kit, 1, MissionGetType.succeeded2),
    isMonthly: true,
    isCombat: true,
    requirements: {
      ship_count: 6,
      flagship_lv: 60,
      total_lv: 330,
      type_count: [
        {
          types: [
            { ship_type: [ApiShipType.suibo], count: 1 },
            { ship_type: [ApiShipType.keijyun], count: 1 },
            { ship_type: [ApiShipType.kutikukan], count: 2 }
          ]
        }
      ],
      total_fire: 510,
      total_aa: 400,
      total_asw: 285,
      total_los: 385,
      succeeded2: Succeeded2ComStates
    }
  },
  {
    id: MissionId.IdB6,
    api_id: ApiMissionId.精鋭水雷戦隊夜襲,
    name: '精鋭水雷戦隊夜襲',
    mapAreaId: MapAreaId.area2,
    durationMinute: 350,
    material: toMaterial(600, 1000, 600, 600),
    kitNormal: toKitInfo(ApiItemId.build_kit, 5, MissionGetType.normal),
    kitSucceeded2: toKitInfo(ApiItemId.remodel_kit, 1, MissionGetType.succeeded2),
    isMonthly: true,
    isCombat: true,
    requirements: {
      ship_count: 6,
      flagship_lv: 75,
      total_lv: 400,
      type_count: [
        {
          flagship_type: [ApiShipType.keijyun],
          types: [{ ship_type: [ApiShipType.kutikukan], count: 5 }]
        }
      ],
      total_fire: 410,
      total_aa: 390,
      total_asw: 410,
      total_los: 340,
      succeeded2: Succeeded2ComStates
    }
  },

  // area3
  {
    id: MissionId.Id17,
    api_id: ApiMissionId.敵地偵察作戦,
    name: '敵地偵察作戦',
    mapAreaId: MapAreaId.area3,
    durationMinute: 45,
    material: toMaterial(70, 70, 50, 0),
    isMonthly: false,
    isCombat: false,
    requirements: {
      ship_count: 6,
      flagship_lv: 20,
      type_count: [
        {
          types: [
            { ship_type: [ApiShipType.keijyun], count: 1 },
            { ship_type: [ApiShipType.kutikukan], count: 3 }
          ]
        }
      ],
      succeeded2: Succeeded2DefStates
    }
  },
  {
    id: MissionId.Id18,
    api_id: ApiMissionId.航空機輸送作戦,
    name: '航空機輸送作戦',
    mapAreaId: MapAreaId.area3,
    durationMinute: 300,
    material: toMaterial(0, 0, 300, 100),
    kitNormal: toKitInfo(ApiItemId.fast_repair, 1, MissionGetType.normal),
    isMonthly: false,
    isCombat: false,
    requirements: {
      ship_count: 6,
      flagship_lv: 15,
      type_count: [
        {
          types: [
            {
              ship_type: [
                ApiShipType.kei_kuubo,
                ApiShipType.seiki_kuubo,
                ApiShipType.soukou_kuubo,
                ApiShipType.suibo
              ],
              count: 3
            },
            { ship_type: [ApiShipType.kutikukan], count: 2 }
          ]
        }
      ],
      succeeded2: Succeeded2DefStates
    }
  },
  {
    id: MissionId.Id19,
    api_id: ApiMissionId.北号作戦,
    name: '北号作戦',
    mapAreaId: MapAreaId.area3,
    durationMinute: 360,
    material: toMaterial(400, 50, 50, 30),
    kitNormal: toKitInfo(ApiItemId.kagu_small, 1, MissionGetType.normal),
    kitSucceeded2: toKitInfo(ApiItemId.build_kit, 1, MissionGetType.succeeded2),
    isMonthly: false,
    isCombat: false,
    requirements: {
      ship_count: 6,
      flagship_lv: 20,
      type_count: [
        {
          types: [
            { ship_type: [ApiShipType.koukuu_senkan], count: 2 },
            { ship_type: [ApiShipType.kutikukan], count: 2 }
          ]
        }
      ],
      succeeded2: Succeeded2DefStates
    }
  },
  {
    id: MissionId.Id20,
    api_id: ApiMissionId.潜水艦哨戒任務,
    name: '潜水艦哨戒任務',
    mapAreaId: MapAreaId.area3,
    durationMinute: 120,
    material: toMaterial(0, 0, 150, 0),
    kitNormal: toKitInfo(ApiItemId.kagu_small, 1, MissionGetType.normal),
    kitSucceeded2: toKitInfo(ApiItemId.build_kit, 1, MissionGetType.succeeded2),
    isMonthly: false,
    isCombat: false,
    requirements: {
      ship_count: 2,
      flagship_lv: 1,
      type_count: [
        {
          types: [
            { ship_type: [ApiShipType.sensuikan, ApiShipType.sensui_kuubo], count: 1 },
            { ship_type: [ApiShipType.keijyun], count: 1 }
          ]
        }
      ],
      succeeded2: Succeeded2DefStates
    }
  },
  {
    id: MissionId.Id21,
    api_id: ApiMissionId.北方鼠輸送作戦,
    name: '北方鼠輸送作戦',
    mapAreaId: MapAreaId.area3,
    durationMinute: 140,
    material: toMaterial(320, 270, 0, 0),
    kitNormal: toKitInfo(ApiItemId.kagu_small, 1, MissionGetType.normal),
    isMonthly: false,
    isCombat: false,
    requirements: {
      ship_count: 5,
      flagship_lv: 15,
      drum_ship_count: 3,
      drum_slot_count: 3,
      total_lv: 30,
      type_count: [
        {
          types: [
            { ship_type: [ApiShipType.keijyun], count: 1 },
            { ship_type: [ApiShipType.kutikukan], count: 4 }
          ]
        }
      ],
      succeeded2: [
        {
          drum_ship_count: 3,
          drum_slot_count: 4,
          cond_ship_count: 4
        }
      ]
    }
  },
  {
    id: MissionId.Id22,
    api_id: ApiMissionId.艦隊演習,
    name: '艦隊演習',
    mapAreaId: MapAreaId.area3,
    durationMinute: 180,
    material: toMaterial(0, 10, 0, 0),
    isMonthly: false,
    isCombat: false,
    requirements: {
      ship_count: 6,
      flagship_lv: 30,
      total_lv: 45,
      type_count: [
        {
          types: [
            { ship_type: [ApiShipType.jyuujyun], count: 1 },
            { ship_type: [ApiShipType.keijyun], count: 1 },
            { ship_type: [ApiShipType.kutikukan], count: 2 }
          ]
        }
      ],
      succeeded2: Succeeded2DefStates
    }
  },
  {
    id: MissionId.Id23,
    api_id: ApiMissionId.航空戦艦運用演習,
    name: '航空戦艦運用演習',
    mapAreaId: MapAreaId.area3,
    durationMinute: 240,
    material: toMaterial(0, 20, 0, 100),
    isMonthly: false,
    isCombat: false,
    requirements: {
      ship_count: 6,
      flagship_lv: 30,
      total_lv: 45,
      type_count: [
        {
          types: [
            { ship_type: [ApiShipType.koukuu_senkan], count: 2 },
            { ship_type: [ApiShipType.kutikukan], count: 2 }
          ]
        }
      ],
      succeeded2: Succeeded2DefStates
    }
  },
  {
    id: MissionId.Id24,
    api_id: ApiMissionId.北方航路海上護衛,
    name: '北方航路海上護衛',
    mapAreaId: MapAreaId.area3,
    durationMinute: 500,
    material: toMaterial(500, 0, 0, 150),
    kitNormal: toKitInfo(ApiItemId.build_kit, 2, MissionGetType.normal),
    kitSucceeded2: toKitInfo(ApiItemId.fast_repair, 1, MissionGetType.succeeded2),
    isMonthly: false,
    isCombat: false,
    requirements: {
      ship_count: 6,
      flagship_lv: 50,
      total_lv: 200,
      type_count: [
        {
          flagship_type: [ApiShipType.keijyun],
          types: [{ ship_type: [ApiShipType.kutikukan, ApiShipType.kaiboukan], count: 4 }]
        }
      ],
      succeeded2: [
        {
          drum_slot_count: 2,
          cond_ship_count: 4
        }
      ]
    }
  },

  // area4
  {
    id: MissionId.Id25,
    api_id: ApiMissionId.通商破壊作戦,
    name: '通商破壊作戦',
    mapAreaId: MapAreaId.area4,
    durationMinute: 2400,
    material: toMaterial(900, 0, 500, 0),
    isMonthly: false,
    isCombat: false,
    requirements: {
      ship_count: 4,
      flagship_lv: 25,
      type_count: [
        {
          types: [
            { ship_type: [ApiShipType.jyuujyun], count: 2 },
            { ship_type: [ApiShipType.kutikukan], count: 2 }
          ]
        }
      ],
      succeeded2: Succeeded2DefStates
    }
  },
  {
    id: MissionId.Id26,
    api_id: ApiMissionId.敵母港空襲作戦,
    name: '敵母港空襲作戦',
    mapAreaId: MapAreaId.area4,
    durationMinute: 4800,
    material: toMaterial(0, 0, 0, 900), 
    kitNormal: toKitInfo(ApiItemId.fast_repair, 3, MissionGetType.normal),
    isMonthly: false,
    isCombat: false,
    requirements: {
      ship_count: 4,
      flagship_lv: 30,
      type_count: [
        {
          types: [
            {
              ship_type: [
                ApiShipType.kei_kuubo,
                ApiShipType.seiki_kuubo,
                ApiShipType.soukou_kuubo,
                ApiShipType.suibo
              ],
              count: 1
            },
            { ship_type: [ApiShipType.keijyun], count: 1 },
            { ship_type: [ApiShipType.kutikukan], count: 2 }
          ]
        }
      ],
      succeeded2: Succeeded2DefStates
    }
  },
  {
    id: MissionId.Id27,
    api_id: ApiMissionId.潜水艦通商破壊作戦,
    name: '潜水艦通商破壊作戦',
    mapAreaId: MapAreaId.area4,
    durationMinute: 1200,
    material: toMaterial(0, 0, 800, 0),
    kitNormal: toKitInfo(ApiItemId.build_kit, 1, MissionGetType.normal),
    kitSucceeded2: toKitInfo(ApiItemId.kagu_small, 2, MissionGetType.succeeded2),
    isMonthly: false,
    isCombat: false,
    requirements: {
      ship_count: 2,
      flagship_lv: 1,
      type_count: [
        {
          types: [{ ship_type: [ApiShipType.sensuikan, ApiShipType.sensui_kuubo], count: 2 }]
        }
      ],
      succeeded2: Succeeded2DefStates
    }
  },
  {
    id: MissionId.Id28,
    api_id: ApiMissionId.西方海域封鎖作戦,
    name: '西方海域封鎖作戦',
    mapAreaId: MapAreaId.area4,
    durationMinute: 1500,
    material: toMaterial(0, 0, 900, 350),
    kitNormal: toKitInfo(ApiItemId.build_kit, 2, MissionGetType.normal),
    kitSucceeded2: toKitInfo(ApiItemId.kagu_middle, 2, MissionGetType.succeeded2),
    isMonthly: false,
    isCombat: false,
    requirements: {
      ship_count: 3,
      flagship_lv: 30,
      type_count: [
        {
          types: [{ ship_type: [ApiShipType.sensuikan, ApiShipType.seiki_kuubo], count: 3 }]
        }
      ],
      succeeded2: Succeeded2DefStates
    }
  },
  {
    id: MissionId.Id29,
    api_id: ApiMissionId.潜水艦派遣演習,
    name: '潜水艦派遣演習',
    mapAreaId: MapAreaId.area4,
    durationMinute: 1440,
    material: toMaterial(0, 50, 0, 100),
    kitNormal: toKitInfo(ApiItemId.build_kit, 1, MissionGetType.normal),
    kitSucceeded2: toKitInfo(ApiItemId.kagu_middle, 1, MissionGetType.succeeded2),
    isMonthly: false,
    isCombat: false,
    requirements: {
      ship_count: 3,
      flagship_lv: 50,
      type_count: [
        {
          types: [{ ship_type: [ApiShipType.sensuikan, ApiShipType.sensui_kuubo], count: 3 }]
        }
      ],
      succeeded2: Succeeded2DefStates
    }
  },
  {
    id: MissionId.Id30,
    api_id: ApiMissionId.潜水艦派遣作戦,
    name: '潜水艦派遣作戦',
    mapAreaId: MapAreaId.area4,
    durationMinute: 2880,
    material: toMaterial(0, 50, 0, 100),
    kitNormal: toKitInfo(ApiItemId.build_kit, 3, MissionGetType.normal),
    kitSucceeded2: toKitInfo(ApiItemId.kagu_large, 1, MissionGetType.succeeded2),
    isMonthly: false,
    isCombat: false,
    requirements: {
      ship_count: 4,
      flagship_lv: 55,
      type_count: [
        {
          types: [{ ship_type: [ApiShipType.sensuikan, ApiShipType.sensui_kuubo], count: 4 }]
        }
      ],
      succeeded2: Succeeded2DefStates
    }
  },
  {
    id: MissionId.Id31,
    api_id: ApiMissionId.海外艦との接触,
    name: '海外艦との接触',
    mapAreaId: MapAreaId.area4,
    durationMinute: 120,
    material: toMaterial(0, 30, 0, 0),
    kitNormal: toKitInfo(ApiItemId.kagu_small, 1, MissionGetType.normal),
    isMonthly: false,
    isCombat: false,
    requirements: {
      ship_count: 4,
      flagship_lv: 60,
      total_lv: 200,
      type_count: [
        {
          types: [{ ship_type: [ApiShipType.sensuikan, ApiShipType.sensui_kuubo], count: 4 }]
        }
      ],
      succeeded2: Succeeded2DefStates
    }
  },
  {
    id: MissionId.Id32,
    api_id: ApiMissionId.遠洋練習航海,
    name: '遠洋練習航海',
    mapAreaId: MapAreaId.area4,
    durationMinute: 1440,
    material: toMaterial(50, 50, 50, 50),
    kitNormal: toKitInfo(ApiItemId.kagu_large, 1, MissionGetType.normal),
    kitSucceeded2: toKitInfo(ApiItemId.build_kit, 3, MissionGetType.succeeded2),
    isMonthly: false,
    isCombat: false,
    requirements: {
      ship_count: 3,
      flagship_lv: 5,
      type_count: [
        {
          flagship_type: [ApiShipType.renjyun],
          types: [{ ship_type: [ApiShipType.kutikukan], count: 2 }]
        }
      ],
      succeeded2: Succeeded2ComStates
    }
  },
  {
    id: MissionId.IdD1,
    api_id: ApiMissionId.西方海域偵察作戦,
    name: '西方海域偵察作戦',
    mapAreaId: MapAreaId.area4,
    durationMinute: 120,
    material: toMaterial(0, 20, 20, 100),
    kitNormal: toKitInfo(ApiItemId.fast_repair, 1, MissionGetType.normal),
    isMonthly: false,
    isCombat: false,
    requirements: {
      ship_count: 5,
      flagship_lv: 50,
      total_lv: 200,
      type_count: [
        {
          flagship_type: [ApiShipType.suibo],
          types: [{ ship_type: [ApiShipType.kutikukan], count: 3 }]
        }
      ],
      total_aa: 240,
      total_asw: 240,
      total_los: 300,
      succeeded2: Succeeded2ComStates
    }
  },
  {
    id: MissionId.IdD2,
    api_id: ApiMissionId.西方潜水艦作戦,
    name: '西方潜水艦作戦',
    mapAreaId: MapAreaId.area4,
    durationMinute: 600,
    material: toMaterial(0, 0, 400, 800),
    kitNormal: toKitInfo(ApiItemId.irako, 1, MissionGetType.normal),
    kitSucceeded2: toKitInfo(ApiItemId.kagu_large, 1, MissionGetType.succeeded2),
    isMonthly: true,
    isCombat: true,
    requirements: {
      ship_count: 5,
      flagship_lv: 55,
      total_lv: 270,
      type_count: [
        {
          flagship_type: [ApiShipType.sensuibokan],
          types: [{ ship_type: [ApiShipType.sensuikan, ApiShipType.sensui_kuubo], count: 3 }]
        }
      ],
      total_fire: 60,
      total_aa: 80,
      total_asw: 50,
      total_los: 70,
      succeeded2: Succeeded2ComStates
    }
  },
  {
    id: MissionId.IdD3,
    api_id: ApiMissionId.欧州方面友軍との接触,
    name: '欧州方面友軍との接触',
    mapAreaId: MapAreaId.area4,
    durationMinute: 720,
    material: toMaterial(0, 800, 500, 400),
    kitNormal: toKitInfo(ApiItemId.fast_repair, 3, MissionGetType.normal),
    kitSucceeded2: toKitInfo(ApiItemId.remodel_kit, 1, MissionGetType.succeeded2),
    isMonthly: true,
    isCombat: true,
    requirements: {
      ship_count: 5,
      flagship_lv: 65,
      total_lv: 350,
      type_count: [
        {
          flagship_type: [ApiShipType.sensuibokan],
          types: [{ ship_type: [ApiShipType.sensuikan, ApiShipType.sensui_kuubo], count: 3 }]
        }
      ],
      total_fire: 115,
      total_aa: 90,
      total_asw: 70,
      total_los: 95,
      succeeded2: Succeeded2ComStates
    }
  },

  // area5
  {
    id: MissionId.Id33,
    api_id: ApiMissionId.前衛支援任務_南方,
    name: '前衛支援任務',
    mapAreaId: MapAreaId.area5,
    durationMinute: 15,
    material: toMaterial(0, 0, 0, 0),
    isMonthly: false,
    isCombat: false,
    requirements: {
      ship_count: 2,
      flagship_lv: 1,
      type_count: [
        {
          types: [{ ship_type: [ApiShipType.kutikukan], count: 2 }]
        }
      ],
      succeeded2: Succeeded2DefStates
    }
  },
  {
    id: MissionId.Id34,
    api_id: ApiMissionId.決戦支援任務_南方,
    name: '艦隊決戦支援任務',
    mapAreaId: MapAreaId.area5,
    durationMinute: 30,
    material: toMaterial(0, 0, 0, 0),
    isMonthly: false,
    isCombat: false,
    requirements: {
      ship_count: 2,
      flagship_lv: 1,
      type_count: [
        {
          types: [{ ship_type: [ApiShipType.kutikukan], count: 2 }]
        }
      ],
      succeeded2: Succeeded2DefStates
    }
  },
  {
    id: MissionId.Id35,
    api_id: ApiMissionId.MO作戦,
    name: 'MO作戦',
    mapAreaId: MapAreaId.area5,
    durationMinute: 420,
    material: toMaterial(0, 0, 240, 28),
    kitNormal: toKitInfo(ApiItemId.kagu_small, 2, MissionGetType.normal),
    kitSucceeded2: toKitInfo(ApiItemId.build_kit, 1, MissionGetType.succeeded2),
    isMonthly: false,
    isCombat: false,
    requirements: {
      ship_count: 6,
      flagship_lv: 40,
      type_count: [
        {
          types: [
            {
              ship_type: [
                ApiShipType.kei_kuubo,
                ApiShipType.seiki_kuubo,
                ApiShipType.soukou_kuubo,
                ApiShipType.suibo
              ],
              count: 2
            },
            { ship_type: [ApiShipType.jyuujyun], count: 1 },
            { ship_type: [ApiShipType.kutikukan], count: 1 }
          ]
        }
      ],
      succeeded2: Succeeded2DefStates
    }
  },
  {
    id: MissionId.Id36,
    api_id: ApiMissionId.水上機基地建設,
    name: '水上機基地建設',
    mapAreaId: MapAreaId.area5,
    durationMinute: 540,
    material: toMaterial(480, 0, 200, 200),
    kitNormal: toKitInfo(ApiItemId.kagu_middle, 2, MissionGetType.normal),
    kitSucceeded2: toKitInfo(ApiItemId.fast_repair, 1, MissionGetType.succeeded2),
    isMonthly: false,
    isCombat: false,
    requirements: {
      ship_count: 6,
      flagship_lv: 30,
      type_count: [
        {
          types: [
            { ship_type: [ApiShipType.suibo], count: 2 },
            { ship_type: [ApiShipType.keijyun], count: 1 },
            { ship_type: [ApiShipType.kutikukan], count: 1 }
          ]
        }
      ],
      succeeded2: Succeeded2DefStates
    }
  },
  {
    id: MissionId.Id37,
    api_id: ApiMissionId.東京急行,
    name: '東京急行',
    mapAreaId: MapAreaId.area5,
    durationMinute: 165,
    material: toMaterial(0, 380, 270, 0),
    kitNormal: toKitInfo(ApiItemId.kagu_small, 2, MissionGetType.normal),
    isMonthly: false,
    isCombat: false,
    requirements: {
      ship_count: 6,
      flagship_lv: 50,
      drum_ship_count: 3,
      drum_slot_count: 4,
      total_lv: 200,
      type_count: [
        {
          types: [
            { ship_type: [ApiShipType.keijyun], count: 1 },
            { ship_type: [ApiShipType.kutikukan], count: 5 }
          ]
        }
      ],
      succeeded2: [
        {
          drum_ship_count: 3,
          drum_slot_count: 5,
          cond_ship_count: 4
        }
      ]
    }
  },
  {
    id: MissionId.Id38,
    api_id: ApiMissionId.東京急行弐,
    name: '東京急行(弐)',
    mapAreaId: MapAreaId.area5,
    durationMinute: 175,
    material: toMaterial(420, 0, 200, 0),
    kitNormal: toKitInfo(ApiItemId.kagu_small, 1, MissionGetType.normal),
    isMonthly: false,
    isCombat: false,
    requirements: {
      ship_count: 6,
      flagship_lv: 65,
      drum_ship_count: 4,
      drum_slot_count: 8,
      total_lv: 240,
      type_count: [
        {
          types: [{ ship_type: [ApiShipType.kutikukan], count: 5 }]
        }
      ],
      succeeded2: [
        {
          drum_ship_count: 4,
          drum_slot_count: 10,
          cond_ship_count: 4
        }
      ]
    }
  },
  {
    id: MissionId.Id39,
    api_id: ApiMissionId.遠洋潜水艦作戦,
    name: '遠洋潜水艦作戦',
    mapAreaId: MapAreaId.area5,
    durationMinute: 1800,
    material: toMaterial(0, 30, 300, 0),
    kitNormal: toKitInfo(ApiItemId.fast_repair, 2, MissionGetType.normal),
    kitSucceeded2: toKitInfo(ApiItemId.kagu_middle, 1, MissionGetType.succeeded2),
    isMonthly: false,
    isCombat: false,
    requirements: {
      ship_count: 5,
      flagship_lv: 3,
      total_lv: 180,
      type_count: [
        {
          types: [
            { ship_type: [ApiShipType.sensuibokan], count: 1 },
            { ship_type: [ApiShipType.sensuikan, ApiShipType.sensui_kuubo], count: 4 }
          ]
        }
      ],
      succeeded2: Succeeded2DefStates
    }
  },
  {
    id: MissionId.Id40,
    api_id: ApiMissionId.水上機前線輸送,
    name: '水上機前線輸送',
    mapAreaId: MapAreaId.area5,
    durationMinute: 410,
    material: toMaterial(300, 300, 0, 100),
    kitNormal: toKitInfo(ApiItemId.fast_repair, 1, MissionGetType.normal),
    kitSucceeded2: toKitInfo(ApiItemId.kagu_small, 3, MissionGetType.succeeded2),
    isMonthly: false,
    isCombat: false,
    requirements: {
      ship_count: 6,
      flagship_lv: 25,
      total_lv: 150,
      type_count: [
        {
          flagship_type: [ApiShipType.keijyun],
          types: [
            { ship_type: [ApiShipType.suibo], count: 2 },
            { ship_type: [ApiShipType.kutikukan], count: 2 }
          ]
        }
      ],
      succeeded2: [
        {
          drum_slot_count: 4,
          cond_ship_count: 4
        }
      ]
    }
  },
  {
    id: MissionId.IdE1,
    api_id: ApiMissionId.ラバウル方面艦隊進出,
    name: 'ラバウル方面艦隊進出',
    mapAreaId: MapAreaId.area5,
    durationMinute: 450,
    material: toMaterial(0, 600, 600, 1000),
    kitNormal: toKitInfo(ApiItemId.kagu_large, 2, MissionGetType.normal),
    kitSucceeded2: toKitInfo(ApiItemId.remodel_kit, 1, MissionGetType.succeeded2),
    isMonthly: true,
    isCombat: true,
    requirements: {
      ship_count: 6,
      flagship_lv: 55,
      total_lv: 290,
      type_count: [
        {
          flagship_type: [ApiShipType.jyuujyun],
          types: [
            { ship_type: [ApiShipType.keijyun], count: 1 },
            { ship_type: [ApiShipType.kutikukan], count: 3 }
          ]
        }
      ],
      total_fire: 450,
      total_aa: 350,
      total_asw: 330,
      total_los: 250,
      succeeded2: Succeeded2ComStates
    }
  },
  {
    id: MissionId.IdE2,
    api_id: ApiMissionId.強行鼠輸送作戦,
    name: '強行鼠輸送作戦',
    mapAreaId: MapAreaId.area5,
    durationMinute: 185,
    material: toMaterial(0, 480, 0, 0),
    kitNormal: toKitInfo(ApiItemId.fast_repair, 2, MissionGetType.normal),
    kitSucceeded2: toKitInfo(ApiItemId.remodel_kit, 1, MissionGetType.succeeded2),
    isMonthly: true,
    isCombat: true,
    requirements: {
      ship_count: 5,
      flagship_lv: 70,
      drum_ship_count: 3,
      drum_slot_count: 4,
      total_lv: 320,
      type_count: [
        {
          types: [{ ship_type: [ApiShipType.kutikukan], count: 5 }]
        }
      ],
      total_fire: 280,
      total_aa: 240,
      total_asw: 200,
      total_los: 160,
      succeeded2: [
        {
          drum_ship_count: 3,
          drum_slot_count: 6,
          cond_ship_count: 4
        }
      ]
    }
  },

  // area6
  {
    id: MissionId.Id41,
    api_id: ApiMissionId.ブルネイ泊地沖哨戒,
    name: 'ブルネイ泊地沖哨戒',
    mapAreaId: MapAreaId.area6,
    durationMinute: 60,
    material: toMaterial(100, 0, 0, 20),
    kitNormal: toKitInfo(ApiItemId.build_kit, 1, MissionGetType.normal),
    kitSucceeded2: toKitInfo(ApiItemId.fast_repair, 1, MissionGetType.succeeded2),
    isMonthly: false,
    isCombat: false,
    requirements: {
      ship_count: 3,
      flagship_lv: 30,
      total_lv: 100,
      type_count: [
        {
          types: [{ ship_type: [ApiShipType.kutikukan, ApiShipType.kaiboukan], count: 3 }]
        }
      ],
      total_fire: 60,
      total_aa: 80,
      total_asw: 210,
      succeeded2: Succeeded2ComStates
    }
  },
  {
    id: MissionId.Id42,
    api_id: ApiMissionId.ミ船団護衛一号船団,
    name: 'ミ船団護衛(一号船団)',
    mapAreaId: MapAreaId.area6,
    durationMinute: 480,
    material: toMaterial(800, 0, 0, 200),
    kitNormal: toKitInfo(ApiItemId.kagu_large, 1, MissionGetType.normal),
    kitSucceeded2: toKitInfo(ApiItemId.fast_build, 3, MissionGetType.succeeded2),
    isMonthly: true,
    isCombat: false,
    requirements: {
      ship_count: 4,
      flagship_lv: 45,
      total_lv: 200,
      type_count: [
        {
          types: [
            { ship_type: [ApiShipType.keijyun], count: 1 },
            { ship_type: [ApiShipType.kutikukan], count: 2 }
          ]
        },
        {
          types: [
            { ship_type: [ApiShipType.kutikukan], count: 1 },
            { ship_type: [ApiShipType.kaiboukan], count: 3 }
          ]
        },
        {
          types: [
            { ship_type: [ApiShipType.internal_goei_kuubo], count: 1 },
            { ship_type: [ApiShipType.kutikukan], count: 2 }
          ]
        },
        {
          types: [
            { ship_type: [ApiShipType.internal_goei_kuubo], count: 1 },
            { ship_type: [ApiShipType.kaiboukan], count: 2 }
          ]
        },
        {
          types: [
            { ship_type: [ApiShipType.renjyun], count: 1 },
            { ship_type: [ApiShipType.kaiboukan], count: 2 }
          ]
        },
        {
          types: [
            { ship_type: [ApiShipType.keijyun], count: 1 },
            { ship_type: [ApiShipType.kaiboukan], count: 2 }
          ]
        }
      ],
      succeeded2: Succeeded2DefStates
    }
  },
  {
    id: MissionId.Id43,
    api_id: ApiMissionId.ミ船団護衛二号船団,
    name: 'ミ船団護衛(二号船団)',
    mapAreaId: MapAreaId.area6,
    durationMinute: 720,
    material: toMaterial(2000, 0, 0, 400),
    kitNormal: toKitInfo(ApiItemId.build_kit, 4, MissionGetType.normal),
    kitSucceeded2: toKitInfo(ApiItemId.remodel_kit, 1, MissionGetType.succeeded2),
    isMonthly: true,
    isCombat: true,
    requirements: {
      ship_count: 6,
      flagship_lv: 55,
      total_lv: 300,
      type_count: [
        {
          flagship_type: [ApiShipType.internal_goei_kuubo],
          types: [{ ship_type: [ApiShipType.kutikukan], count: 2 }]
        },
        {
          flagship_type: [ApiShipType.kei_kuubo],
          types: [
            { ship_type: [ApiShipType.keijyun], count: 1 },
            { ship_type: [ApiShipType.kutikukan], count: 4 }
          ]
        },
        {
          flagship_type: [ApiShipType.kei_kuubo],
          types: [
            { ship_type: [ApiShipType.kutikukan], count: 1 },
            { ship_type: [ApiShipType.kaiboukan], count: 3 }
          ]
        },
        {
          flagship_type: [ApiShipType.kei_kuubo],
          types: [
            { ship_type: [ApiShipType.keijyun], count: 1 },
            { ship_type: [ApiShipType.kaiboukan], count: 2 }
          ]
        },
        {
          flagship_type: [ApiShipType.kei_kuubo],
          types: [
            { ship_type: [ApiShipType.renjyun], count: 1 },
            { ship_type: [ApiShipType.kaiboukan], count: 2 }
          ]
        },
        {
          flagship_type: [ApiShipType.kei_kuubo],
          types: [
            { ship_type: [ApiShipType.internal_goei_kuubo], count: 1 },
            { ship_type: [ApiShipType.kutikukan], count: 2 }
          ]
        },
        {
          flagship_type: [ApiShipType.kei_kuubo],
          types: [
            { ship_type: [ApiShipType.internal_goei_kuubo], count: 1 },
            { ship_type: [ApiShipType.kaiboukan], count: 2 }
          ]
        }
      ],
      total_fire: 500,
      total_aa: 280,
      total_asw: 280,
      total_los: 170,
      succeeded2: Succeeded2ComStates
    }
  },
  {
    id: MissionId.Id44,
    api_id: ApiMissionId.航空装備輸送任務,
    name: '航空装備輸送任務',
    mapAreaId: MapAreaId.area6,
    durationMinute: 600,
    material: toMaterial(0, 200, 0, 800),
    kitNormal: toKitInfo(ApiItemId.build_kit, 4, MissionGetType.normal),
    kitSucceeded2: toKitInfo(ApiItemId.kagu_large, 2, MissionGetType.succeeded2),
    isMonthly: true,
    isCombat: false,
    requirements: {
      ship_count: 6,
      flagship_lv: 35,
      drum_ship_count: 3,
      drum_slot_count: 6,
      total_lv: 210,
      type_count: [
        {
          types: [
            { ship_type: [ApiShipType.suibo], count: 2 },
            { ship_type: [ApiShipType.keijyun], count: 1 },
            { ship_type: [ApiShipType.kutikukan, ApiShipType.kaiboukan], count: 2 }
          ]
        },
        {
          types: [
            {
              ship_type: [ApiShipType.seiki_kuubo, ApiShipType.kei_kuubo, ApiShipType.soukou_kuubo],
              count: 1
            },
            { ship_type: [ApiShipType.suibo], count: 1 },
            { ship_type: [ApiShipType.keijyun], count: 1 },
            { ship_type: [ApiShipType.kutikukan, ApiShipType.kaiboukan], count: 2 }
          ]
        }
      ],
      total_aa: 200,
      total_asw: 200,
      total_los: 150,
      succeeded2: [
        {
          drum_ship_count: 3,
          drum_slot_count: 8,
          cond_ship_count: 4
        }
      ]
    }
  },
  {
    id: MissionId.Id45,
    api_id: ApiMissionId.ボーキサイト船団護衛,
    name: 'ボーキサイト船団護衛',
    mapAreaId: MapAreaId.area6,
    durationMinute: 200,
    material: toMaterial(40, 0, 0, 220),
    kitNormal: toKitInfo(ApiItemId.kagu_middle, 1, MissionGetType.normal),
    isMonthly: false,
    isCombat: false,
    requirements: {
      ship_count: 5,
      flagship_lv: 50,
      total_lv: 240,
      type_count: [
        {
          flagship_type: [ApiShipType.kei_kuubo],
          types: [{ ship_type: [ApiShipType.kutikukan, ApiShipType.kaiboukan], count: 4 }]
        }
      ],
      total_aa: 240,
      total_asw: 300,
      total_los: 180,
      succeeded2: Succeeded2ComStates
    }
  },
  {
    id: MissionId.Id46,
    api_id: ApiMissionId.南西海域戦闘哨戒,
    name: '南西海域戦闘哨戒',
    mapAreaId: MapAreaId.area6,
    durationMinute: 210,
    material: toMaterial(300, 0, 150, 380),
    kitNormal: toKitInfo(ApiItemId.build_kit, 3, MissionGetType.normal),
    kitSucceeded2: toKitInfo(ApiItemId.remodel_kit, 1, MissionGetType.succeeded2),
    isMonthly: true,
    isCombat: true,
    requirements: {
      ship_count: 5,
      flagship_lv: 60,
      total_lv: 300,
      type_count: [
        {
          types: [
            { ship_type: [ApiShipType.jyuujyun], count: 2 },
            { ship_type: [ApiShipType.keijyun], count: 1 },
            { ship_type: [ApiShipType.kutikukan], count: 2 }
          ]
        }
      ],
      total_fire: 350,
      total_aa: 250,
      total_asw: 220,
      total_los: 190,
      succeeded2: Succeeded2ComStates
    }
  }
]

interface SlotitemCount {
  kinu_kaini: boolean
  daihatus: { [key: number]: Slot[] }
  drum_count: number
  drum_ship_count: number
}

interface DeckStatus {
  total_lv: number
  total_fire: number
  total_tor: number
  total_aa: number
  total_asw: number
  total_los: number
  total_fire_remodel: number
  total_aa_remodel: number
  total_asw_remodel: number
  total_los_remodel: number
}

export interface DeckInfo {
  ships: ShipInfoMission[]
  status: DeckStatus
  slotitemCount: SlotitemCount
  cond_ship_count: number
  daihatuBonus: number
}

export interface MissionRemodel {
  fire: number
  aa: number
  asw: number
  los: number
  // todo 遠征での装備補正値(搭載数や熟練度が関連)
  // 艦載機系(艦戦、艦爆、艦攻、艦偵、水偵、水爆、回転翼機、飛行艇、対潜哨戒機)は艦載機熟練度・搭載数によっても補正を受ける。
  // 補正値は複雑で不明なため、該当装備の対潜値は加算しない
  // この値は合計値から引くこと
  minusAsw: number 
}

export interface ShipInfoMission extends ShipInfo {
  readonly remodel: MissionRemodel
}

/**
 * 遠征系 火力改修係数
 * 要チェック：高角砲
 *
 * @param type
 * @returns
 */
const remodelMissionFireRate = (mst: MstSlotitem): number => {
  switch (KcsUtil.slotitemType(mst)) {
    case SlotitemType.SmallMainGun:
    case SlotitemType.SecondaryGun:
    case SlotitemType.SmallRadar:
    case SlotitemType.APShell:
    case SlotitemType.AAGun:
      return 0.5
    case SlotitemType.MediumMainGun:
    case SlotitemType.LargeMainGun:
    case SlotitemType.LargeRadar:
      return 1.0
  }
  return 0
}

/**
 * 遠征系 対空改修係数
 *
 * @param type
 * @returns
 */
const remodelMissionAARate = (mst: MstSlotitem): number => {
  switch (KcsUtil.slotitemImgType(mst)) {
    // case SlotitemImgType.kijyu: // 機銃に関しては遠征効果が確認できなかった 対空3の12.7mm単装機銃で確認★1と6
    case SlotitemImgType.koukakuhou:
      return 1.0
  }
  return 0
}

/**
 * 遠征系 対潜改修係数
 *
 * @param mst
 * @returns
 */
const remodelMissionAswRate = (mst: MstSlotitem): number => {
  switch (KcsUtil.slotitemType(mst)) {
    case SlotitemType.Sonar:
    case SlotitemType.LargeSonar:
    case SlotitemType.DepthCharge:
      return 1.0
    // todo 搭載数により対潜値が変わることの対応、補正値は不明のようである
    // 対応前では搭載数により補正値が変わるため、加算しない
    // case SlotitemType.RecSeaplane:
    // case SlotitemType.SeaplaneBomber:
    // case SlotitemType.TorpedoBomber:
    // case SlotitemType.DiveBomber:
    // case SlotitemType.Autogyro:
    //   if (mst.api_tais >= 7) {
    //     return 1.0
    //   }
    //   if (mst.api_tais >= 4) {
    //     return 0.5
    //   }
    //   break
  }
  return 0
}

/**
 * 遠征系 対潜マイナス値
 * 艦載機系(艦戦、艦爆、艦攻、艦偵、水偵、水爆、回転翼機、飛行艇、対潜哨戒機)は艦載機熟練度・搭載数によっても補正を受ける
 * 補正値は不明であり遠征失敗となることを避けることを目的として該当装備の対潜値は加算しない
 * 
 * 遠征では装備の対潜値は使用されず、装備スロット搭載数より対潜値が決定される
 * 搭載数が少ない場合、装備対潜値以下の値となる場合がある
 * 例：零式水上観測機 対潜値4 搭載数が2の場合、遠征での対潜値は2となる
 * 
 *
 * @param mst
 * @returns
 */
const missionMinusAsw = (mst: MstSlotitem): number => {
  switch (KcsUtil.slotitemType(mst)) {
    case SlotitemType.Fighter:
    case SlotitemType.DiveBomber:
    case SlotitemType.TorpedoBomber:
    case SlotitemType.RecAircraft:
    case SlotitemType.RecSeaplane:
    case SlotitemType.SeaplaneBomber:
    case SlotitemType.Autogyro:
    case SlotitemType.ASBAircraft:
    case SlotitemType.LargeFlyingBoat:
      return mst.api_tais;
  }
  return 0
}

/**
 * 遠征系 索敵改修係数
 *
 * @param type
 * @returns
 */
const remodelMissionLosRate = (mst: MstSlotitem): number => {
  switch (KcsUtil.slotitemType(mst)) {
    case SlotitemType.RecSeaplane:
    case SlotitemType.SmallRadar:
    case SlotitemType.LargeRadar:
      return 1.0
  }
  return 0
}

/**
 *
 */
const calcRemodelStarValue = (star: number, rate: number): number => {
  return Math.floor(Math.sqrt(star) * rate * 10.0) / 10.0
}

/**
 *
 * @param slots
 * @returns
 */
const calcRemodelMission = (slots: Slot[]): MissionRemodel => {
  return slots.reduce<MissionRemodel>(
    (acc, slot) => {
      if (slot) {
        if (slot.api.api_level) {
          console.log('calcRemodelMission level', slot)

          // calc remodel fire
          const fireRate = remodelMissionFireRate(slot.mst)
          if (fireRate) {
            acc.fire += calcRemodelStarValue(slot.api.api_level, fireRate)
          }

          // calc remodel aa
          const aaRate = remodelMissionAARate(slot.mst)
          if (aaRate) {
            acc.aa += calcRemodelStarValue(slot.api.api_level, aaRate)
          }

          // calc remodel asw
          const aswRate = remodelMissionAswRate(slot.mst)
          if (aswRate) {
            acc.asw += calcRemodelStarValue(slot.api.api_level, aswRate)
          }

          // calc remodel los
          const losRate = remodelMissionLosRate(slot.mst)
          if (losRate) {
            acc.los += calcRemodelStarValue(slot.api.api_level, losRate)
          }
        }

        // calc minus asw for certain equipment
        const minusAsw = missionMinusAsw(slot.mst)
        if (minusAsw) {
          acc.minusAsw += minusAsw
        }
      }
      return acc
    },
    {
      fire: 0,
      aa: 0,
      asw: 0,
      los: 0,
      minusAsw: 0
    }
  )
}

const toShipInfoMission = (ships: ShipInfo[]): ShipInfoMission[] => {
  return ships.map<ShipInfoMission>((ship) => {
    const remodel = calcRemodelMission(ship.slots)
    console.log('toShipInfoMission', remodel)
    return {
      ...ship,
      remodel
    }
  })
}

/**
 *
 * @param ships
 * @returns
 */
const deckStatus = (ships: ShipInfoMission[]): DeckStatus => {
  const ret: DeckStatus = {
    total_lv: 0,
    total_fire: 0,
    total_tor: 0,
    total_aa: 0,
    total_asw: 0,
    total_los: 0,
    total_fire_remodel: 0,
    total_aa_remodel: 0,
    total_asw_remodel: 0,
    total_los_remodel: 0
  }

  return ships.reduce<DeckStatus>((acc, ship: ShipInfoMission) => {
    const api = ship.api
    acc.total_lv += api.api_lv
    acc.total_fire += api.api_karyoku[0]
    acc.total_tor += api.api_raisou[0]
    acc.total_aa += api.api_taiku[0]
    acc.total_asw += api.api_taisen[0]
    acc.total_los += api.api_sakuteki[0]
    acc.total_fire_remodel += ship.remodel.fire
    acc.total_aa_remodel += ship.remodel.aa
    acc.total_asw_remodel += ship.remodel.asw
    acc.total_los_remodel += ship.remodel.los
    // 補正不明な対潜値は加算しない
    acc.total_asw -= ship.remodel.minusAsw
    return acc
  }, ret)
}

/**
 *
 * @param deckInfo
 * @returns
 */
const countSlotitem = (ships: ShipInfoMission[]): SlotitemCount => {
  const count: SlotitemCount = {
    kinu_kaini: false,
    daihatus: [],
    drum_count: 0,
    drum_ship_count: 0
  }
  ships.forEach((el) => {
    if (el.mst.api_id === 487) {
      count.kinu_kaini = true
    }
    let hasDrum = false
    el.slots.forEach((slot) => {
      if (
        slot &&
        (KcsUtil.slotitemType(slot.mst) === SlotitemType.LandingCraft ||
          KcsUtil.slotitemType(slot.mst) === SlotitemType.SpecialATank)
      ) {
        if (!count.daihatus[slot.mst.api_id]) {
          count.daihatus[slot.mst.api_id] = []
        }
        count.daihatus[slot.mst.api_id].push(slot)
      }
      if (slot?.mst.api_id === 75) {
        ++count.drum_count
        hasDrum = true
      }
    })
    if (hasDrum) {
      ++count.drum_ship_count
    }
  })
  return count
}

const countCondShip = (ships: ShipInfo[]): number => {
  return ships.reduce<number>((acc, el) => {
    if (el.api.api_cond > 49) {
      return acc + 1
    }
    return acc
  }, 0)
}

const daihatuBonusMap: { [key: number]: number } = {
  68: 5.0,
  166: 2.0,
  167: 1.0,
  193: 5.0,
  408: 2.0,
  409: 3.0,
  436: 2.0,
  449: 2.0,
  525: 5.0,
  526: 5.0
}

/**
 * 
 * @param daihatuCount 
 * @returns 
 */
const calcDaihatuBonus = (daihatuCount: SlotitemCount): number => {
  // calc base/remodel bonus
  let bonus = 0
  let totalStar = 0;
  let totalCount = 0;
  for (const id in daihatuBonusMap) {
    const slots = daihatuCount.daihatus[id]
    if (slots) {
      bonus += daihatuBonusMap[id] * slots.length
      totalCount += slots.length
      totalStar += slots.reduce((acc, slot) => {
        if (slot) {
          return acc + (slot.api.api_level ?? 0)
        }
        return acc
      }, 0)
    }
  }

  // kinu kaini bonus
  if (daihatuCount.kinu_kaini) {
    bonus += 5.0;
  }

  // calc tokudaihatu bonus
  let tokuBonus = 0;
  const tokuSlots = daihatuCount.daihatus[193]
  if (tokuSlots) {
    if (tokuSlots.length <= 2) {
      tokuBonus = 2.0 * tokuSlots.length
    } else {
       const daihatuSlots = daihatuCount.daihatus[68]
       if (tokuSlots.length === 3) {
          tokuBonus = (daihatuSlots.length <= 1 ? 5.0 : 
            (daihatuSlots.length <= 2 ? 5.2 : 5.4))
       } else {
          tokuBonus = (daihatuSlots.length <= 0 ? 5.4 : 
            (daihatuSlots.length <= 1 ? 5.6 : 
              (daihatuSlots.length <= 2 ? 5.8 : 
                daihatuSlots.length <= 3 ? 5.9 : 6.0)))
       }
    }
  }
  const baseBonus = Math.min(bonus, 20)
  let remodelBonus = 0;
  if (totalCount > 0) {
    remodelBonus = baseBonus * 0.1 * totalStar / totalCount
  }
  return tokuBonus + baseBonus + remodelBonus / 10
}

/**
 *
 * @param ships
 * @param req
 * @returns
 */
const checkShipTypeCount = (
  ships: ShipInfo[],
  type_count: ShipTypeCounts[]
): ShipTypeCountsResult[] => {
  const rets: ShipTypeCountsResult[] = []
  for (const types of type_count) {
    const ret: ShipTypeCountsResult = {
      flagship_type: MissionChecked.noop,
      types: MissionChecked.not_cleared
    }

    // check flagship type
    if (types.flagship_type) {
      ret.flagship_type = MissionChecked.not_cleared
      if (ships.length) {
        if (KcsUtil.findShipType(ships[0], types.flagship_type) !== -1) {
          ret.flagship_type = MissionChecked.clear
        }
      }
    }

    // check deck ship type count
    if (types.types.length) {
      let clearCount = 0
      for (const ship_type of types.types) {
        if (shipTypeCount(ships, ship_type.ship_type) >= ship_type.count) {
          ++clearCount
        }
      }
      if (clearCount === types.types.length) {
        ret.types = MissionChecked.clear
      }
    }

    rets.push(ret)
  }

  return rets
}

/**
 *
 * @param ships
 * @param ship_types
 * @returns
 */
const shipTypeCount = (ships: ShipInfo[], ship_types: ApiShipType[]): number => {
  let count = ships.reduce((acc, ship) => {
    if (ship_types.includes(ship.mst.api_stype)) {
      return acc + 1
    }
    return acc
  }, 0)

  const goei_kuubo_type = ship_types.filter((el) => el === ApiShipType.internal_goei_kuubo)
  if (goei_kuubo_type.length) {
    count += ships.reduce((acc, ship) => {
      if (KcsUtil.isGoeiKuubo(ship.mst)) {
        return acc + 1
      }
      return acc
    }, 0)
  }

  const tokumukan_type = ship_types.filter((el) => el === ApiShipType.internal_tokumukan)
  if (tokumukan_type.length) {
    count += ships.reduce((acc, ship) => {
      if (KcsUtil.isTokumukan(ship.mst)) {
        return acc + 1
      }
      return acc
    }, 0)
  }

  return count
}

const checkSucceeded2 = (deckInfo: DeckInfo, req: MissionRequirements): Succeeded2CheckResult[] => {
  const ret: Succeeded2CheckResult[] = []
  for (const el of req.succeeded2 ?? []) {
    const result: Succeeded2CheckResult = {
      flagship_lv: MissionChecked.noop,
      cond_ship_count: MissionChecked.noop,
      drum_slot_count: MissionChecked.noop,
      drum_ship_count: MissionChecked.noop
    }

    // check flagship lv
    if (el.flagship_lv) {
      result.flagship_lv = toChecked(el.flagship_lv <= deckInfo.ships[0].api.api_lv)
    }

    // cond ship count
    if (el.cond_ship_count) {
      result.cond_ship_count = toChecked(el.cond_ship_count <= deckInfo.cond_ship_count)
    }

    // drum ship count
    if (el.drum_ship_count) {
      result.drum_ship_count = toChecked(
        el.drum_ship_count <= deckInfo.slotitemCount.drum_ship_count
      )
    }

    // drum slot count
    if (el.drum_slot_count) {
      result.drum_slot_count = toChecked(el.drum_slot_count <= deckInfo.slotitemCount.drum_count)
    }

    ret.push(result)
  }

  return ret
}

const toChecked = (is_clear: boolean): MissionChecked => {
  return is_clear ? MissionChecked.clear : MissionChecked.not_cleared
}

const isShipTypeClear = (result: ShipTypeCountsResult): boolean => {
  if (result.types === MissionChecked.clear) {
    return (
      result.flagship_type === MissionChecked.noop || result.flagship_type === MissionChecked.clear
    )
  }
  return false
}

/**
 *
 * @param result
 * @returns
 */
const setResult = (result: MissionCheckResult): boolean => {
  // check ship count
  if (result.ship_count === MissionChecked.not_cleared) {
    return false
  }

  // check type count
  if (result.type_count.length && !result.type_count.find((el) => isShipTypeClear(el))) {
    return false
  }

  /// check flagship lv
  if (result.flagship_lv === MissionChecked.not_cleared) {
    return false
  }

  // check total_lv
  if (result.total_lv === MissionChecked.not_cleared) {
    return false
  }

  // check total fire
  if (result.total_fire === MissionChecked.not_cleared) {
    return false
  }

  // check total aa
  if (result.total_aa === MissionChecked.not_cleared) {
    return false
  }

  // check total asw
  if (result.total_asw === MissionChecked.not_cleared) {
    return false
  }

  // check total los
  if (result.total_los === MissionChecked.not_cleared) {
    return false
  }

  // check total tor
  if (result.total_tor === MissionChecked.not_cleared) {
    return false
  }

  // check drum ship count
  if (result.drum_ship_count === MissionChecked.not_cleared) {
    return false
  }

  // check drum slot count
  if (result.drum_slot_count === MissionChecked.not_cleared) {
    return false
  }

  result.result = MissionResult.succeeded
  return true
}

/**
 *
 * @param result
 * @returns
 */
const setResultSucceeded2 = (result: MissionCheckResult): void => {
  if (
    result.succeeded2.find((el) => {
      if (
        el.flagship_lv === MissionChecked.not_cleared ||
        el.cond_ship_count === MissionChecked.not_cleared ||
        el.drum_ship_count === MissionChecked.not_cleared ||
        el.drum_slot_count === MissionChecked.not_cleared
      ) {
        return false
      }
      return true
    })
  ) {
    result.result = MissionResult.succeeded2
  }
}

/**
 *
 * @param svdata
 * @param deck
 * @param req
 * @returns
 */
const checkResult = (deckInfo: DeckInfo, detail: MissionDetail): MissionCheckResult => {
  const req = detail?.requirements
  const result: MissionCheckResult = {
    result: MissionResult.failed,
    ship_count: MissionChecked.noop,
    type_count: [],
    flagship_lv: MissionChecked.noop,
    drum_ship_count: MissionChecked.noop,
    drum_slot_count: MissionChecked.noop,
    total_lv: MissionChecked.noop,
    total_fire: MissionChecked.noop,
    total_tor: MissionChecked.noop,
    total_aa: MissionChecked.noop,
    total_asw: MissionChecked.noop,
    total_los: MissionChecked.noop,
    succeeded2: []
  }

  if ((deckInfo.ships?.length ?? 0) === 0) {
    return result
  }

  // check ship count
  result.ship_count = toChecked(deckInfo.ships.length >= req.ship_count)

  // check type count
  if (req.type_count) {
    result.type_count = checkShipTypeCount(deckInfo.ships, req.type_count)
  }

  // check flagship lv
  result.flagship_lv = toChecked(deckInfo.ships[0].api.api_lv >= req.flagship_lv)

  const status = deckInfo.status

  // check drum ship count
  if (undefined !== req.drum_ship_count) {
    result.drum_ship_count = toChecked(
      deckInfo.slotitemCount.drum_ship_count >= req.drum_ship_count
    )
  }

  // check drum slot count
  if (undefined !== req.drum_slot_count) {
    result.drum_slot_count = toChecked(deckInfo.slotitemCount.drum_count >= req.drum_slot_count)
  }

  // check total_lv
  if (undefined !== req.total_lv) {
    result.total_lv = toChecked(status.total_lv >= req.total_lv)
  }

  // check total fire
  if (undefined !== req.total_fire) {
    const total_fire = status.total_fire + status.total_fire_remodel
    result.total_fire = toChecked(total_fire >= req.total_fire)
  }

  // check total aa
  if (undefined !== req.total_aa) {
    const total_aa = status.total_aa + status.total_aa_remodel
    result.total_aa = toChecked(total_aa >= req.total_aa)
  }

  // check total asw
  if (undefined !== req.total_asw) {
    const total_asw = status.total_asw + status.total_asw_remodel
    result.total_asw = toChecked(total_asw >= req.total_asw)
  }

  // check total los
  if (undefined !== req.total_los) {
    const total_los = status.total_los + status.total_los_remodel
    result.total_los = toChecked(total_los >= req.total_los)
  }

  // check total tor
  if (undefined !== req.total_tor) {
    result.total_tor = toChecked(status.total_tor >= req.total_tor)
  }

  //
  if (setResult(result)) {
    // check succeeded2
    result.succeeded2 = checkSucceeded2(deckInfo, req)
    setResultSucceeded2(result)
  }

  return result
}

/**
 *
 */
class MissionStuffImpl {
  /**
   *
   */
  public getDetail(name: string): MissionDetail | undefined {
    return missionDetails.find((el) => el.name === name)
  }

  /**
   *
   * @param result
   * @returns
   */
  public toClearResultText(result: ApiMissionClearResult): string {
    return ['失敗', '成功', '大成功'][result] ?? ''
  }

  /**
   *
   * @param id
   * @returns
   */
  public getDetailById(id: MissionId): MissionDetail | undefined {
    return missionDetails.find((el) => el.id === id)
  }

  /**
   *
   * @returns
   */
  public getDetails(): MissionDetail[] {
    return missionDetails
  }

  /**
   *
   * @param svdata
   * @param deck
   * @param detail
   * @returns
   */
  public checkResult(deckInfo: DeckInfo, detail: MissionDetail): MissionCheckResult {
    return checkResult(deckInfo, detail)
  }

  /**
   *
   * @param result
   * @returns
   */
  public getMissionResultText(result: MissionResult): string {
    switch (result) {
      case MissionResult.failed:
        return MissionResultText.failed
      case MissionResult.succeeded:
        return MissionResultText.succeeded
      case MissionResult.succeeded2:
        return MissionResultText.succeeded2
    }
    return ''
  }

  /**
   *
   * @param svdata
   * @param deck
   */
  public toDeckInfo(svdata: SvData, deck: ApiDeckPort): DeckInfo {
    const ships = toShipInfoMission(svdata.shipInfos(deck.api_ship))
    const slotitemCount = countSlotitem(ships);
    return {
      ships,
      status: deckStatus(ships),
      slotitemCount,
      cond_ship_count: countCondShip(ships),
      daihatuBonus: this.calDaihatuBonus(slotitemCount)
    }
  }

  /**
   * 
   * @param ships 
   * @param itemInfo 
   * @returns 
   */
  private calDaihatuBonus(itemInfo: SlotitemCount): number {
    return calcDaihatuBonus(itemInfo)
  }

  /**
   *
   */
  public isShipTypeClear(result: ShipTypeCountsResult): boolean {
    return isShipTypeClear(result)
  }
}

export const MissionStuff = new MissionStuffImpl()
