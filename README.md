# AUL DoX Reference (ref.aul-dox.jp)

Obsidianで管理しているMarkdownノートと、厚労省統計等のデータ分析ダッシュボードをもとに、
Vercelで公開している静的サイトです。本番URL: https://ref.aul-dox.jp/

このリポジトリ（`C:\AUL DoX Reference`）が作業ディレクトリです。
`C:\AUL DoX note-wiki` は同一GitHubリポジトリの別チェックアウトなので、
二重に編集しないよう注意してください。

## 本番サイトとローカルの関係（重要）

- **本番サイト（`https://ref.aul-dox.jp/`）はVercel上で常時稼働**しており、手元のPCの状態（ターミナルを閉じた等）とは無関係にいつでもアクセスできます。普段の確認はこのURLを直接見ればOKです。
- **ローカル開発サーバー（`npm run dev`）は、pushする前に手元でプレビューしたい時だけ使う一時的なツール**です。ウィンドウを閉じれば止まりますが、それだけで本番に影響することはありません。必要な時にまた起動すればよいだけです。

## 起動方法（ローカルプレビュー）

```bash
cd "C:\AUL DoX Reference"
npm install   # 初回のみ／依存関係が変わった時
npm run dev   # ローカル開発サーバー（http://localhost:4321/ 、使用中なら4322等にフォールバック）
```

Windows環境でnpmスクリプトが動かない場合は `npm.cmd` を使ってください（例: `npm.cmd run dev`）。

`npm run dev` は**動き続けるプロセス**です。「watching for file changes...」の表示で止まって見えますが、これは正常な待機状態です。終了するときは `Ctrl+C`。

コマンドをコピペする際、`# コメント`の部分は含めないでください。cmd.exeは`#`をコメント記号として扱わないため、そのまま貼ると`npm error`になります。

## 公開方法（本番反映）

一番簡単なのは `scripts\publish.cmd` をダブルクリック（またはターミナルから実行）することです。
以下を自動で順番に実行し、変更があれば本番まで反映します。

1. `npm run build` — ビルドエラーがないか確認
2. `src/content/analysis`（Reference分析記事）と `src/dashboards` 等（Dataコンテンツ）を `git add`
3. 変更があれば `git commit` → `git push`（Vercelが自動ビルドして`ref.aul-dox.jp`に反映。数分かかる）

実行中は「何かキーを押してください」と出るまで進行状況が表示されます。**この時点で処理はすでに完了しています**。キーを押すとウィンドウが閉じるだけで、それによって本番が止まったりすることはありません（`Ctrl+C`で中断する場面とは別物です）。

noteの記事は**サイトに取り込みません**。ヘッダーの「note」ボタンからnote本体へ移動するだけです（RSS収集は廃止）。

## Content

公開記事は `src/content/wiki/` にMarkdownで追加します。

```md
---
title: "ページタイトル"
description: "ページ説明"
category: "福祉DX"
categorySlug: "welfare-dx"
tags: ["福祉DX"]
noteUrl: "https://note.com/chic_wren6567"
noteArticles:
  - title: "note記事タイトル"
    url: "https://note.com/chic_wren6567/n/xxxx"
date: "2026-05-23"
updated: "2026-05-23"
updateNote: "このページで何を追加・修正したかを短く書く"
draft: false
---

本文
```

`draft: true` の記事は一覧と詳細ページに表示されません。

## Reference（分析記事）

Referenceは、Dataで公開している統計・ダッシュボードの分析結果を読み解く記事（サマリ）を置く場所です。
noteには載せず、`src/content/analysis/<スラッグ>.md` に追加すると `/reference/<スラッグ>/` で公開され、
`/reference/` の一覧・タグ・カテゴリ・サイト内検索・sitemapに自動で反映されます。

```md
---
title: "記事タイトル"
description: "検索結果やSNSに出る説明文"
category: "keiei"          # Dataのタブslug（kaigo / shogai / keiei）
tags:
  - 介護給付費等実態統計
dataSlugs:                 # 元データ（src/dashboards/ からの相対パス）。複数可
  - keiei/r8-kyufu-gappo-202607-dai1
date: 2026-11-10
draft: false
---

本文（タイトルは自動で表示されるので、本文先頭に # 見出しは書かない）
```

