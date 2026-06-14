import { GameChannel } from '@common/channel'
import { GameSetting } from '@common/setting'
import { AppState } from '@common/state'
import { gameState } from '@renderer/store/gamestate'
import { gameSetting } from '@renderer/store/gamesetting'
import { createApp } from 'vue'
import Buefy from 'buefy'
import App from '@renderer/App.vue'
import { Env } from '@common/env'
import { appState } from '@global/appstate'
import 'bulma/css//bulma.min.css'
import 'buefy/dist/css/buefy.min.css'
import '@assets/main.scss'
import '@assets/assist.scss'
//import 'bulma/css//bulma.css';
//import 'buefy/dist/css/buefy.css';
//import '@mdi/font/css/materialdesignicons.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { streamInitialize } from '@renderer/stream'
import { EnvRenderer } from './common/env-renderer'

// if assist window change title
if (EnvRenderer.isAssist) {
  document.title = '甲ブラウザ アシストウィンドウ';
}

// ボタン状態はアプリコンポ表示前に反映させておく
if (EnvRenderer.isInitMuted) {
  gameState.muted = true
}

streamInitialize(async () => {

  // initialized svdata. start vue app.
  const app = createApp(App)

  // prevent vue warning/error in production
  if (Env.isProduction) {
    app.config.errorHandler = (_err, _vm, _info) => {}
    app.config.warnHandler = (_msg, _vm, _info) => {}
  }
  app.config.performance = Env.isDevelopment
  app.use(Buefy)
  app.mount('#app')
});

const ipcRenderer = window.electron.ipcRenderer

ipcRenderer.on(GameChannel.set_game_setting, (_event, setting: GameSetting) => {
  console.log(GameChannel.set_game_setting, setting)
  Object.assign(gameSetting, setting)
})

ipcRenderer.on(GameChannel.set_app_state, (_event, state: AppState) => {
  console.log(GameChannel.set_app_state, state)
  Object.assign(appState, state)
})

//console.log('process env', process.env);

console.log('rederder ready')
//console.log(window.location);
//console.log(process.argv);
window.api.rendererReady()
ipcRenderer.on(GameChannel.resume, () => {
  console.log(GameChannel.resume)
})
