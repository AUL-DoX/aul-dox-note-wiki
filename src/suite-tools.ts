// Suite（/suite/）の「これまでに作ったツール」一覧のデータ。
// 1件足すだけで、/suite/ の一覧・サイトマップ外のサイト内検索に反映される。
//
// 方針：
//   ・個別ページは作らず、「ツール名」と「機能（1〜2文）」だけを載せる。
//     動作環境や使い方のような、環境の変化（AI連携・OS・ライブラリ）で古くなりやすい情報は書かない。
//   ・AUL DoXのツールは基本的に一般配布していないため、ダウンロードリンクは載せない。
//   ・書くのは、ソースコードや実機で確認できた事実だけにする（安全性の断定や未確認の実績は書かない）。

export interface SuiteTool {
  /** 一覧内のアンカー（#tool-<slug>）に使う。英数字とハイフンのみ */
  slug: string;
  name: string;
  /** 機能の説明（1〜2文） */
  summary: string;
  /** サイト内検索用の追加キーワード */
  keywords: string[];
}

export const suiteTools: SuiteTool[] = [
  {
    slug: 'pdf-one-click-print',
    name: 'PDF One Click Print',
    summary:
      'フォルダを選ぶだけで、中のPDFをまとめて印刷するWindows用ツール。印刷前に対象ファイルと使用するプリンターを確認する。',
    keywords: ['PDF', '一括印刷', '印刷', '納品書', '請求書', 'Windows', 'フォルダ', '業務改善', 'Python', 'デスクトップツール'],
  },
];
