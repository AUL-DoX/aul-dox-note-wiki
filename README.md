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

## 公開方法（新着記事の収集〜本番反映）

一番簡単なのは `scripts\publish.cmd` をダブルクリック（またはターミナルから実行）することです。
以下を自動で順番に実行し、新着があれば本番まで反映します。

1. `npm run sync:note` — note.comから新着記事を収集（ローカルの`data/*.json`を更新するだけ、この時点ではまだ本番に反映されない）
2. `npm run build` — ビルドエラーがないか確認
3. `data/*.json` を `git add`
4. 新着があれば `git commit` → `git push`（Vercelが自動ビルドして`ref.aul-dox.jp`に反映。数分かかる）

実行中は「何かキーを押してください」と出るまで進行状況が表示されます。**この時点で処理はすでに完了しています**。キーを押すとウィンドウが閉じるだけで、それによって本番が止まったりすることはありません（`Ctrl+C`で中断する場面とは別物です）。

手動でステップごとに実行したい場合は以下の通りです。

```bash
npm run sync:note   # ①収集（ローカルのみ更新）
npm run build       # ②ビルド確認（任意）
git add data/note-links.json data/note-magazines.json data/note-hashtags.json
git commit -m "Update note links"
git push             # ③本番反映
```

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

## note Links

note記事URL一覧を更新します。

```bash
npm run sync:note
```

`sync:note` はRSSの新着・更新記事を `data/note-links.json` にマージし、noteのマガジン・ハッシュタグ情報を取得し直し、wikiページごとの候補レポートを再生成します。

個別に実行する場合:

```bash
npm run fetch:note
npm run fetch:note:google
npm run fetch:note-magazines
npm run fetch:note-hashtags
npm run suggest:note-links
```

- `fetch:note-magazines`: 自分のnoteマガジン一覧を取得し、マガジンごとのRSSから収録記事URLを `data/note-magazines.json` に保存します。**カテゴリはここで取得したマガジン名がそのまま使われます**（マガジンに入っていない記事は「未分類」になります）。新しいマガジンを作れば、次の`sync:note`で自動的に新カテゴリとして反映されます。
- `fetch:note-hashtags`: 記事ごとに note.com の記事API (`/api/v3/notes/{key}`) からハッシュタグを取得し `data/note-hashtags.json` に保存します。**タグは記事に付けたハッシュタグがそのまま使われます**。197記事分を1件ずつ取得するため数十秒かかります。

ブラウザで開いたGoogle検索結果をHTML保存した場合は、そのHTMLも取り込めます。

```bash
npm run fetch:note:google -- path/to/google-results.html
```

生成物:

- `data/note-links.json`: RSSとGoogle site searchから取得した記事一覧
- `reports/note-link-suggestions.md`: wikiページごとのリンク候補

候補を確認して、採用するURLだけ各Markdownの `noteArticles` に転記します。
サイト上では `/notes/` でRSS取得済みの記事一覧と紐づけ状態を確認できます。

通常運用:

1. `npm run sync:note`
2. `reports/note-link-suggestions.md` を確認
3. 採用する記事だけMarkdownの `noteArticles` に転記
4. `npm run build`
5. GitHubへpushしてVercelへ反映

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
