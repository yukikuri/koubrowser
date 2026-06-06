import { reactive } from 'vue'
import { type ApiMapInfoList} from '@common/kcs'
export const mapInfo: ApiMapInfoList = reactive(
  { api_map_info: [], 
    api_air_base:[],
    api_air_base_expanded_info: []
  }
)
