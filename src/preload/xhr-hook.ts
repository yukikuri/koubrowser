import * as kcsapi from '@common/kcsapi'
import * as kcsapi_hook from '@common/kcsapi_hook'
import { Env } from '@common/env'

let serverId = kcsapi.getServerId(window.location.href);
//console.log('xhr-hook >> contextIsolated:', process.contextIsolated, 'href:', window.location.href, 'serverId:', serverId);
if (serverId) {
  const { ipcRenderer } =  require('electron');

  // send server id
  ipcRenderer.send(kcsapi_hook.HookedType.serverid, kcsapi_hook.toServerId(serverId));

  // 元の XMLHttpRequest を保存
  const OriginalXHR = window.XMLHttpRequest;

  
  // ラッパークラスを作成
  class MyXHR extends OriginalXHR {

    private _api: kcsapi.Api | undefined;
    private _method = ''
    private _openUrl = '';
    private _sendBody: Document | XMLHttpRequestBodyInit | null | undefined;

    constructor() {
      super();

      // リクエスト送信、内容をメインプロセスに通知
      this.addEventListener("loadstart", () => {
        //console.log("[XHR Start] openUrl", this._openUrl, 'method:', this._method, 'api:', this._api);
        
        let body;
        if (typeof this._sendBody === 'string') {
          if (this._api || Env.isDevelopment)
          body = this._sendBody.toString()
        }

        if (this._api) {
          ipcRenderer.send(
            kcsapi_hook.HookedType.loadstart, kcsapi_hook.toLoadStart(this._api, this._method, body)
          );
        } else {
          if (kcsapi.isKcsapi( this._openUrl) && Env.isDevelopment) {
            // unknown api
            ipcRenderer.send(
              kcsapi_hook.HookedType.unk_loadstart, kcsapi_hook.toUnknownLoadStart(
                this._openUrl, this._method, body)
            );
          }
        }

      });

      // レスポンス受信時、メインプロセスに通知
      this.addEventListener("loadend", () => {
        const type = typeof this.response;
        const length = type === 'string' ? this.response.length : (this.response?.byteLength ?? -1);
        //console.log("[XHR End]", this.status, this.responseURL, this.responseType, type, length, 'api:', this._api);

        let response;
        if (type === 'string') {
          if (this._api || Env.isDevelopment) {
            response = this.responseText;
          }
        }

        if (this._api) {
          ipcRenderer.send(
            kcsapi_hook.HookedType.loadend, kcsapi_hook.toLoadEnd(this._api, this._method, response)
          );
        } else {
          if (kcsapi.isKcsapi(this._openUrl) && Env.isDevelopment) {
            // unknown api
            ipcRenderer.send(
              kcsapi_hook.HookedType.unk_loadend, kcsapi_hook.toUnknownLoadEnd(
                this._openUrl, this._method, response)
            );
          }
        }
      });
    }

    // open メソッドをオーバーライドしてリクエスト内容を監視
    open(method: string, url: string | URL, async = true, user?: string, password?: string): void {
      const urlString = url.toString();
      this._api = kcsapi.getApi(urlString);
      // console.log(`[XHR Open] ${method} ${url}`, 'api:', this._api);
      if (kcsapi.isKcsapi(urlString)) {
        this._method = method;
        this._openUrl = urlString;
      }
      super.open(method, url, async, user, password);
    }

    // send メソッドをオーバーライド
    send(body?: Document | XMLHttpRequestBodyInit | null): void {
      // console.log("[XHR Send] url:", this._openUrl, 'method:', this._method, 
      //   'api:', this._api, 'body type:', typeof body);
      if (kcsapi.isKcsapi(this._openUrl)) {
        this._sendBody = body;
      }
      super.send(body);
    }
  }

  window.XMLHttpRequest = MyXHR as any;
  console.log('xhr-hook set <<', window.location.href, 'serverId:', serverId);
}
