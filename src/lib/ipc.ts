import { WebContents } from 'electron'

export class IpcObject<T extends object> {
  private ticked: boolean;
  public value: T;
  public webContents: WebContents | undefined;
  private channel: string;

  constructor(target: T, channel: string) {
    this.value = target;
    this.ticked = false;
    this.channel = channel;
  }

  public set(target: T, p: PropertyKey, value: any, receiver: any): boolean {
    if (! this.ticked) {
      if (this.webContents) {
        this.ticked = true;
        process.nextTick(() => {
          this.webContents?.send(this.channel, this.value);
          this.ticked = false;
        });
      }
    }
    return Reflect.set(target, p, value, receiver);
  }

  public get(target: T, p: PropertyKey, receiver: any): any {
    return Reflect.get(target, p, receiver);
  }
}
