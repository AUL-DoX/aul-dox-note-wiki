// ダッシュボード各ページの <title> と meta description を、ページ本文から組み立てる。
// 表の名前だけだと「何が分かるのか」が検索結果で伝わらないので、本文にある要点（数字・結論）をタイトルに入れる。
// 本文から取れない場合は、従来どおり表の名前（data-titles.json / <h1>）を使う。
// 管理画面で付けたタイトル（data-titles.json）は一覧・検索用の名前として残し、ここでは要点を足すだけ。

const strip = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

const H1 = /<h1[^>]*>([\s\S]*?)<\/h1>/g;
const H2 = /<h2[^>]*>([\s\S]*?)<\/h2>/g;
const headings = (html: string, pattern: RegExp) => [...html.matchAll(pattern)].map((m) => strip(m[1]));

function overview(html: string) {
  const m = html.match(/概要<\/h2>([\s\S]*?)<h2/);
  return m ? strip(m[1]) : '';
}

function clip(text: string, max: number) {
  const t = text.trim();
  return t.length <= max ? t : `${t.slice(0, max - 1).replace(/[、。\s]+$/u, '')}…`;
}

// 概要の1文目から「数字を含む要点」を取り出す（給付費等実態統計の表で使う）。取れなければ空文字。
function keyFigure(text: string) {
  const first = text.split('。')[0] ?? '';
  // 月報：「…について、受給者数が総数で1,040.7千人、費用額が総数で29,987百万円です」
  let m = first.match(/について、(.+?)です$/);
  if (m) return m[1].replace(/が総数で/g, '').replace(/が最も大きいサービスは/g, ' ');
  // 全国・月別：「…は、月平均で1,002.6千人（約100.3万人）、12か月の累計…」＋「…へ5.0%増え」
  m = first.match(/は、月平均で([^（、]+)/);
  if (m) {
    const trend = text.match(/へ(-?[\d.]+%)(増え|減り)/);
    return trend ? `月平均${m[1]}・5月→翌4月で${trend[1]}${trend[2] === '増え' ? '増' : '減'}` : `月平均${m[1]}`;
  }
  // 都道府県別：「…は、全国で1,361.2千人（約136.1万人）です」
  m = first.match(/は、(全国で[^（、]+)/);
  if (m) return m[1];
  return '';
}

export interface DashboardSeo {
  title: string;
  description: string;
}

export function getDashboardSeo(html: string, baseTitle: string, categoryLabel: string): DashboardSeo {
  const h1s = headings(html, H1);
  const h2s = headings(html, H2);
  const text = overview(html);

  // 1) 本文に「結論｜表の名前」の見出しがあるページ（都道府県別の比較など）：その見出しをタイトルにする。
  const headline = h2s.find((h) => h.includes('｜'));
  // 2) 経営概況：<h1>の「テーマ｜決算の経営状況 第N表」＋「1. 〜」の要点。
  const lead = h1s.find((h) => h.includes('｜'));
  const point = h2s.find((h) => /^1\.\s/.test(h))?.replace(/^1\.\s*/, '');

  // 主要ポイントの「データ：〜」の最初の1文（全国計の表など、概要が定型文のページ向け）。
  const dataPoint = strip(html.match(/主要ポイント<\/h2>([\s\S]*?)<h2/)?.[1] ?? '').match(/データ\s*[：:]\s*([^。]+。)/)?.[1] ?? '';

  let title = baseTitle;
  if (headline) {
    title = headline;
  } else if (point && h1s.length >= 2) {
    title = `${(lead ?? h1s[0]).split('｜')[0].replace(/\s+/g, '')}：${point}`;
  } else {
    // 3) 給付費等実態統計：要点（数字）を先頭に、表の名前を後ろに置く。
    const figure = keyFigure(text);
    if (figure) title = `${figure}｜${baseTitle}`;
  }

  let description: string;
  if (/\d/.test(text) && !text.startsWith('本サマリー')) {
    description = clip(text, 120);
  } else if (headline) {
    description = clip(`${headline}。${categoryLabel}の統計表をもとに、グラフと表で確認できます。`, 120);
  } else if (point && h1s.length >= 2) {
    description = clip(`${lead ?? h1s[1]}。${point}。`, 120);
  } else if (dataPoint) {
    description = clip(`${baseTitle}。${dataPoint}`, 120);
  } else {
    description = clip(`${baseTitle}（${categoryLabel}）。厚生労働省などの統計表をもとにした、AUL DoXのデータ分析ダッシュボードです。`, 120);
  }

  return { title, description };
}
