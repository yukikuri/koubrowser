import { SupportCodecs } from '@common/const'
import { type OptionSetting } from '@common/option'

export class GameSetting {
  public zoom_factor: number = 1.0
  public topmost: boolean = false

  public capture_min_width: number = 1280
  public capture_max_width: number = 1280
  public capture_min_height: number = 720
  public capture_max_height: number = 720
  public capture_assist_width: number = 1800
  public capture_assist_height: number = 960

  public capture_codec: SupportCodecs = 'video/webm;codecs=vp9,opus'

  private assist_in_game: boolean = true
  private assist_restricted: boolean = false

  private taiha_singeki_block_enable: boolean = true
  private taiha_singeki_block_skip_safe_cell: boolean = true

  public get isAssistInGame(): boolean {
    return !this.assist_restricted && this.assist_in_game
  }

  public get assistInGame(): boolean {
    return this.assist_in_game
  }

  public setAssistInGame(inGame: boolean): void {
    this.assist_in_game = inGame
  }

  public get assistRestricted(): boolean {
    return this.assist_restricted
  }
  
  public setAssistRestricted(restricted: boolean): void {
    this.assist_restricted = restricted
  }

  public setTaihaSingekiBlockEnable(enable: boolean): void {
    this.taiha_singeki_block_enable = enable
  }

  public get taihaSingekiBlockEnable(): boolean {
    return this.taiha_singeki_block_enable
  }

  public setTaihaSingekiBlockSkipSafeCell(skip: boolean): void {
    this.taiha_singeki_block_skip_safe_cell = skip
  }

  public get taihaSingekiBlockSkipSafeCell(): boolean {
    return this.taiha_singeki_block_skip_safe_cell
  }

  /**
   * 
   * @param option 
   */
  public applyOptionSetting(option: OptionSetting): void {
    // 大破進撃防止
    this.setTaihaSingekiBlockEnable(option.taihaSingekiBlockEnable)
    // 大破進撃防止：安全マススキップ
    this.setTaihaSingekiBlockSkipSafeCell(option.taihaSingekiBlockSkipSafeCell)
  }
}
