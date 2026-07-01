import { createApp } from 'vue'
import 'bulma/css/bulma.min.css'

import OptionApp from '@option/components/OptionApp.vue'
import '@assets/option.scss'
import { setOptionSetting } from '@option/store/optionSetting'
import { type OptionSetting, defaultOptionSetting } from '@common/option'

async function main(): Promise<void> {
  let setting: OptionSetting
  let isError = false
  try {
    setting = await window.optionApi.getCurrentSetting()
  } catch (error) {
    console.error('Failed to get current setting:', error)
    setting = defaultOptionSetting()
    isError = true
  }
  setOptionSetting(setting)

  createApp(OptionApp, { isError }).mount('#option-app')
  await window.optionApi.readyToShow()
}

void main()
