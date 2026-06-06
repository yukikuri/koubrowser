import { MainMessage } from "@common/channel";
import { Message, MessageType } from "@common/message";
import { MessageChannelMain, MessagePortMain, WebContents } from "electron";

export interface PortInfo { 
  webContents: WebContents;
  port: MessagePortMain;
}

/**
 * 
 */
class StreamManager {
  private ports_: PortInfo[] = [];

  connect(webContents: WebContents): void {

    // 既に接続済みの場合、切断する
    this.disconnect(webContents)

    // ストリームポートを渡す
    const { port1, port2 } = new MessageChannelMain()
    this.ports_.push({ webContents, port: port1 })
    webContents.on('destroyed', () => this.disconnect(webContents))

    // ポートの所有権を移譲する
    // 移譲したポートはmainで閉じる必要ない
    webContents.postMessage(MainMessage.stream_port, null, [port2])
  }

  disconnect(webContents: WebContents): void {
    const index = this.ports.findIndex((el) => el.webContents === webContents)
    console.log('remove port info destroyed id:', webContents.id, 
      'port index:', index, 
      'port:',  index < 0 ? '-' : 'connected')
    if (index !== -1) {
      const el = this.ports_[index]
      el.port?.close()
      this.ports_.splice(index, 1)
    }
  }
  
  get ports() {
    return this.ports_;
  }

  get webContentsList(): WebContents[] {
    return this.ports_.map((el) => el.webContents)
  }
      
  postToRenderers<T extends MessageType>(msg: Message<T>): void {
    this.ports_.forEach((el) => el.port.postMessage(msg))
  }

  postToRendererA<T extends MessageType>(webContents: WebContents, msg: Message<T>): void {
    const index = this.ports.findIndex((el) => el.webContents === webContents)
    console.log('port to: ', webContents.id, 
      'port index:', index, 
      'port:',  index < 0 ? '-' : 'connected')
    if (index !== -1) {
      const el = this.ports_[index]
      el.port.postMessage(msg)
    }
  }

  postToRendererOthers<T extends MessageType>(webContents: WebContents, msg: Message<T>): void {
    this.ports_.filter((el) => el.webContents !== webContents).forEach((el) => {
      console.log('post msg to id:', el.webContents.id, 'type:', msg.type)
      el.port.postMessage(msg)
    })
  }

}

export const streamManager = new StreamManager();
