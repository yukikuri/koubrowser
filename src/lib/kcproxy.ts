import { ProxyServer, DataStore } from '@/lib/proxy';
import { Api, ApiDataRoot, ApiResult, KcsUtil, SvData } from '@/lib/kcs';
import { svdata } from '@/main/svdata';
import { session } from 'electron'
import fs from 'fs';
import http from 'http';
import httpProxy from 'http-proxy';
import { AppStuff } from '@/lib/app';

let saved_count = 0;

type ProxyCallback = (api: Api, data: string) => void;

/**
 * 
 */
class KcProxy {
  private req_callback: ProxyCallback;
  private res_callback: ProxyCallback;
  private proxy_server: ProxyServer;
  private server_id_queryed: boolean;

  /**
   * 
   */
  constructor(req_callback: ProxyCallback, res_callback: ProxyCallback) {
    this.req_callback = req_callback;
    this.res_callback = res_callback;
    this.server_id_queryed = false;

    let port = 8890;
    console.log('check proxy port arg');
    console.dir(process.argv);
    const port_arg = process.argv.reduce((acc, v, index) => {
      const match = /-port=([0-9]{1,5})/.exec(v);
      if (match) {
        acc = match[1];
      }
      return acc;
    }, '');
    if (port_arg) {
      port = parseInt(port_arg);
    }
    this.proxy_server = ProxyServer.createServer(port);
  
    // set request handler
    this.proxy_server.proxy.on('proxyReq', (
      proxyReq: http.ClientRequest,
      req: http.IncomingMessage,
      res: http.ServerResponse,
      options: httpProxy.ServerOptions
    ) => {
  
        if (! req.url) {
          return ;
        }

        const api = KcsUtil.getApi(req.url);
        if (api) {
          switch(api) {
          case Api.REQ_HENSEI_CHANGE:
          case Api.REQ_HENSEI_LOCK:
          case Api.REQ_KAISOU_LOCK:
          case Api.REQ_KOUSYOU_DESTROYITEM2:
          case Api.REQ_KOUSYOU_CREATESHIP:
          case Api.REQ_KOUSYOU_DESTROYSHIP:
          case Api.REQ_KAISOU_POWERUP:
          case Api.REQ_SORTIE_BATTLE:
          case Api.REQ_NYUKYO_START:
          case Api.REQ_MEMBER_UPDATEDECKNAME:
          case Api.REQ_MISSION_RETURN_INSTRUCTION:
          case Api.REQ_KOUSYOU_REMODEL_SLOTLIST_DETAIL:
          case Api.REQ_KOUSYOU_REMODEL_SLOT:
          case Api.REQ_NYUKYO_SPEEDCHANGE:
          case Api.REQ_HENSEI_PRESET_SELECT:
          case Api.REQ_HENSEI_COMBINED:
          case Api.REQ_MAP_START:
          case Api.REQ_HENSEI_PRESET_DELETE:
          case Api.REQ_KAISOU_SLOTSET:
          case Api.REQ_KAISOU_OPEN_EXSLOT:
          case Api.REQ_KAISOU_UNSETSLOT_ALL:
          case Api.REQ_AIR_CORPS_SET_PLANE:
          case Api.REQ_AIR_CORPS_SET_ACTION:
          case Api.REQ_AIR_CORPS_SUPPLY:
          case Api.REQ_KOUSYOU_CREATEITEM:
          case Api.REQ_MAP_SELECT_EVENTMAP_RANK:
          case Api.REQ_PRACTICE_BATTLE:
          case Api.REQ_MEMBER_SET_FRIENDLY_REQUEST:
            new DataStore(req, (store: DataStore) => {
              this.onApiReq(api, req, store); 
            });
            break;
          default:
            if (AppStuff.isProduction) {
              new DataStore(req, (store: DataStore) => {
                this.onApiReqUnk(req, store);
              });
            }
            break;
        }
      }
    });
  
    // set response handler
    this.proxy_server.proxy.on('proxyRes', (
      proxyRes : http.IncomingMessage, 
      req: http.IncomingMessage,
      res: http.ServerResponse
      ) => {
  
        if (! req.url) {
          return ;
        }
  
        if (! this.server_id_queryed && KcsUtil.isOsapiDmmUrl(req.url)) {
          console.log('isOsapiDmmUrl', req.url);
          new DataStore(proxyRes, (store: DataStore) => {
            this.onOsapiDmmRes(req, store);
          });
          return ;
        }

        const api = KcsUtil.getApi(req.url);
        if (api) {

          // サーバIDが取得できていないときは、IPから逆引きする
          if(! this.server_id_queryed) {
            this.server_id_queryed = true;
            this.retrieveServerId(req.url);
          }

          new DataStore(proxyRes, (store: DataStore) => {
            this.onApiRes(api, store);
          });

        } else {
          if (KcsUtil.isKcsapi(req.url)) {
            if (AppStuff.isProduction) {
              new DataStore(proxyRes, (store: DataStore) => {
                this.onApiResUnk(req, store);
              });
            }
          }
        }
      }
    );
  
  
    session.defaultSession.setProxy(
      {
        pacScript: '',
        //proxyRules: `http=${httpProxy};https=${httpsProxy}`,
        proxyRules: `http=localhost:${port}`,//,direct://`;
        proxyBypassRules: '<local>',
      }).then(() => {
        console.log(`Proxy listening on ${port}`);
      }
    );
  }  
  
