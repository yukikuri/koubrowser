import { IpcObject } from '@main/ipc'
import { GameSetting } from '@common//setting'
import { GameChannel } from '@common/channel'

const gameSetting_ = new GameSetting()
export const gameSettingProxy = new IpcObject<GameSetting>(gameSetting_, GameChannel.set_game_setting)
export const gameSetting = new Proxy(gameSetting_, gameSettingProxy)
