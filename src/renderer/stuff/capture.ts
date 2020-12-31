import { ipcRenderer, Rectangle, WebviewTag } from 'electron';
import { gameSetting } from '@/renderer/store/gamesetting';
import { MainChannel } from '@/lib/app';
import { Const } from '@/lib/const';

class CaptureStuff {
  public capture(webview: WebviewTag) {
    const date = new Date();
    const rect: Rectangle = {
      x: 0,
      y: Math.ceil(Const.GameBarHeight * gameSetting.zoom_factor),
      width:  Math.floor(Const.GameWidth * gameSetting.zoom_factor),
      height:  Math.floor(Const.GameHeight * gameSetting.zoom_factor),
    };
    console.log('capture stuff', rect, 'zoom-factor:', gameSetting.zoom_factor);
    webview.capturePage(rect).then((image: Electron.NativeImage) => {
      const buffer = image.toPNG();
      ipcRenderer.invoke(MainChannel.save_capture, date, buffer);
    });
  }
}
export const captureStuff = new CaptureStuff();
