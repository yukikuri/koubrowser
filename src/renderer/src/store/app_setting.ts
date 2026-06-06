import { reactive, toRaw, watch, ref } from 'vue'
import { defaultAppSetting, type AppSetting } from '@common/store'
export const appSetting: AppSetting = reactive(
  defaultAppSetting()
)

let preventSave = false;

// 更新抑止フラグ解除のために強制でwatchを呼び出すためのref
const forWatchCall = ref(0)

const syncHandle = watch(
  () => [appSetting, forWatchCall.value],
  () => {
    console.log('app setting changed >> prevent save:', preventSave, appSetting)
    if (preventSave) {
      preventSave = false;
    } else {
      window.api.saveAppSetting(toRaw(appSetting))
    }
    console.log('app setting changed << ')
  },
  { deep: true }
)

export function setAppSettingWithPreventSave(setting: AppSetting) {
  console.log('setAppSettingWithPreventSave >> prevent save:', preventSave, setting)
  preventSave = true;
  forWatchCall.value++;
  syncHandle.pause()
  Object.assign(appSetting, setting)
  syncHandle.resume()
  console.log('setAppSettingWithPreventSave << preventSave:', preventSave, setting)
}
