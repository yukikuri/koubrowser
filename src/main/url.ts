import { Const } from "@common/const"
import { DevEnv } from "@common/devenv";
import { Env } from "@common/env"
import { PreferredQuestSchemaVersion } from "@common/kcquest_schema_file"

/////////////////////////////////////////////////////////////////////////////////////
// debug
const DEBUG = 0;

const debug = (...args: unknown[]): void => {
  if (DEBUG) console.info("[Urls]", ...args);
};

/**
 *
 */
class UrlStuffImpl {

  /**
   * quest schemaでローカルホストに更新用ファイルを配置し確認する場合、
   * まず以下の環境変数を設定する
   * $env:KOU_QUEST_SCHEMA_URL='http://localhost:8080/quest-schema/v1/quest-schema.json'
   * 
   * httpサーバは
   * scripts/run-dev-http-server.bat
   * から起動できる。scripts/quest-schemaフォルダ配下に更新用ファイルを配置する
   * 
   * 後は開発モードで動かせばよい(npm run dev)
  */
  get questSchema(): string {

    const overrideUrl = DevEnv.questSchemaUrl
    if (Env.isDevelopment && overrideUrl) {
      debug('quest schema url(override):', overrideUrl)
      return overrideUrl
    }

    const path = `quest-schema/v${PreferredQuestSchemaVersion}/quest-schema.json`
    const ret = Const.AssetsCdnUrl + path
    debug('quest schema url(default):', ret)
    return ret
  }
}

export const UrlStuff = new UrlStuffImpl()
