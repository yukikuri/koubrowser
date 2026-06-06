import { reactive } from 'vue'
interface MapImgCtx {
  [key: string]: number | undefined
}
const mapImgCtxKey = (area_id: number, area_no: number): string => {
  return `${area_id}`.padStart(3, '0') + '_' + `${area_no}`.padStart(2, '0')
}
export const mapImgCtx: MapImgCtx = reactive({})

export const setMapImgCtx = (area_id: number, area_no: number, ctx: number) => {
  mapImgCtx[mapImgCtxKey(area_id, area_no)] = ctx
}
export const getMapImgCtx = (area_id: number, area_no: number): number | undefined => {
  return mapImgCtx[mapImgCtxKey(area_id, area_no)]
}
