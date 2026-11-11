# 公開手順書：Reference分析記事とHTML（ダッシュボード／レポート）

`ref.aul-dox.jp` に何かを公開するときの手順を、コンテンツの種類別にまとめたもの。
技術的な背景・設計判断は [README.md](./README.md) や
[handoff-dashboard-integration.md](./handoff-dashboard-integration.md) を参照。

前提：本番サイトはVercel上で常時稼働しており、`git push` した内容だけが反映される。
ローカルの `npm run dev` は公開前の確認用で、これ自体は本番に影響しない。

---

## 1. Reference（分析記事）を公開する

Dataの分析結果を読み解くサマリ記事は、noteではなくReferenceに置く。
note記事のRSS収集は廃止した（ヘッダーの「note」ボタンからnote本体へ移動するだけ）。

### 記事の種類とテンプレート

| 種類 | テンプレート | 使いどき |
|---|---|---|
| 単表の分析記事 | `templates/analysis-single.md` | 1つの表（または数表）の数字を読み解く。例：月報第1表 |
| ハブ記事 | `templates/analysis-hub.md` | 多数の表を束ねて、「この統計から何が言えるか」を示す。例：令和6年度・都道府県別の108表 |

どちらも、冒頭3行の結論 → 扱う統計（出典・期間・単位）→ 本文 → 現場でどう使うか → 読むときの注意 → 出典、の順。
表のページ（Data）は「数値を確認する場所」、記事（Reference）は「意味を読む場所」と役割を分ける。

### 手順

1. テンプレートを `src/content/analysis/<スラッグ>.md` にコピーする（スラッグは英数字・ハイフン推奨。URLは `/reference/<スラッグ>/`）
2. 【…】の部分をすべて書き換える。`category` はDataのタブslug、`dataSlugs` は元データのスラッグ。
   書き終わるまでは `draft: true` のままにする（本番には出ず、`npm run dev` でだけ見える）
3. `npm run dev` で `http://localhost:4321/reference/<スラッグ>/` と、元データ側 `/data/<dataSlugs>/` の「このデータを読み解く記事」を確認
4. `draft: false` にする
5. `scripts\publish.cmd` を実行（ビルド確認 → `src/content/analysis` 等をstage・commit・push）

- 【…】が残ったまま `draft: false` にすると、ビルドが止まる（公開されない）。
- `dataSlugs` に書いたスラッグが実在しないと、記事側にはリンクが出ない。
- 日付（`date`）は記事の公開日。トップの「最近の更新」、`/reference/` の一覧、タグ別の一覧、サイト内検索、sitemapには、
  すべて自動で載る（`siteUpdates.ts` に足す必要はない）。
- 多数の表を束ねる記事では、`dataSlugs` の一覧をコマンドで作れる（ハブ記事のテンプレートに例がある）。

### noteとの関係

データの分析記事は本サイトで公開する。noteの記事からは、本サイトの記事のURLを貼って案内する
（現場の視点の短い読み物 → 本サイトの分析記事、という流れ）。

---

## 2. HTML（ダッシュボード／分析レポート）を公開する

`/data/` 一覧ページ（ヘッダーの「データ分析」ボタンから遷移）に、ダッシュボードと分析レポートの
両方が自動的にリストされる。**ファイルの形式によって置き場所が異なる**ので、最初に見分ける。

### 見分け方

| ファイルの先頭 | 種類 | 置き場所 |
|---|---|---|
| `<div class="aul-...">`（`<html>`タグなし） | ダッシュボード（スコープ付きフラグメント） | `src/dashboards/` |
| `<!doctype html>` または `<html` | 分析レポート（完結した1ページ） | `src/reports/` |

### スラッグ名について

日本語ファイル名でも技術的には動作する（`import.meta.glob`・Astroのルーティングは問題なくURLを生成する）。
ただし実用面で英数字（ローマ字）のスラッグを推奨する：

- コピペやSNS共有時に`%E4%BB%8B%E8%AD%B7...`のような長いパーセントエンコード文字列に化けやすい
- gitやシェル操作で日本語ファイル名は引用符が必要になる等、扱いが煩雑になりがち

### 2-A. ダッシュボード（7Pipsパイプライン出力）

