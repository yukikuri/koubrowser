import { createApp } from 'vue'
import 'bulma/css/bulma.min.css'
import '@assets/option.scss'

import OptionApp from '@option/components/OptionApp.vue'
import { setOptionSettingWithPreventSave } from '@option/store/optionSetting'
import { type OptionData, defaultOptionSetting } from '@common/option'

async function main(): Promise<void> {
  let data: OptionData
  let isError = false
  try {
    data = await window.optionApi.getCurrentSetting()
  } catch (error) {
    console.error('Failed to get current setting:', error)
    data = {
      setting: defaultOptionSetting(),
      viewInfo: {
        defaultCaptureSavePath: ''
      }
    }
    isError = true
  }
  setOptionSettingWithPreventSave(data)

  createApp(OptionApp, { isError }).mount('#option-app')
  await window.optionApi.readyToShow()
}

void main()
