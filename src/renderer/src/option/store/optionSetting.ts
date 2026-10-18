import { normalizeLanguage } from '@common/i18n'
import { reactive, toRaw, watch, ref } from 'vue'
import { type OptionData, type OptionSetting, type OptionViewInfo, type QuestSchemaCheckState, defaultOptionSetting, defaultQuestSchemaCheckState } from '@common/option'
export const optionSetting: OptionSetting = reactive(
  defaultOptionSetting()
)

// mainからの確認結果通知で更新する。設定保存のwatch対象には含めない。
export const optionViewInfo: OptionViewInfo = reactive({
  defaultCaptureSavePath: '',
  ...defaultQuestSchemaCheckState()
})

export function setQuestSchemaCheckState(state: QuestSchemaCheckState): void {
  Object.assign(optionViewInfo, state)
}

/////////////////////////////////////////////////////////////////////////////////////
// デバッグログ
const DEBUG = 0;

const debug = (...args: unknown[]): void => {
  if (DEBUG) console.debug("[Store/OptionSetting]", ...args);
};

/////////////////////////////////////////////////////////////////////////////////////
// 
let preventSave = false;

// 更新抑止フラグ解除のために強制でwatchを呼び出すためのref
const forWatchCall = ref(0)

const syncHandle = watch(
  () => [optionSetting, forWatchCall.value],
  () => {
    debug('setting changed >> prevent save:', preventSave, optionSetting)
    if (preventSave) {
      preventSave = false;
    } else {
      window.optionApi.saveSetting(toRaw(optionSetting))
    }
    debug('setting changed << ')
  },
  { 
    deep: true,
    // DOM更新前にwatch実施
    // 更新抑止動作がおかしくなることからsyncは指定しないこと
    flush: 'pre'
  }
)

/**
 * 更新抑止動作説明
 * watch()は同じ値を更新した場合呼ばれない
 * forWatchCallを更新することで強制でwatch()を呼ぶ
 * watch()を強制で呼び出すことで更新抑止フラグを解除する
 * 
 * forWatchCall更新によりwatch()呼び出しが行われることから
 * syncHandle.pause()、syncHandle.resume()によりsetting自体のwatch()呼び出しを抑止する
 * 
 * @param setting 
 */
export function setOptionSettingWithPreventSave(data: OptionData): void {
  debug('set prevent save >> preventSave:', preventSave, data)
  preventSave = true;
  forWatchCall.value++;

  // set setting
  syncHandle.pause()
  Object.assign(optionSetting, { ...data.setting, language: normalizeLanguage(data.setting.language) })
  syncHandle.resume()

  // set view info
  Object.assign(optionViewInfo, data.viewInfo)

  debug('set prevent save << preventSave:', preventSave, data)
}
