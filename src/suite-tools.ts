// Suite（/suite/）の「これまでに作ったツール」一覧のデータ。
// 1件足すだけで、/suite/ の一覧・サイトマップ外のサイト内検索に反映される。
//
// 方針：
//   ・個別ページは作らず、「ツール名」と「機能（1〜2文）」だけを載せる。
//     動作環境や使い方のような、環境の変化（AI連携・OS・ライブラリ）で古くなりやすい情報は書かない。
//   ・ダウンロードや利用方法は各ツールのnote解説記事に任せ、このサイトにはダウンロードリンクを載せない。
//   ・書くのは、ソースコードや実機で確認できた事実だけにする（安全性の断定や未確認の実績は書かない）。

export interface SuiteTool {
  /** 一覧内のアンカー（#tool-<slug>）に使う。英数字とハイフンのみ */
  slug: string;
  name: string;
  /** 機能の説明（1〜2文） */
  summary: string;
  /** サイト内検索用の追加キーワード */
  keywords: string[];
  /** 解説するnote記事（あれば）。一覧に「解説記事」リンクとして出る */
  noteUrl?: string;
}

export const suiteTools: SuiteTool[] = [
  {
    slug: 'pdf-one-click-print',
    name: 'PDF One Click Print',
    summary:
      'フォルダを選ぶだけで、中のPDFをまとめて印刷するWindows用ツール。印刷前に対象ファイルと使用するプリンターを確認する。',
    noteUrl: 'https://note.com/chic_wren6567/n/n1a0f91c4a542',
    keywords: ['PDF', '一括印刷', '納品書', '請求書', 'Windows'],
  },
  {
    slug: 'folder-latest-version',
    name: 'フォルダ最新版管理ツール',
    summary:
      '同名ファイルのうち、どれが最新版か分からない問題に絞ったWindows 11用のファイル管理ツール。',
    noteUrl: 'https://note.com/chic_wren6567/n/nb37b51de5dc2',
    keywords: ['Windows', 'C#', 'ファイル管理', '最新版'],
  },
  {
    slug: 'personal-work-console',
    name: 'Personal Work Console v2.0',
    summary:
      '毎日使うアプリやフォルダを1か所から起動する、自分専用のデスクトップコンソール。',
    noteUrl: 'https://note.com/chic_wren6567/n/n42704846ba87',
    keywords: ['デスクトップ', 'ランチャー', '作業環境'],
  },
  {
    slug: 'cc-coding-board',
    name: 'C.C. Coding Board',
    summary:
      'CodexとClaude Codeなど、開発に使う複数のAIやツールを1つの画面から扱う開発用ワークスペース。',
    noteUrl: 'https://note.com/chic_wren6567/n/n09aeb881a756',
    keywords: ['Codex', 'Claude', 'Code', '開発', 'C#'],
  },
  {
    slug: 'aul-drive-manager',
    name: 'AUL Drive Manager',
    summary:
      'Googleドライブのファイルを種類別に整理・探しやすくするGASツール。',
    noteUrl: 'https://note.com/chic_wren6567/n/n60aa67e74ccf',
    keywords: ['Googleドライブ', '整理', 'GAS'],
  },
  {
    slug: 'markdown-table-converter',
    name: 'Markdown→Table変換くん',
    summary:
      'Markdownの表をnote用に貼れる形へ変換し、グラフPNGも作れる変換ツール。',
    noteUrl: 'https://note.com/chic_wren6567/n/ne78b9bb96831',
    keywords: ['Markdown', '表', 'note', '変換', 'グラフ'],
  },
  {
    slug: 'aul-research-formatter',
    name: 'AUL Research Formatter',
    summary:
      'Gemini Deep Researchの出力をMarkdownやHTMLへ変換するツール。',
    noteUrl: 'https://note.com/chic_wren6567/n/n1dce4e02b21b',
    keywords: ['Gemini', 'Deep', 'Research', 'Markdown', '変換'],
  },
  {
    slug: 'my-note-explorer',
    name: 'My note Explorer',
    summary:
      'note上の「自分の記事だけ」を検索できるアプリ。',
    noteUrl: 'https://note.com/chic_wren6567/n/ncb63b9caa263',
    keywords: ['note', '検索', '記事'],
  },
  {
    slug: 'aul-ai-project-tracker',
    name: 'AUL AI Project Tracker',
    summary:
      'Claude・ChatGPT・Geminiなど複数AIのプロジェクトを1画面で管理するツール。',
    noteUrl: 'https://note.com/chic_wren6567/n/n25fe06ed85aa',
    keywords: ['AI', 'プロジェクト管理', 'ChatGPT', 'Claude', 'Gemini'],
  },
  {
    slug: 'gemini-prompt-notes',
    name: 'Gemini Prompt & Notes',
    summary:
      'Geminiでプロンプトやメモを整理して使うためのChrome拡張。',
    noteUrl: 'https://note.com/chic_wren6567/n/n6b4995397f4e',
    keywords: ['Gemini', 'Chrome拡張', 'プロンプト', 'メモ'],
  },
  {
    slug: 'why-what-how-prompt-builder',
    name: 'Why / What / How Prompt Builder',
    summary:
      'AIへの依頼を「Why・What・How」の形で整理してプロンプトを組み立てるツール。',
    noteUrl: 'https://note.com/chic_wren6567/n/nc60eb0fb62af',
    keywords: ['プロンプト', 'AI開発'],
  },
  {
    slug: 'aul-7pips',
    name: 'AUL 7Pips',
    summary:
      '7人のAI分析エージェントが順に成果物を組み上げる、パイプライン型の分析ツール。',
    noteUrl: 'https://note.com/chic_wren6567/n/n1ae6d30a2dc4',
    keywords: ['AIエージェント', '分析', 'パイプライン'],
  },
  {
    slug: 'care-shift-ortools',
    name: '介護シフト自動作成ツール',
    summary:
      'Google OR-Toolsを使い、パート・扶養内パート・派遣を含む介護施設のシフト作成を補助するアプリ。',
    noteUrl: 'https://note.com/chic_wren6567/n/n28c7ecc82847',
    keywords: ['シフト', 'OR-Tools', '介護', 'Python'],
  },
  {
    slug: 'aul-shift-system',
    name: 'AUL シフト管理システム',
    summary:
      '常勤換算と人員配置基準を意識して、医療・福祉・保育のシフトを作るシステム。',
    noteUrl: 'https://note.com/chic_wren6567/n/n7cadcd5a0c5c',
    keywords: ['シフト', '常勤換算', '人員配置基準'],
  },
  {
    slug: 'aul-c-isit',
    name: 'AUL C-ISIT（シージット）β版',
    summary:
      '医療・介護・障がい福祉の情報を、家族（キーパーソン）が一元管理するためのアプリ。',
    noteUrl: 'https://note.com/chic_wren6567/n/n20b7c91c136a',
    keywords: ['家族', 'キーパーソン', '医療', '介護', '障がい福祉'],
  },
  {
    slug: 'aul-claim-insight',
    name: 'AUL Claim Insight',
    summary:
      '国保連のCSVを安全に見える化し、障害福祉サービスの請求データ分析を始めるためのPythonツール。',
    noteUrl: 'https://note.com/chic_wren6567/n/n78ed69732bdc',
    keywords: ['国保連', 'CSV', '請求', '障害福祉', 'Python'],
  },
  {
    slug: 'shuro-sentaku-checklist',
    name: 'AUL 就労選択支援チェックリストツール',
    summary:
      '就労選択支援のアセスメント記録や面談メモを1か所にまとめるチェックリストツール。',
    noteUrl: 'https://note.com/chic_wren6567/n/n8335169eeb3c',
    keywords: ['就労選択支援', 'アセスメント', 'NotebookLM'],
  },
  {
    slug: 'acp-tool',
    name: 'ACP記録・共有ツール',
    summary:
      'アドバンス・ケア・プランニング（ACP）の記録と共有を支援する無料ツール。',
    noteUrl: 'https://note.com/chic_wren6567/n/ncfc907ac1975',
    keywords: ['ACP', '記録', '共有', 'ケア'],
  },
  {
    slug: 'engagement-analysis',
    name: '職員エンゲージメント分析ツール',
    summary:
      '離職予防を目的に、職員のエンゲージメントを分析するツール。',
    noteUrl: 'https://note.com/chic_wren6567/n/nedb4707c1177',
    keywords: ['離職予防', 'エンゲージメント', '分析'],
  },
  {
    slug: 'service-meeting-scheduler',
    name: 'サービス担当者会議・日程調整ツール',
    summary:
      'GASとGoogleフォームだけで、サービス担当者会議などの出欠・日程調整を行うツール。',
    noteUrl: 'https://note.com/chic_wren6567/n/n6f44b5c03687',
    keywords: ['ケアマネ', '担当者会議', '日程調整', 'GAS'],
  },
  {
    slug: 'aul-you-do',
    name: 'AUL you do?',
    summary:
      '介護現場の会議をAIツールにして、職員のエンゲージメントを高める取り組み。',
    noteUrl: 'https://note.com/chic_wren6567/n/nde47aa24f205',
    keywords: ['会議', 'エンゲージメント', '介護'],
  },
  {
    slug: 'aul-1on1-supporter',
    name: 'AUL 1on1 Supporter',
    summary:
      '記録を取らずに1on1を続けられるよう支援するツール。',
    noteUrl: 'https://note.com/chic_wren6567/n/n896cfc45c228',
    keywords: ['1on1', '面談', '管理職'],
  },
  {
    slug: 'aul-weaving-words',
    name: 'AUL Weaving Words',
    summary:
      '言葉に困難を抱える人と支援者のことばを、AIが紡ぐコミュニケーション支援ツール。',
    noteUrl: 'https://note.com/chic_wren6567/n/n26c6d5e4c213',
    keywords: ['コミュニケーション支援', 'Ambient', 'Care'],
  },
  {
    slug: 'aul-education-system',
    name: 'AUL Education System v2',
    summary:
      '日々の記録をもとに所見作成を助ける、全校種対応の校務支援ツール。',
    noteUrl: 'https://note.com/chic_wren6567/n/n77aa96183886',
    keywords: ['校務支援', '所見', 'NotebookLM'],
  },
  {
    slug: 'aul-cap-sheet',
    name: 'AUL CAP SHEET',
    summary:
      '中学・高校・特別支援学校向けのキャリア教育ツール（GAS）。',
    noteUrl: 'https://note.com/chic_wren6567/n/ncd83ee054833',
    keywords: ['キャリア教育', '特別支援学校', 'GAS'],
  },
  {
    slug: 'steam-dashboard',
    name: 'STEAM探究ダッシュボード',
    summary:
      '探究学習の記録を可視化し、Geminiで探究を深めるGASツール。',
    noteUrl: 'https://note.com/chic_wren6567/n/n127c2ad3c383',
    keywords: ['STEAM', '探究', 'GAS', 'Gemini'],
  },
  {
    slug: 'easy-drawing-blender',
    name: 'かんたん作図ツール',
    summary:
      'AIと相談しながらBlenderで3D作図を行う、特別支援学校向けの実験ツール。',
    noteUrl: 'https://note.com/chic_wren6567/n/ned93c53ccc54',
    keywords: ['Blender', 'Claude', 'Code', '3D', '特別支援学校'],
  },
  {
    slug: 'easy-homepage-maker',
    name: 'かんたんホームページ作成ツール',
    summary:
      '特別支援学校の生徒がWeb制作を学ぶための、ホームページ作成ツール。',
    noteUrl: 'https://note.com/chic_wren6567/n/nc7f4604a91d6',
    keywords: ['ホームページ', '特別支援学校', 'Web制作'],
  },
  {
    slug: 'e2e-test-tool',
    name: 'E2Eテストツール',
    summary:
      'AIで作ったHTMLツールやWebアプリを、公開前に動作確認するためのツール。',
    noteUrl: 'https://note.com/chic_wren6567/n/nbfab4d6e4e4d',
    keywords: ['E2E', 'テスト', '動作確認'],
  },
  {
    slug: 'aul-web-block',
    name: 'AUL web block',
    summary:
      'セクションをキャンバス上で自由に動かして作る、ランディングページ生成ツール。',
    noteUrl: 'https://note.com/chic_wren6567/n/neb51186fbb51',
    keywords: ['LP', '生成', 'Webページ'],
  },
  {
    slug: 'oden-plugin',
    name: 'O.D.E.N Plugin',
    summary:
      'Obsidianのメモを整理・深掘りするために作ったプラグイン。',
    noteUrl: 'https://note.com/chic_wren6567/n/nda48348fcf18',
    keywords: ['Obsidian', 'プラグイン'],
  },
  {
    slug: 'virtual-company-studio',
    name: 'Virtual Company Studio',
    summary:
      'AIに会社を経営させる試みから生まれた、経営シミュレーション型のゲーム。',
    noteUrl: 'https://note.com/chic_wren6567/n/n6f0137cba88c',
    keywords: ['経営', 'シミュレーション', 'ゲーム'],
  },
  {
    slug: 'rubicon',
    name: 'RUBICON',
    summary:
      'GASで作った古代ローマ統治ゲーム。',
    noteUrl: 'https://note.com/chic_wren6567/n/n9160c2ff6c95',
    keywords: ['ゲーム', 'GAS', '古代ローマ'],
  },
];
