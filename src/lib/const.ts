
export type SupportCodecs = 
// sound only or not capture sound.
//'audio/webm',
//'audio/webm;codecs=opus',
//'audio/webm;codecs=pcm',
//'video/webm' |
//'video/webm;codecs=vp8,pcm' |
'video/webm;codecs=vp8' |
'video/webm;codecs=vp9' |
'video/webm;codecs=vp8,opus' |
//'video/WEBM;codecs=VP8,OPUS' |
'video/webm;codecs=vp9,opus' |
'video/webm;codecs=vp8,vp9,opus'
;
//types.forEach(type => console.log(type, MediaRecorder.isTypeSupported(type)));
//console.log(navigator.mediaDevices.getSupportedConstraints());

export class Const {

  public static readonly GameWidth = 1200;
  public static readonly GameHeight = 720;
  public static readonly GameBarHeight = 40;
  public static readonly TitleBarHeight = 32;

  public static readonly MaxMedals = 21;

  public static readonly AssistHeight = 202-34;
  public static readonly AssistWidth = 600;
}
