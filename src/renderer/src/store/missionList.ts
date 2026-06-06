import { reactive } from 'vue'
import { type ApiMissionList } from '@common/kcs'
export const missionList: ApiMissionList = reactive({
  api_list_items: [],
  api_limit_time: [],
})
