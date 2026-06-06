import { reactive, toRaw, watch, ref } from 'vue'
import { defaultGlobalSetting, type GlobalSetting } from '@common/global_setting'
export const globalSetting: GlobalSetting = reactive(
  defaultGlobalSetting()
)

let preventSave = false;

// 更新抑止フラグ解除のために強制でwatchを呼び出すためのref
const forWatchCall = ref(0)

const syncHandle = watch(
  () => [globalSetting, forWatchCall.value],
  () => {
    console.log('global setting changed >> prevent save:', preventSave, globalSetting)
    if (preventSave) {
      preventSave = false;
    } else {
      window.api.saveGlobalSetting(toRaw(globalSetting))
    }
    console.log('global setting changed << ')
  },
  { deep: true }
)

export function setGlobalSettingWithPreventSave(setting: GlobalSetting) {
  console.log('setGlobalSettingWithPreventSave >> prevent save:', preventSave, setting)
  preventSave = true;
  forWatchCall.value++;
  syncHandle.pause()
  Object.assign(globalSetting, setting)
  syncHandle.resume()
  console.log('setGlobalSettingWithPreventSave << preventSave:', preventSave, setting)
}
