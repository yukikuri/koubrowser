import { svdata } from "@renderer/store/svdata"
import { computed, ref } from "vue"

const appSettingOk = ref(false)

export function setAppSettingOk(ok: boolean) {
  appSettingOk.value = ok
}

export const isAppReady = computed((): boolean => {
  return appSettingOk.value && svdata.isMstDataOk
})