- **相互リンクは自動**：記事側に「この記事の元データ（Data）」、`dataSlugs` に指定したData側のページに「このデータを読み解く記事（Reference）」が出ます。リンクの手書きは不要です。
- 記事を公開したら、トップの「最近の更新」用に `src/content/siteUpdates.ts` の先頭へ `type: 'Reference'` で1件足します。
- 旧来の `src/content/wiki/`（Suite等の補足ページ）はそのまま使えます。`noteArticles` で個別のnote記事URLを手動で載せることもできます。

## データ分析（/data）

`/data/` は一覧ページで、「ダッシュボード」と「分析レポート」の2種類を自動的にリストアップします
（ヘッダーの「データ分析」ボタンからリンク済み）。中身の技術的な扱いが異なるため、
**HTMLの形式によって置き場所を使い分ける**必要があります。

### 種類1：ダッシュボード（スコープ付きフラグメント）→ `src/dashboards/`

`C:\AUL 7Pips-welfare`（またはその後継フォルダ、現行は `C:\AUL 7Pips-welfare REF`）のパイプラインが
生成する自己完結HTML。`<div class="aul-report">`や`<div class="aul-tokuyou-db">`のように
**クラス名でスコープされたフラグメント**（`<html>`タグを含まない）。サイト共通のヘッダー・フッター
（`WikiLayout`）の中に埋め込んで表示します。

見分け方：ファイルの先頭が`<div class="aul-...">`から始まる（`<!doctype html>`から始まらない）。

公開手順:

1. `06_writer/{prefix}_report.html`（2026-07-11以降はサマリー統合済みの単一ファイル。
   旧プロジェクトは`{prefix}_wordpress.html`）を `src/dashboards/` にコピーし、
   わかりやすいスラッグ名にリネームする（例: `kaigo-keiei-chosa-22.html`）
2. `src/pages/data/[slug].astro` が `src/dashboards/*.html` を自動的に走査し、
   ファイル名ごとに `/data/<スラッグ>/` を生成する（個別にページを書く必要はない）
3. `npm run dev` で表示確認 → `git push` で公開

注意点:

- 同一ページに複数のダッシュボードを並べるとID・クラス名が衝突する（現状は1ページ1ダッシュボード前提）
- 7Pipsパイプライン側のファイル名は連番のため、リネームは今のところ手動。詳細・今後の自動化方針は
  [handoff-dashboard-integration.md](./handoff-dashboard-integration.md) を参照

### 種類2：分析レポート（完結した1ページHTML）→ `src/reports/`

Codex・Claude等で生成する「Deep Research」系の分析レポートのように、
**`<!doctype html><html>...</html>`で完結した独立ページ**。`body`や`h1`のようなグローバルな
CSSセレクタを使っているため、サイト共通レイアウトに埋め込むとスタイルが衝突します。
このため`WikiLayout`では包まず、**生のページとしてそのまま出力**します。

見分け方：ファイルの先頭が`<!doctype html>`または`<html`から始まる。

公開手順:

1. 生成されたHTMLをそのまま `src/reports/` にコピーし、わかりやすいスラッグ名にリネームする
   （例: `shogaisha-koyo-gap.html`）
2. `src/pages/reports/[slug].astro` が `src/reports/*.html` を自動的に走査し、
   ファイル名ごとに `/reports/<スラッグ>/` を生成する。ビルド時に`<body>`直後へ
   「← AUL DoX Reference｜データ分析一覧」という小さな戻りリンクだけ自動挿入する
   （元のHTMLファイルは無編集のまま）
3. `npm run dev` で表示確認 → `git push` で公開

**重要**：`/data/index.astro`が`src/dashboards/`と`src/reports/`の両方を自動的に一覧表示するため、
ファイルを正しいフォルダに置いてpushするだけで`/data/`経由の導線ができる。
逆に言うと、**どちらのフォルダにも置かないと、ページ自体は生成されても`/data/`一覧にも
ヘッダーのボタンからも辿り着けない「孤立ページ」になる**ので注意。

### `.gitignore`の注意

`.gitignore`の`/reports/`はトップレベルの`reports/`（`npm run sync:note`が生成する
`reports/note-link-suggestions.md`用）だけを除外する設定。`src/reports/`・`src/pages/reports/`は
無関係で、通常通りgit管理対象。もし`reports/`のように先頭スラッシュを外して書くと、
階層を問わず全ての`reports`という名前のフォルダが無視されてしまうので変更しないこと。

## Do Not Publish

- 顧客名
- 個人情報
- メールアドレス
- 契約情報
- 未公開の業務資料
- APIキー
- Apps Scriptの機密URL
- Googleフォームの管理URL
- 個別法人の内部情報
