// トップページ「最近の更新」の元データ。自サイト内（Data・Suite・Referenceなど）の更新だけを載せる。
// 新しい更新を公開したら、配列の先頭に1件足す。トップには新しい順に先頭から6件が出る。
//   type  : 'Data' | 'Suite' | 'Reference' | 'Deep Research'
//   date  : 公開日（YYYY-MM-DD）
//   href  : サイト内のURL（Dataの分類は /data/<タブ>/?group=<分類> で絞り込んだ状態にできる）

export interface SiteUpdate {
  type: 'Data' | 'Suite' | 'Reference' | 'Deep Research';
  date: string;
  title: string;
  description: string;
  href: string;
}

export const siteUpdates: SiteUpdate[] = [
  {
    type: 'Reference',
    date: '2026-11-11',
    title: '介護の認定率は、人口で揃えると大阪府が最多：令和6年度・都道府県別の地域差',
    description: '介護保険事業状況報告（令和6年度・都道府県別）108表を、第1号被保険者1,000人あたりで読み直しました。',
    href: '/reference/r6-kaigo-todofuken-hub/',
  },
  {
    type: 'Reference',
    date: '2026-11-10',
    title: '介護予防サービス約104万人・約300億円の利用構造と費用配分（2026年7月審査分・第1表）',
    description: '給付費等実態統計・月報の第1表を読み解く分析記事。元データのダッシュボードとあわせて確認できます。',
    href: '/reference/r8-kyufu-202607-dai1/',
  },
  {
    type: 'Data',
    date: '2026-10-31',
    title: '給付費等実態統計・月報（令和8年7月審査分）27表',
    description: '介護予防サービスを含む受給者数・費用額などの月報を、表ごとのダッシュボードで確認できます。',
    href: '/data/keiei/?group=kyufu-gappo',
  },
  {
    type: 'Suite',
    date: '2026-10-18',
    title: 'これまでに作ったツール33件の一覧',
    description: 'AUL DoXが開発したツールを、名前・機能・note解説記事へのリンクでまとめました。',
    href: '/suite/',
  },
  {
    type: 'Data',
    date: '2026-10-10',
    title: '給付費等実態統計（令和7年度・全国・月別）24表',
    description: '全国の給付費等を月別の時系列で確認できるダッシュボードです。',
    href: '/data/keiei/?group=kyufu-r7',
  },
  {
    type: 'Data',
    date: '2026-10-10',
    title: '給付費等実態統計（令和7年度・都道府県別）',
    description: '都道府県別の給付費等を表ごとに確認できます。第68表などを追加しました。',
    href: '/data/keiei/?group=kyufu-r7-pref',
  },
  {
    type: 'Data',
    date: '2026-10-03',
    title: '経営動向調査・経営状況（WAM 社会福祉法人の経営動向調査）',
    description: '社会福祉法人の経営動向調査のDI（2025年9月〜2026年9月）の推移を確認できます。',
    href: '/data/keiei/?group=survey',
  },
  {
    type: 'Data',
    date: '2026-09-21',
    title: '介護保険事業状況報告（令和6年度・都道府県別）',
    description: '都道府県別の介護保険事業状況報告を、表ごとのダッシュボードで確認できます。',
    href: '/data/keiei/?group=jigyo-r6-pref',
  },
];

export function getLatestSiteUpdates(limit = 6) {
  return [...siteUpdates]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit)
    .map((item) => ({ ...item, dateLabel: item.date.replaceAll('-', '.') }));
}
