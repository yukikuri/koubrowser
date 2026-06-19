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

export class Const {
  static readonly GameWidth = 1200
  static readonly GameHeight = 720
  static readonly GameBarHeight = 40
  static readonly TitleBarHeight = 32
  static readonly MaxMedals = 33
  static readonly AssistHeight = 202 - 34
  static readonly AssistWidth = 600
  static readonly AppUserModelId = 'com.koubrowser.app'
  static readonly ArgIsAssist = '--is-assist'
  static readonly ArgIsTestMode = '--is-test-mode'
  static readonly ArgIsInitMuted = '--is-init-muted'
  static readonly ArgAppLaunchId = '--app-launch-id' 
  static readonly GamePageUrl = 'https://www.dmm.com/netgame/feature/kancolle.html'
}
