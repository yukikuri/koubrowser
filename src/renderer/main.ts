import { ipcRenderer } from 'electron';
import { MainChannel, GameChannel, AssistChannel } from '@/lib/app';
import { GameSetting, AppState } from '@/lib/setting';
import { gameSetting } from '@/renderer/store/gamesetting';
import { svdata } from '@/renderer/store/svdata';
import { quests } from '@/renderer/store/quests';
import Vue from 'vue';
import Buefy from 'buefy';
import RouterView from '@/renderer/views/Router.vue';
import router from '@/renderer/router/router';
import { AppStuff } from '@/lib/app';
import { appState } from '@/global/appstate';
import { NotifyData } from '@/lib/kcs';
import { recorderStuff } from '@/renderer/stuff/recorder';
import { replaceArray } from '@/lib/ts';
import 'buefy/dist/buefy.min.css';
import '@/renderer/main.scss'
import '@/renderer/assist.scss'

//すべての Vue のログと警告を抑制します。
Vue.config.silent = AppStuff.isProduction;

Vue.config.performance = AppStuff.isProduction;
Vue.config.productionTip =  false
//console.log('process env', process.env);


ipcRenderer.on(AssistChannel.api_req, (event, data: NotifyData) => {
  console.log('AssistChannel', AssistChannel.api_req);
  svdata.setReq(data.api, data.data);
});

ipcRenderer.on(AssistChannel.api_res, (event, data: NotifyData) => {
  console.log('AssistChannel', AssistChannel.api_res);
  svdata.update(data.api, data.data);
});

ipcRenderer.on(AssistChannel.api_data, (event, data: string) => {
  console.log('AssistChannel', AssistChannel.api_data);
  svdata.setFromJson(data);
});

ipcRenderer.on(AssistChannel.quest_data, (event, data) => {
  console.log('AssistChannel', AssistChannel.quest_data);
  console.log(data);
  replaceArray(quests.list, data);
  console.log(quests);
});

Vue.use(Buefy);
new Vue({
  router,
  render: h => h(RouterView),
  created: () => {
    console.log('vue root created');    
    ipcRenderer.on(GameChannel.set_game_setting, 
      (event, setting: GameSetting) => {
        console.log(GameChannel.set_game_setting, setting);
        Object.assign(gameSetting, setting);
      });
    ipcRenderer.on(GameChannel.set_app_state, (event, state: AppState) => {
      console.log(GameChannel.set_app_state, state);
      Object.assign(appState, state);
    });
    ipcRenderer.invoke(MainChannel.main_ready);
    ipcRenderer.on(GameChannel.resume, () => {
      console.log(GameChannel.resume);
      recorderStuff.prepare();
    });
  },
}).$mount('#app')
