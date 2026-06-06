export interface FixPiePos {
  modX: number
  modY: number
}

export type FixPiePosCellMap = {
  isSmall?: boolean
  // cell no -> fix pos
  cells: Map<number, FixPiePos> 
}

// area_id * 10 + area_no -> FixPiePosCellMap
export type FixPiePosAreaMap = Map<number, FixPiePosCellMap> 

const fixPiePosAreaMap: FixPiePosAreaMap = new Map([
  [
    12,
    {
      cells: new Map([
        [1, { modX: 5, modY: 60 }],
        [3, { modX: 0, modY: 55 }],
        [4, { modX: 60, modY: 20 }],
        [5, { modX: 5, modY: 65 }]
      ])
    }
  ],
  [
    13,
    {
      cells: new Map([
        [3, { modX: 0, modY: 55 }],
        [10, { modX: 0, modY: 60 }]
      ])
    }
  ],
  [
    14,
    {
      cells: new Map([
        [4, { modX: 0, modY: 55 }],
        [8, { modX: 0, modY: 55 }],
        [9, { modX: 60, modY: 25 }],
        [10, { modX: 30, modY: 75 }],
        [12, { modX: 50, modY: 0 }]
      ])
    }
  ],
  [
    15,
    {
      cells: new Map([
        [3, { modX: -5, modY: 45 }],
        [4, { modX: -10, modY: 45 }],
        [5, { modX: 60, modY: 45 }],
        [6, { modX: 25, modY: -10 }],
        [8, { modX: 0, modY: 55 }],
        [9, { modX: 25, modY: -10 }],
        [10, { modX: 0, modY: 55 }]
      ])
    }
  ],
  [
    16,
    {
      cells: new Map([
        [2, { modX: 65, modY: 30 }],
        [3, { modX: 0, modY: 55 }],
        [6, { modX: 60, modY: 55 }],
        [9, { modX: 55, modY: 10 }],
        [11, { modX: 30, modY: -15 }],
        [12, { modX: 60, modY: 10 }]
      ])
    }
  ],
  [
    21,
    {
      cells: new Map([
        [3, { modX: 0, modY: 55 }],
        [4, { modX: 0, modY: 55 }],
        [8, { modX: 0, modY: 55 }]
      ])
    }
  ],
  [
    22,
    {
      cells: new Map([
        [2, { modX: 0, modY: 55 }],
        [4, { modX: 0, modY: 55 }],
        [5, { modX: 5, modY: -10 }],
        [11, { modX: 0, modY: 55 }]
      ])
    }
  ],
  [
    23,
    {
      cells: new Map([
        [1, { modX: 0, modY: 55 }],
        [5, { modX: 5, modY: 55 }],
        [6, { modX: -10, modY: 40 }],
        [10, { modX: 20, modY: -10 }],
        [11, { modX: 25, modY: 70 }],
        [14, { modX: 10, modY: 65 }]
      ])
    }
  ],
  [
    24,
    {
      cells: new Map([
        [2, { modX: 0, modY: 55 }],
        [5, { modX: 0, modY: 55 }],
        [6, { modX: 60, modY: 20 }],
        [9, { modX: 10, modY: 65 }],
        [12, { modX: -5, modY: 50 }],
        [13, { modX: 55, modY: 15 }],
        [16, { modX: 40, modY: -15 }]
      ])
    }
  ],
  [
    25,
    {
      cells: new Map([
        [2, { modX: -15, modY: 25 }],
        [3, { modX: 0, modY: 55 }],
        [5, { modX: -10, modY: 10 }],
        [6, { modX: 60, modY: 55 }],
        [10, { modX: -10, modY: 10 }],
        [12, { modX: 25, modY: 72 }],
        [15, { modX: 65, modY: 20 }]
      ])
    }
  ],
  [
    31,
    {
      cells: new Map([
        [3, { modX: 15, modY: 65 }],
        [6, { modX: 0, modY: 55 }],
        [7, { modX: 0, modY: -5 }]
      ])
    }
  ],
  [
    32,
    {
      cells: new Map([
        [3, { modX: 0, modY: 50 }],
        [10, { modX: 0, modY: 55 }],
        [11, { modX: 0, modY: 55 }],
        [12, { modX: 55, modY: 0 }]
      ])
    }
  ],
  [
    33,
    {
      cells: new Map([
        [1, { modX: 0, modY: 55 }],
        [2, { modX: 0, modY: 55 }],
        [5, { modX: 55, modY: 10 }],
        [7, { modX: -5, modY: 50 }],
        [11, { modX: 25, modY: 70 }],
        [13, { modX: 55, modY: 0 }]
      ])
    }
  ],
  [
    34,
    {
      cells: new Map([
        [2, { modX: 5, modY: 55 }],
        [7, { modX: 55, modY: 0 }],
        [8, { modX: 0, modY: 55 }],
        [16, { modX: 55, modY: 0 }]
      ])
    }
  ],
  [
    35,
    {
      cells: new Map([
        [4, { modX: 5, modY: 55 }],
        [5, { modX: 5, modY: 55 }],
        [6, { modX: 50, modY: 70 }],
        [7, { modX: 50, modY: 70 }],
        [8, { modX: 15, modY: -5 }],
        [11, { modX: 55, modY: 0 }]
      ])
    }
  ],
  [
    41,
    {
      cells: new Map([
        [1, { modX: -10, modY: 25 }],
        [3, { modX: 5, modY: 55 }],
        [4, { modX: 5, modY: 55 }],
        [7, { modX: 5, modY: 55 }],
        [8, { modX: 5, modY: -5 }],
        [10, { modX: 35, modY: 75 }]
      ])
    }
  ],
  [
    42,
    {
      cells: new Map([
        [1, { modX: 45, modY: -5 }],
        [2, { modX: 5, modY: 60 }],
        [3, { modX: 65, modY: 50 }],
        [4, { modX: 5, modY: 60 }],
        [5, { modX: -10, modY: 30 }],
        [8, { modX: 5, modY: 60 }],
        [12, { modX: 65, modY: 55 }]
      ])
    }
  ],
  [
    43,
    {
      cells: new Map([
        [1, { modX: 45, modY: -5 }],
        [3, { modX: 60, modY: 60 }],
        [4, { modX: 25, modY: -10 }],
        [6, { modX: 60, modY: 60 }],
        [7, { modX: 10, modY: -5 }],
        [8, { modX: 10, modY: 65 }],
        [9, { modX: 10, modY: -5 }],
        [12, { modX: -10, modY: 35 }],
        [14, { modX: 5, modY: -5 }]
      ])
    }
  ],
  [
    44,
    {
      cells: new Map([
        [1, { modX: 55, modY: 5 }],
        [2, { modX: 10, modY: 60 }],
        [5, { modX: 5, modY: 60 }],
        [7, { modX: 60, modY: 25 }],
        [11, { modX: 10, modY: 60 }]
      ])
    }
  ],
  [
    45,
    {
      cells: new Map([
        [4, { modX: 55, modY: 5 }],
        [8, { modX: 60, modY: 45 }],
        [11, { modX: 0, modY: 55 }],
        [20, { modX: 15, modY: -10 }]
      ])
    }
  ],
  [
    51,
    {
      cells: new Map([
        [2, { modX: 15, modY: -10 }],
        [4, { modX: 0, modY: 55 }],
        [5, { modX: 20, modY: 72 }],
        [6, { modX: 25, modY: -10 }],
        [7, { modX: 5, modY: 65 }],
        [10, { modX: 55, modY: 5 }]
      ])
    }
  ],
  [
    52,
    {
      cells: new Map([
        [3, { modX: 45, modY: 75 }],
        [4, { modX: 45, modY: 0 }],
        [5, { modX: 45, modY: 75 }],
        [6, { modX: 45, modY: 0 }],
        [15, { modX: 5, modY: 65 }]
        //[15, { modX: 0, modY: 55 }],
      ])
    }
  ],
  [
    53,
    {
      cells: new Map([
        [11, { modX: 25, modY: 70 }],
        [14, { modX: 45, modY: 0 }],
        [16, { modX: 25, modY: 70 }],
        [17, { modX: -10, modY: 45 }]
      ])
    }
  ],
  [
    54,
    {
      cells: new Map([
        [3, { modX: -10, modY: 20 }],
        [5, { modX: 25, modY: -10 }],
        [6, { modX: 0, modY: 50 }],
        [8, { modX: 45, modY: -5 }],
        [10, { modX: 35, modY: 70 }],
        [12, { modX: 0, modY: 50 }],
        [16, { modX: 50, modY: 0 }]
      ])
    }
  ],
  [
    55,
    {
      cells: new Map([
        [2, { modX: 5, modY: 60 }],
        [3, { modX: -5, modY: 50 }],
        [7, { modX: 5, modY: 60 }],
        [8, { modX: 5, modY: 65 }],
        [11, { modX: -10, modY: 35 }],
        [13, { modX: 60, modY: 60 }],
        [16, { modX: 25, modY: -10 }],
        [19, { modX: 50, modY: 0 }]
      ])
    }
  ],
  [
    56,
    {
      isSmall: true,
      cells: new Map([
        [2, { modX: 5, modY: 45 }],
        [3, { modX: 5, modY: 45 }],
        [6, { modX: 5, modY: 45 }],
        [7, { modX: 35, modY: 0 }],
        [8, { modX: 50, modY: 10 }],
        [11, { modX: 10, modY: 55 }],
        [18, { modX: 40, modY: 0 }],
        [21, { modX: 15, modY: 2 }],
        [23, { modX: 10, modY: 50 }],
        [25, { modX: 0, modY: 40 }],
        [27, { modX: 60, modY: 25 }],
        [30, { modX: 10, modY: 5 }],
        [38, { modX: 5, modY: 40 }],
        [41, { modX: 10, modY: 50 }],
        [43, { modX: 60, modY: 25 }]
      ])
    }
  ],
  [
    61,
    {
      cells: new Map([
        [5, { modX: 40, modY: -5 }],
        [7, { modX: 65, modY: 15 }],
        [8, { modX: 10, modY: 65 }],
        [11, { modX: 50, modY: 0 }]
      ])
    }
  ],
  [
    62,
    {
      cells: new Map([
        [2, { modX: -10, modY: 45 }],
        [5, { modX: -5, modY: 45 }],
        [9, { modX: -5, modY: 45 }],
        [10, { modX: 60, modY: 55 }],
        [11, { modX: 65, modY: 20 }]
      ])
    }
  ],
  [
    63,
    {
      cells: new Map([
        [2, { modX: -8, modY: 25 }],
        [3, { modX: -5, modY: 45 }],
        [4, { modX: 72, modY: 25 }],
        [5, { modX: -8, modY: 22 }],
        [6, { modX: -5, modY: 45 }],
        [10, { modX: 50, modY: 0 }]
      ])
    }
  ],
  [
    64,
    {
      cells: new Map([
        [2, { modX: 0, modY: 50 }],
        [3, { modX: 0, modY: 50 }],
        [5, { modX: 55, modY: 10 }],
        [6, { modX: 0, modY: 55 }],
        [7, { modX: 45, modY: -5 }],
        [9, { modX: 45, modY: -5 }],
        [10, { modX: 60, modY: 30 }],
        [11, { modX: 70, modY: 50 }],
        [13, { modX: 70, modY: 50 }],
        [14, { modX: -15, modY: 25 }]
      ])
    }
  ],
  [
    65,
    {
      cells: new Map([
        [1, { modX: 0, modY: 55 }],
        [2, { modX: 0, modY: 55 }],
        [3, { modX: 20, modY: -10 }],
        [4, { modX: 20, modY: -10 }],
        [5, { modX: 15, modY: -5 }],
        [6, { modX: 0, modY: 55 }],
        [8, { modX: -5, modY: 0 }],
        [9, { modX: 0, modY: 55 }],
        [10, { modX: 45, modY: 70 }],
        [13, { modX: 50, modY: 0 }]
      ])
    }
  ],
  [
    71,
    {
      cells: new Map([
        [2, { modX: 0, modY: 55 }],
        [3, { modX: -5, modY: 10 }],
        [4, { modX: -5, modY: 55 }],
        [7, { modX: 50, modY: 0 }],
        [8, { modX: -5, modY: 55 }]
      ])
    }
  ],
  [
    72,
    {
      cells: new Map([
        [2, { modX: 0, modY: 55 }],
        [3, { modX: 20, modY: -10 }],
        [5, { modX: 63, modY: 40 }],
        [10, { modX: 5, modY: 60 }],
        [15, { modX: 50, modY: 0 }]
      ])
    }
  ],
  [
    73,
    {
      cells: new Map([
        [2, { modX: 25, modY: 70 }],
        [3, { modX: 50, modY: 0 }],
        [4, { modX: 25, modY: -10 }],
        [5, { modX: 5, modY: 65 }],
        [15, { modX: -10, modY: 20 }],
        [16, { modX: 0, modY: 55 }],
        [18, { modX: -15, modY: 10 }]
      ])
    }
  ],
  [
    74,
    {
      cells: new Map([
        [3, { modX: 0, modY: 55 }],
        [4, { modX: 0, modY: 55 }],
        [5, { modX: 25, modY: -15 }],
        [8, { modX: 0, modY: 55 }],
        [10, { modX: -10, modY: 25 }],
        [11, { modX: -10, modY: 25 }],
        [12, { modX: 50, modY: 0 }],
        [13, { modX: 0, modY: 55 }],
        [16, { modX: 50, modY: 0 }]
      ])
    }
  ],
  [
    75,
    {
      cells: new Map([
        [1, { modX: 65, modY: 30 }],
        [2, { modX: 55, modY: 50 }],
        [4, { modX: 35, modY: -10 }],
        [7, { modX: 25, modY: 65 }],
        [10, { modX: 35, modY: -10 }],
        [14, { modX: 5, modY: 55 }],
        [15, { modX: 60, modY: 50 }],
        [19, { modX: -15, modY: 25 }],
        [24, { modX: -15, modY: 25 }]
      ])
    }
  ]
])

export function getFixPiePosByMapId(map_id: number, cell_no: number): FixPiePos | undefined {
  const cellMap = fixPiePosAreaMap.get(map_id)
  if (cellMap) {
    return cellMap.cells.get(cell_no)
  }
  return
}

export function getFixPiePos(area_id: number, area_no: number, cell_no: number): FixPiePos | undefined {
  return getFixPiePosByMapId(area_id * 10 + area_no, cell_no)
}

export function isSmallPieMapId(map_id: number): boolean {
  return fixPiePosAreaMap.get(map_id)?.isSmall ?? false
}

export function isSmallPie(area_id: number, area_no: number): boolean {
  return isSmallPieMapId(area_id * 10 + area_no)
}
