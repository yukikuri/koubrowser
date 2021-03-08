import Vue from 'vue';
import RouterView from '@/renderer/views/Router.vue';
import router from '@/renderer/router/router';
import Buefy from 'buefy';
//import 'roboto-fontface/css/roboto/roboto-fontface.css'
import '@mdi/font/css/materialdesignicons.css';
import { ipcRenderer } from 'electron';
import { AssistChannel, MainChannel, IpcSvData } from '@/lib/app';
import { AppStuff } from '@/lib/app'
import { NotifyData } from '@/lib/kcs';
import { svdata } from '@/renderer/store/svdata';
import { quests } from '@/renderer/store/quests';
import { replaceArray } from '@/lib/ts';
import { ChartStuff } from '@/renderer/components/chart/stuff';
import 'buefy/dist/buefy.min.css';
import '@/renderer/assist.scss';

//すべての Vue のログと警告を抑制します。
Vue.config.silent = AppStuff.isProduction;
Vue.config.performance = AppStuff.isProduction;
Vue.config.productionTip =  false;

ChartStuff.initialize();

console.log('assist main start');

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


Vue.use(Buefy)
new Vue({
  router,
  render: h => h(RouterView),
  created: () => {
    ipcRenderer.invoke(MainChannel.get_sv_data).then((data: IpcSvData) => {
      svdata.setFromJson(data.json_sv_data);
      replaceArray(quests.list, data.quests);
    });
  },
}).$mount('#app')
