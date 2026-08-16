export type SupportCodecs =
  // sound only or not capture sound.
  //'audio/webm',
  //'audio/webm;codecs=opus',
  //'audio/webm;codecs=pcm',
  //'video/webm' |
  //'video/webm;codecs=vp8,pcm' |
  | 'video/webm;codecs=vp8'
  | 'video/webm;codecs=vp9'
  | 'video/webm;codecs=vp8,opus'
  //'video/WEBM;codecs=VP8,OPUS' |
  | 'video/webm;codecs=vp9,opus'
  | 'video/webm;codecs=vp8,vp9,opus'
//types.forEach(type => console.log(type, MediaRecorder.isTypeSupported(type)));
//console.log(navigator.mediaDevices.getSupportedConstraints());

export type RectRate = {
  readonly left: number
  readonly top: number
  readonly width: number
  readonly height: number
}

export class Const {
  static readonly InGameAssistDisplayRequirementWidth = 1800
  static readonly InGameAssistDisplayRequirementHeight = 960
  static readonly GameWidth = 1200
  static readonly GameHeight = 720
  static readonly GameBarHeight = 40
  static readonly TitleBarHeight = 32
  static readonly MaxMedals = 33
  static readonly AssistBottomHeight = 202 - 34
  static readonly AssistWidth = 600
  static readonly AppUserModelId = 'com.koubrowser.app'
  static readonly ArgIsAssist = '--is-assist'
  static readonly ArgIsTestMode = '--is-test-mode'
  static readonly ArgIsInitMuted = '--is-init-muted'
  static readonly ArgAppLaunchId = '--app-launch-id' 
  static readonly GamePageUrl = 'https://www.dmm.com/netgame/feature/kancolle.html'

  // 大破進撃ブロック関連
  static readonly TaihaSingeki = {
    // 通常進撃ボタン配置箇所
    normalBlockRect: {
      left: 0.278,
      top: 0.428,
      width: 0.167,
      height: 0.206,
    },
    // 修理要員ボタン配置箇所
    repairBlockRect: {
      left: 0.252,
      top: 0.359,
      width: 0.248,
      height: 0.202,
    },
    // 女神ボタン配置箇所
    megamiBlockRect: {
      left: 0.260,
      top: 0.736,
      width: 0.241,
      height: 0.199,
    },
  } as const satisfies {
    readonly normalBlockRect: RectRate
    readonly repairBlockRect: RectRate
    readonly megamiBlockRect: RectRate
  }
}
