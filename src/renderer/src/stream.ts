import { MainMessage } from '@common/channel'
import type { 
  Message, 
  MessageType, 
  RequiredMessage,
  ApiReqMessage, 
  ApiResMessage, 
} from '@common/message'
import { svdata } from '@renderer/store/svdata'
import { quests } from '@renderer/store/quests'
import { missionList } from '@renderer/store/missionList'
import { questList } from '@renderer/store/questList'
import { replaceArray } from '@common/ts'
import { setAppSettingWithPreventSave } from '@renderer/store/app_setting'
import { setAppSettingOk } from './stuff/app_ready'
import { mapInfo } from '@renderer/store/mapinfo'
import { setGlobalSettingWithPreventSave } from '@renderer/store/global_setting'
import { GlobalSetting } from '@common/global_setting'
import { AppSetting } from '@common/store'
import { Quest } from '@common/record'
import { updateFleetHps } from '@common/kcsbattle_util'

let requiredRecvedCallback: (()=> void) | null = null;

function onRequired(msg: RequiredMessage) {
  console.log('stream got required data >> is null:', msg.svdata === null)
  if (msg.svdata) {
    console.time('copy svdata')
    Object.assign(svdata.svdataRaw, msg.svdata);
    console.timeEnd('copy svdata')
  }
  console.log('stream got required data << ')

  onQuests(msg.quests);
  onGlobalSetting(msg.globalSetting);
  onAppSetting(msg.appSetting);

  console.log('stream got map info >> ', msg.mapInfo)
  Object.assign(mapInfo, msg.mapInfo)
  console.log('stream got map info << ')

  console.log('stream got mission list info >> ', msg.missionList)
  Object.assign(missionList, msg.missionList)
  console.log('stream got mission list info << ')

  console.log('stream got quest list info >> ', msg.questList)
  Object.assign(questList, msg.questList)
  console.log('stream got quest list info << ')

  if (requiredRecvedCallback) {
    requiredRecvedCallback();
    requiredRecvedCallback = null;
  }
}

function onApiReq(msg: ApiReqMessage) {
  console.log('stream got api req >> ', 'api:', msg.api)
  svdata.setReq(msg.api, msg.data)
  console.log('stream got api req << ', 'api:', msg.api)
}

function onApiRes(msg: ApiResMessage) {
  console.log('stream got api res >> ', 'api:', msg.api, 'additional:', !!msg.additional)
  svdata.update(msg.api, msg.data)

  // API受信情報により追加の処理を行う場合
  if (msg.additional) {
    const additional = msg.additional;

    // 出撃ユニークID設定
    if (additional.mapStartUuid && svdata.prvBattleMapInfo) {
      svdata.prvBattleMapInfo.uuid = additional.mapStartUuid;
      console.log('map start uuid set in renderer:', additional.mapStartUuid);
    }

    // 戦闘結果で味方HPを更新する場合
    if (additional.afterBattleFleetHps) {
      console.log('updateFleetHps requested in renderer');
      updateFleetHps(svdata, additional.afterBattleFleetHps);
    }
  }
  console.log('stream got api res << ', 'api:', msg.api)
}

function onQuests(list: Quest[]) {
  console.log('stream got quests >> ')
  replaceArray(quests.list, list)
  console.log('stream got quests << ')
}

function onAppSetting(setting: AppSetting) {
  console.log('stream got app setting >> ', setting)
  setAppSettingOk(true);
  setAppSettingWithPreventSave(setting);
  console.log('stream got mission setting << ')
}

function onGlobalSetting(setting: GlobalSetting) {
  console.log('stream got global setting >> ', setting)
  setGlobalSettingWithPreventSave(setting);
  console.log('stream got global setting << ')
}

let port: MessagePort | null = null;
export function streamInitialize(cb: ()=> void) {
  requiredRecvedCallback = cb;

  // recv stream port from main
  const ipcRenderer = window.electron.ipcRenderer
  ipcRenderer.on(MainMessage.stream_port, (e)=> {
    console.log('stream port recv in renderer', e);
    port = e.ports[0];
    port.addEventListener('close', () => {
      console.log('main port closeed(renderer proress recved event)')
      port = null;
    });
    
    // start listening port message
    port.onmessage = (ev) => {
      const data: Message<MessageType> = ev.data;
      console.log('recv stream message in renderer. type:', data.type);
      switch(data.type) {

        case 'required':
          onRequired(data);
          break;

        case 'api_req':
          onApiReq(data);
          break;

        case 'api_res':
          onApiRes(data);
          break;

        case 'quests':
          onQuests(data.quests);
          break;

        case 'app_setting':
          onAppSetting(data.setting);
          break;

        case 'global_setting':
          onGlobalSetting(data.setting);
          break;

        default:
          console.log('port message(unknown)', data);
          break;
      }

    };

    // request required data
    window.api.requestRequiredData();
    console.log('required data requested');
  })
}
