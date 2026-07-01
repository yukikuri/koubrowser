import { type OptionSetting, defaultOptionSetting } from '@common/option'
export const optionSetting: OptionSetting = defaultOptionSetting()

export function setOptionSetting(setting: OptionSetting): void {
  // 必要ならstructuredClone()に変更する
  // 現状浅いコピーで良い
  Object.assign(optionSetting, setting)
}
