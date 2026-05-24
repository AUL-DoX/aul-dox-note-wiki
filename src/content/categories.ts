export const categories = [
  { title: '福祉DX', slug: 'welfare-dx', description: '福祉現場の業務整理、記録、共有、改善のためのDXメモ。' },
  { title: '就労継続支援A型/B型', slug: 'employment-support', description: '制度構造、報酬、運営課題、note連載の整理。' },
  { title: '介護施設DX', slug: 'care-facility-dx', description: '介護施設の記録、連携、業務効率化に関する知見。' },
  { title: 'Obsidian活用', slug: 'obsidian', description: 'Obsidianでノートと公開wikiを育てる運用メモ。' },
  { title: 'GASツール', slug: 'gas-tools', description: 'Google Apps Scriptで作る小さな業務改善ツール集。' },
  { title: 'AUL Tools', slug: 'aul-tools', description: 'AUL DoXで作成・運用するツールの目次と解説。' },
  { title: 'note連載一覧', slug: 'note-series', description: 'note記事のシリーズ目次、補足資料、関連リンク。' },
  { title: '行政文書・制度メモ', slug: 'policy-docs', description: '行政文書、通知、制度解釈をあとから探せる形で整理。' },
  { title: 'AI音楽・YouTube制作メモ', slug: 'ai-music-youtube', description: 'AI制作、YouTube運用、制作ログの蓄積。' },
];

export function getCategoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function getCategorySlug(category: string, categorySlug?: string) {
  return categorySlug ?? categories.find((item) => item.title === category)?.slug ?? encodeURIComponent(category);
}
