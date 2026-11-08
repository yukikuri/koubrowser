import { SupportCodecs } from '@common/const'
import { type OptionSetting } from '@common/option'

export class GameSetting {
  zoom_factor: number = 1.0
  topmost: boolean = false
  assist_window_visible: boolean = false

  capture_min_width: number = 1280
  capture_max_width: number = 1280
  capture_min_height: number = 720
  capture_max_height: number = 720
  capture_assist_width: number = 1800
  capture_assist_height: number = 960

  capture_codec: SupportCodecs = 'video/webm;codecs=vp9,opus'

  private assist_in_game: boolean = true
  private assist_restricted: boolean = false

  private taiha_singeki_block_enable: boolean = true
  private taiha_singeki_block_skip_safe_cell: boolean = true

  private nosaki_timer_enable: boolean = false

  get isAssistInGame(): boolean {
    return !this.assist_restricted && this.assist_in_game
  }

  get assistInGame(): boolean {
    return this.assist_in_game
  }

  setAssistInGame(inGame: boolean): void {
    this.assist_in_game = inGame
  }

  get assistRestricted(): boolean {
    return this.assist_restricted
  }
  
  setAssistRestricted(restricted: boolean): void {
    this.assist_restricted = restricted
  }

  setTaihaSingekiBlockEnable(enable: boolean): void {
    this.taiha_singeki_block_enable = enable
  }

  get taihaSingekiBlockEnable(): boolean {
    return this.taiha_singeki_block_enable
  }

  setTaihaSingekiBlockSkipSafeCell(skip: boolean): void {
    this.taiha_singeki_block_skip_safe_cell = skip
  }

  get taihaSingekiBlockSkipSafeCell(): boolean {
    return this.taiha_singeki_block_skip_safe_cell
  }

  get nosakiTimerEnable(): boolean {
    return this.nosaki_timer_enable
  }

  setNosakiTimerEnable(enable: boolean): void {
    this.nosaki_timer_enable = enable
  }

  /**
   * 
   * @param option 
   */
  applyOptionSetting(option: OptionSetting): void {
    // 大破進撃防止
    this.setTaihaSingekiBlockEnable(option.taihaSingekiBlockEnable)
    // 大破進撃防止：安全マススキップ
    this.setTaihaSingekiBlockSkipSafeCell(option.taihaSingekiBlockSkipSafeCell)
    // 野崎タイマー
    this.setNosakiTimerEnable(option.nosakiTimerEnable)
  }
}
