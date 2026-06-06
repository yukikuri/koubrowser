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
  console.log('stream got api req >> ')
  svdata.setReq(msg.api, msg.data)
  console.log('stream got api req << ')
}

function onApiRes(msg: ApiResMessage) {
  console.log('stream got api res >> ')
  svdata.update(msg.api, msg.data)
  if (msg.uuid && svdata.prvBattleMapInfo) {
    svdata.prvBattleMapInfo.uuid = msg.uuid;
    console.log('map start uuid set in renderer:', msg.uuid);
  }
  console.log('stream got api res << ')
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
