import { reactive } from 'vue'
import { SvData, SvDataRaw, createSvDataRaw } from '@common/kcs'
const svdataRaw: SvDataRaw = createSvDataRaw()
export const svdata: SvData = new SvData(reactive(svdataRaw))
