import { reactive } from 'vue'
import { type ApiQuestList } from '@common/kcs'
export const questList: ApiQuestList = reactive({
  api_count: 0,
  api_completed_kind: 0,
  api_list: [],
  api_exec_count: 0,
  api_exec_type: 0,
})
