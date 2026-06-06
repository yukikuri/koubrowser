# 甲ブラウザについて

Electron製艦これ専用ブラウザアプリです。

## 紹介ページとインストーラ

機能紹介やインストーラのダウンロードは、公式サイトで案内しています。

https://koubrowser.app/

## ゲーム通信への非干渉

「艦隊これくしょん ～艦これ～」サーバとの通信内容について、通信内容の改変・追加送信・通信への介入等は一切行っていません。

本アプリでは、ゲーム画面の `XMLHttpRequest` をラップしてリクエスト・レスポンス内容を記録処理へ通知しています。元の `open` / `send` はそのまま呼び出しています。通信内容を参照している主な処理箇所は以下の通りです。

- `src/main/kcbrowser.ts`: ゲーム画面の webview に通信内容取得用 preload を設定
- `src/preload/xhr-hook.ts`: `XMLHttpRequest` をラップし、通信内容を IPC へ通知。実通信は `super.open(...)` / `super.send(...)` を呼び出し
- `src/common/kcsapi_hook.ts`: IPC で通知する通信情報の型と変換処理

## 主な機能

- ゲーム画面と有用な情報画面の同時表示
- 特殊砲撃・弾着・夜戦CI確率・先制対潜など一覧表示
- マップに対しての制空権事前確認
- 遂行中任務の進捗状況を記録、任務編成条件の OK・NG 表示
- 遠征で各艦隊の達成判定、報酬情報、条件詳細をまとめて確認
- 戦闘履歴、戦果、タイムラインの表示
- EOや戦果任務を仮にクリアした場合、また直近日別戦果からの月末戦果予測
- ドロップ履歴のマップ別・艦名別集計
- 艦隊、装備、アイテム情報の参照
- 資源、バケツ、開発資材、改修資材の記録グラフ
- スクリーンショット、録画、ミュート、アプリ更新確認
- 誤って大破進撃した場合、タイトルバーに表示
- 任意のウインドウサイズでゲーム画面表示

## 技術構成

- Electron / electron-vite
- Vue 3 / TypeScript
- Buefy / Bulma
- NeDB
- Highcharts
- Vitest
- electron-builder

## NeDB について

記録データの保存には NeDB を使用しています。開発初期に組み込んだ経緯があり、既存データ形式や周辺処理との互換性を保つため現時点では継続利用しています。

ただし、NeDB は現在の選択肢として積極的に採用したいものではないため、将来的には保守性や移行性を考慮した別の保存方式へ置き換えたいと考えています。

## Worker の利用

DB の読み書き、資源記録グラフ用データの計算、戦闘・ドロップ履歴の集計などは、Node.js の Worker Threads で実行しています。記録データの検索や集計でメインプロセスを長時間占有しないようにし、ゲーム画面やアプリ画面の操作感への影響を抑えるためです。

また、クエスト DB 用の Worker は他の記録 DB 用 Worker と分けています。戦闘履歴やドロップ履歴などの DB はサイズが大きくなりやすいため、その読み込みや集計の影響をクエスト進捗の更新・参照に波及させないことを目的としています。

## セットアップ

```bash
npm install
```

`postinstall` で `electron-builder install-app-deps` が実行されます。

## 開発

```bash
npm run dev
```

開発起動時には、同梱ライセンス情報の生成と開発用コードのコピーが実行されます。

### テスト動作確認用の環境変数

テスト動作確認用のモードで起動する場合は、PowerShell で次の環境変数を設定します。

```powershell
$env:test_mode = "1"
npm run dev
```

テスト動作確認用モードでのテストデータ指定方法は、{main|scripts}\debug-data.tsを参照してください。

## ビルド等コマンド

```bash
# テスト
npm run test

# カバレッジ付きテスト
npm run test:coverage

# 通常ビルド
npm run build

# Windows インストーラー作成
npm run build:win

# macOS(未サポート)
npm run build:mac

# Linux(未サポート)
npm run build:linux

# unpack 形式
npm run build:unpack
```

生成物は `electron-builder.yml` の設定に従って作成されます。Windows では `KouBrowser-${version}-win-setup.exe` 形式のインストーラーが作成されます。

## ディレクトリ構成

- `src/main`: Electron メインプロセス、IPC、記録、更新確認など
- `src/preload`: preload とレンダラー向け API ブリッジ
- `src/renderer`: Vue アプリ本体
- `src/common`: メイン・レンダラー共通の型、計算、艦これ API 関連処理
- `resources`: マップ情報などの同梱リソース
- `openapi`: ドロップ情報提供openapi定義
- `scripts`: ライセンス生成、開発用コードコピー、更新確認用補助スクリプト

## 型生成とライセンス生成

```bash
# openapi/kc-intake.yaml から型などを生成
npm run gen:types

# 同梱ライセンス情報を生成
npm run gen:licenses
```

## 更新確認の開発用設定

開発中にローカルの更新ファイルを参照する場合は、`KOU_UPDATE_URL` を設定してから `npm run dev` を実行します。

```powershell
$env:KOU_UPDATE_URL = 'http://localhost:8080/releases'
npm run dev
```

更新確認用の HTTP サーバーは次のスクリプトから起動できます。

```bash
scripts/run-http-server-for-update-check.bat
```

scripts/releases/配下に更新情報メタファイルlatest.yml等を配置します。
