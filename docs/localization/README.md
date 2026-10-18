# 表示言語の保守

日本語が原文かつ既定の表示言語です。翻訳がない文言は常に日本語で表示されます。翻訳は表示時にだけ行い、ゲーム通信、受信データ、ID、記録、計算、任務判定は変更しません。ゲーム画面(webview)は翻訳しません。

## 構成

| ファイル | 内容 |
| --- | --- |
| `src/common/i18n/index.ts` | 翻訳関数。完全一致のみで、部分一致の置換はしない |
| `src/renderer/src/i18n.ts` | 画面用の `t()`、ゲーム名用の `gameText()` / `shipText()` |
| `src/renderer/src/locale.ts` | `@common/locale` の表示用ラッパー(元の表は変更しない) |
| `src/common/i18n/ko.json` | 韓国語の画面文言。`{term:原文}` で用語を参照する |
| `src/common/i18n/terminology.json` | 用語の原本(`kind`、`status`、`basis`、`note`) |
| `terms.json`、`ship-names.json`、`ship-suffixes.json` | `terminology.json` から生成する実行用データ |
| `KOREAN_GLOSSARY.md`、`KOREAN_REVIEW.md` | 確定用語一覧と未確定一覧(生成) |
| `src/renderer/src/assets/lang-ko.scss` | 韓国語表示のときだけ適用するスタイル(単語単位の改行、タイトルバーの艦船・装備数の表示など) |
| `src/renderer/src/fit-text.ts` | 韓国語の艦名などが欄に収まらないとき、文字を少し小さく・横に少し縮めて表示する |

設定の `language` は既存の設定ファイルに保存されます。古い設定や不明な値は日本語になります。変更はアプリの再起動後に反映されます。

## 文言の追加

- 画面文言は日本語原文をキーにして `t('日本語')`、値を含む場合は `t('日本語 {0}', [value])` と書きます。同じ原文で意味が違う場合は `t('クリア', [], 'input')` のように文脈を付け、`ko.json` に `input::クリア` を追加します。
- ゲームから受け取る名称は `gameText(name)`、艦名は `shipText(name)` で表示します。検索や記録には元の名前をそのまま使います。
- 韓国語訳がまだなくても動作は変わりません(日本語表示)。
- スタイルシートの `content` で表示する文言は `i18n.ts` の `styleTexts()` で CSS 変数として渡し、`content: var(--text-..., '日本語')` で参照します。

## 韓国語の更新

1. `npm run i18n:extract` で日本語文言の一覧(`ja-inventory.json`)を更新します。
2. 画面文言は `ko.json` に追加します。ゲーム用語や固有名詞は `{term:原文}` で参照します。
3. 用語は `terminology.json` に `korean`、`status: "confirmed"`、`basis` を入力します。`basis` はナムウィキの表記なら `namuwiki`、略語・文章・ナムウィキにない名前の訳なら `translation`、韓国語担当者の判断なら `user` です。ナムウィキにない名前には `note` を付け、`KOREAN_REVIEW.md` で確認できるようにします。ラテン文字の名前は翻訳しません。
4. `npm run i18n:report` で実行用データと一覧を生成し、`npm run i18n:check` で検査します。

## 検証

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run i18n:check
npm run i18n:templates
```

`i18n:templates` は変更した Vue テンプレートとインラインスタイルを、翻訳前の日本語に戻した状態で元のリビジョン(`fe80aa3`)と比較します。違いは設定画面の言語選択のみです。

`scripts/localization-qa/main.cjs` は設定画面を元のビルドと比較します。元のリビジョンを別の場所でビルドし、`KOUBROWSER_BASELINE` にそのパスを指定して Electron で実行します。既存コントロールの位置・大きさ・フォント、韓国語の横はみ出しと切れを検査し、`KOUBROWSER_QA_OUTPUT` にスクリーンショットを保存します。
