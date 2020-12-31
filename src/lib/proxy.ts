import * as http from 'http';
import Server from 'http-proxy';
import zlib from 'zlib';

/**
 * 
 */
type DataCallback = (store: DataStore) => void;

/**
 * data store
 */
export class DataStore {

  private body: any[] = [];
  proxyMsg: http.IncomingMessage;
  callback: DataCallback;

  public constructor(
    proxyMsg: http.IncomingMessage,
    callback: DataCallback) {
    this.proxyMsg = proxyMsg;
    this.callback = callback;

    proxyMsg.on('data', (chunk: any): void => {
      this.body.push(chunk);
    });

    proxyMsg.once('end', () => {
      console.log('end', this.proxyMsg.url);
      this.callback(this);
    });
  }

  /*
  log() : void {
    //let contentType = this.proxyRes.headers['content-type'];
    //let all = Buffer.concat(this.body);
    //console.log(`rand:${this.rand} contentType:${contentType} bodylen:${all.length} url:${this.url}`);
    //console.log(`rawHeaders:${this.proxyRes.rawHeaders.join(',')}`);
  }
  */

  public getBody(): string {
    const concated = Buffer.concat(this.body);
    const encoding = 'UTF8';
    if (this.proxyMsg.headers['content-encoding'] === 'gzip') {
      try {
        return zlib.gunzipSync(concated).toString(encoding);
      } catch (e) {
        console.log(e);
      }
    }
    return concated.toString(encoding);
  }
}

/**
 * 
 */
export class ProxyServer {
  private proxy_: Server;
  private server_: http.Server;

  static createServer(
    port: number): ProxyServer {
    return new ProxyServer(port);
  }

  public get proxy(): Server {
    return this.proxy_;
  }

  public get server(): http.Server {
    return this.server_;
  }

  private constructor(
    port: number
  ) {
    this.proxy_ = Server.createServer();

    //
    // Create your target server
    //
    this.server_ = http.createServer(
      (req: http.IncomingMessage, res: http.ServerResponse) => {
        // translate
        this.proxy_.web(req, res, {
          target: `http://${req.headers.host}`
        },
          (err: Error) => {
            if (err)
              console.log(err);
          }
        );
      });
    this.server_.listen(port);
  }
}