  /**
   * 
   * @param api 
   * @param req 
   * @param store 
   */
  private onApiReq(
    api: Api,
    req : http.IncomingMessage,
    store: DataStore
  ) : void {
    const data = store.getBody();
    svdata.setReq(api, data);

    console.log(req.url);
    console.log(data);

    this.req_callback(api, data);

    if (AppStuff.isProduction) {
      const fname = 'saved/'+saved_count+'_'+api.replace(/\//g, '-')+'_req.txt';
      saved_count++;
      fs.writeFile(fname, data, 'UTF8', (err: Error | null) => {
        if (err)
          console.log('req write file error', err);
      });
    }
  }

  /**
   * 
   * @param req 
   * @param store 
   */
  private onApiReqUnk(
    req : http.IncomingMessage,
    store: DataStore
  ) : void {
    let data = store.getBody();
    const fname = 'saved/'+saved_count+'_unk_req.txt';
    saved_count++;
    data = req.url + '\n'+ data;
    fs.writeFile(fname, data, 'UTF8', (err: Error | null) => {
      if (err)
        console.log('unk req write file error', err);
    });
    console.log(req.url);
    console.log(data);
  }

  /**
   * 
   * @param api 
   * @param data 
   */
  private onApiRes(
    api : Api,
    store: DataStore
  ) : void {
    let data = store.getBody();
    svdata.update(api, data)

    console.log('proxy res callback >>', Date.now());
    this.res_callback(api, data);
    console.log('proxy res callback <<', Date.now());

    if (AppStuff.isProduction) {
      let fname = 'saved/'+saved_count+'_'+api.replace(/\//g, '-')+'.json';
      saved_count++;

      // 
      try {
        if (data.startsWith(SvData.header)) {
          data = data.substring(SvData.header.length);
        }
        const parsed = JSON.parse(data);
        data = JSON.stringify(parsed, undefined, ' ');
      } catch(e) {
        console.log(e);
        fname = fname + 'ng';
      }
      fs.writeFile(fname, data, 'UTF8', (err: Error | null) => {
        if (err)
          console.log('res write file error', err);
      });
    }
  }

  /**
   * 
   * @param req 
   * @param data
   */
  private onOsapiDmmRes(
    req : http.IncomingMessage,
    store: DataStore
  ) : void {
    const data = store.getBody();
    console.log('osapi', data);
    const reg = /\\"api_world_id\\"\s*:\s*([0-9]+)/;
    const match = reg.exec(data);
    if (match) {
      this.server_id_queryed = true;
      this.fakeGetWorldIdApi(parseInt(match[1]));
    }

    if (AppStuff.isProduction) {
      const fname = 'saved/'+saved_count+'_osapi.txt';
      saved_count++;
      fs.writeFile(fname, data, 'UTF8', (err: Error | null) => {
        if (err)
          console.log('res write file error', err);
      });
    }
  }

  /**
   * 
   * @param req 
   * @param body 
   */
  private onApiResUnk(
    req: http.IncomingMessage,
    store: DataStore
  ): void {
    let data = store.getBody();
    let fname = 'saved/'+saved_count+'_unk_res.txt';
    saved_count++;

    // 
    try {
      if (data.startsWith(SvData.header)) {
        data = data.substring(SvData.header.length);
      }
      const parsed = JSON.parse(data);
      data = JSON.stringify(parsed, undefined, ' ');
    } catch (e) {
      console.log(e);
      fname = fname + 'ng.txt';
    }
    fs.writeFile(fname, req.url+'\n'+data, 'UTF8', (err: Error | null) => {
      if (err)
        console.log('unk res write file error', err);
    });
  }

  /**
   * 
   * @param url 
   */
  private retrieveServerId(url: string): void {
    const match = url.match(/^https?:\/\/([0-9.]+)\//);
    if (match) {
      this.fakeGetWorldIdApi(KcsUtil.fromIpAddress(match[1]));
    }
  }

  /**
   * 
   * @param id 
   */
  private fakeGetWorldIdApi(id: number): void {
    console.log('fake get world id. server id:', id);

    const api_data: ApiDataRoot = {
      api_result: ApiResult.ok,
      api_result_msg: '',
      api_data: {
        api_world_id: id
      }
    };
    const data = JSON.stringify(api_data);
    svdata.update(Api.API_WORLD_GET_ID, data);  
    this.res_callback(Api.API_WORLD_GET_ID, data);
  }
  
}

/**
 * 
 * @param wc 
 */
export const KcProxyStart = (req_callback: ProxyCallback, res_callback: ProxyCallback): void => {
  new KcProxy(req_callback, res_callback);
};
