import noteMagazines from '../../data/note-magazines.json';

const legacyCategories = [
  { title: '福祉DX', slug: 'welfare-dx', description: '福祉現場の業務整理、記録、共有、改善のためのDXメモ。' },
  { title: '就労継続支援A型/B型', slug: 'employment-support', description: '制度構造、報酬、運営課題、note連載の整理。' },
  { title: 'Obsidian活用', slug: 'obsidian', description: 'Obsidianでノートと公開wikiを育てる運用メモ。' },
  { title: 'GASツール', slug: 'gas-tools', description: 'Google Apps Scriptで作る小さな業務改善ツール集。' },
  { title: 'AUL Tools', slug: 'aul-tools', description: 'AUL DoXで作成・運用するツールの目次と解説。' },
];

const magazineCategories = noteMagazines.magazines.map((magazine) => ({
  title: magazine.title,
  slug: magazine.key,
  description: `noteマガジン「${magazine.title}」に収録された記事。`,
}));

export const UNCATEGORIZED_SLUG = 'uncategorized';

export const categories = [
  ...legacyCategories,
  ...magazineCategories,
  { title: '未分類', slug: UNCATEGORIZED_SLUG, description: 'マガジンに含まれていない記事（古い記事、単発の記事など）。' },
];

export function getCategoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function getCategorySlug(category: string, categorySlug?: string) {
  return categorySlug ?? categories.find((item) => item.title === category)?.slug ?? encodeURIComponent(category);
}