`C:\AUL 7Pips-welfare`（後継：`C:\AUL 7Pips-welfare REF`）が生成する自己完結HTML。
クラス名でスコープされているため、サイト共通のヘッダー・フッターの中に埋め込んで表示する。

1. `06_writer/{prefix}_report.html`（2026-07-11以降はサマリー統合済み。旧プロジェクトは
   `{prefix}_wordpress.html`）を `src/dashboards/` にコピー
2. わかりやすいスラッグ名にリネーム（例: `kaigo-keiei-chosa-22.html`。英数字推奨、理由は下記コラム参照）
3. `npm run dev` で `http://localhost:4321/data/<スラッグ>/` を確認
4. `scripts\publish.cmd` を実行（`src/dashboards/`・`src/pages/data/`も自動でstage・commit・pushされる）

注意：同一ページに複数ダッシュボードを並べるとID・クラス名が衝突する（現状1ページ1ダッシュボード前提）。

### 2-B. 分析レポート（完結した1ページHTML）

Codex・Claude等で生成する「Deep Research」系レポートのように、`<html>`から始まる独立ページ。
グローバルなCSSセレクタ（`body`、`h1`等）を使っているため、サイト共通レイアウトには埋め込まず、
**生ページとしてそのまま出力**する（ビルド時に`<body>`直後へ戻りリンクだけ自動挿入、元ファイルは無編集）。

**フォルダ構造：`src/reports/<カテゴリ>/<年月>/<ファイル>.html`**

```
src/reports/
  kaigo/          ← 介護分野
    2026-07/      ← 年月（YYYY-MM 形式）
      kaig-human-chyousa.html
  shogai/         ← 障がい分野
    2026-07/
      shogaisha-koyo-gap.html
```

- 親カテゴリ（`kaigo`／`shogai`）と画面表示名（介護分野／障がい分野）の対応は
  `src/reports-config.ts` で定義。**新しい親カテゴリを増やすときは、まずここに1行足してから**
  `src/reports/<slug>/` フォルダを作る（登録し忘れるとフォルダ名がそのまま表示名になる）
- 年月フォルダは必ず `YYYY-MM` 形式（例: `2026-07`）。`/data`ページの年月プルダウンが
  この形式を前提に「2026年7月」と表示する

手順:

1. 生成されたHTMLを `src/reports/<カテゴリ>/<年月>/` にコピー
   （例: `src/reports/kaigo/2026-07/`。フォルダが無ければ作る）
2. わかりやすいスラッグ名にリネーム（例: `kaig-human-chyousa.html`。英数字推奨、理由は下記コラム参照）
3. `npm run dev` で `http://localhost:4321/reports/<カテゴリ>/<年月>/<スラッグ>/` を確認
4. `scripts\publish.cmd` を実行（`src/reports/`・`src/pages/reports/`も自動でstage・commit・pushされる）

`/data`ページでは「経営の見える化（ダッシュボード）」「介護分野」「障がい分野」の3タブに分かれ、
介護・障がい分野は年月プルダウンで絞り込める。ファイルを正しいカテゴリ／年月フォルダに置けば、
タブ・プルダウンへの反映は自動。

### トップの「最近の更新」に出したいとき（Data・Suite）

ダッシュボードやSuiteの追加は自動では載らない。トップに出したい場合だけ、`src/content/siteUpdates.ts` の配列の先頭に
1件足す（`type: 'Data'` など。分類で絞り込んだURL `/data/keiei/?group=<分類>` を `href` にすると見やすい）。
Reference（分析記事）は、記事の `date` から自動で載る。

### 共通の注意点

- **`src/dashboards/` か `src/reports/` のどちらかに置かないと、ページは生成されても
  `/data/`一覧にもヘッダーのボタンからも辿り着けない「孤立ページ」になる。**
  ファイルを置いたら、必ず `/data/` の一覧に表示されることを確認してから公開する
- `.gitignore`の`/reports/`はトップレベルの`reports/`（note-link-suggestions.md用）だけを除外する設定。
  `src/reports/`・`src/pages/reports/`とは別物なので、`.gitignore`を触るときは先頭の`/`を外さないこと
- Vercelのビルドには数分かかる。pushしてすぐは反映されていなくても、時間を置いてから
  強制リロード（`Ctrl+Shift+R`）で確認する
