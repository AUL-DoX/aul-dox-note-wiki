import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const NOTE_LINKS_PATH = new URL('../data/note-links.json', import.meta.url);
const WIKI_ROOT = new URL('../src/content/wiki/', import.meta.url);
const OUTPUT_PATH = new URL('../reports/note-link-suggestions.md', import.meta.url);

const STOP_WORDS = new Set([
  'aul',
  'dox',
  'auldox',
  'note',
  'wiki',
  '一覧',
  'メモ',
  'シリーズ',
  '記事',
  '活用',
  'ツール',
]);

function normalize(value) {
  return value.toLowerCase().replace(/[!"#$%&'()*+,\-.／/:;<=>?@[\\\]^_`{|}~、。！？「」『』【】（）・\s]/g, '');
}

function tokenize(value) {
  const tokens = new Set();
  const normalized = normalize(value);

  for (const word of value.split(/[\s,、。！？「」『』【】（）・\/]+/)) {
    const clean = normalize(word.trim());
    if (clean.length >= 2 && !STOP_WORDS.has(clean)) {
      tokens.add(clean);
    }
  }

  for (const match of normalized.matchAll(/[a-z0-9]{2,}|[\u3040-\u30ff\u3400-\u9fff]{2,}/g)) {
    const token = match[0];
    if (!STOP_WORDS.has(token)) {
      tokens.add(token);
    }
  }

  return [...tokens];
}

function extractFrontmatter(markdown) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    return {};
  }

  const block = match[1];
  const readString = (key) => block.match(new RegExp(`^${key}:\\s*\"?([^\"\\n]+)\"?`, 'm'))?.[1] ?? '';
  const tagsLine = block.match(/^tags:\s*\[(.*?)\]/m)?.[1] ?? '';
  const tags = tagsLine
    .split(',')
    .map((tag) => tag.trim().replace(/^"|"$/g, ''))
    .filter(Boolean);

  return {
    title: readString('title'),
    description: readString('description'),
    category: readString('category'),
    tags: tags.join(' '),
  };
}

async function listMarkdownFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listMarkdownFiles(absolute)));
    } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
      files.push(absolute);
    }
  }

  return files;
}

function scoreArticle(page, article) {
  const pageTokens = tokenize(`${page.title} ${page.description} ${page.category} ${page.tags}`);
  const articleText = `${article.title} ${article.description}`;
  const articleNormalized = normalize(articleText);
  let score = 0;
  const matched = [];

  for (const token of pageTokens) {
    if (articleNormalized.includes(normalize(token))) {
      score += token.length >= 4 ? 2 : 1;
      matched.push(token);
    }
  }

  return { score, matched: [...new Set(matched)] };
}

const noteLinks = JSON.parse((await readFile(NOTE_LINKS_PATH, 'utf-8')).replace(/^\uFEFF/, ''));
const markdownFiles = await listMarkdownFiles(fileURLToPath(WIKI_ROOT));
const pages = await Promise.all(
  markdownFiles.map(async (file) => {
    const markdown = await readFile(file, 'utf-8');
    const frontmatter = extractFrontmatter(markdown);
    return {
      file: path.relative(process.cwd(), file).replaceAll('\\', '/'),
      title: frontmatter.title ?? path.basename(file),
      description: frontmatter.description ?? '',
      category: frontmatter.category ?? '',
      tags: frontmatter.tags ?? '',
    };
  }),
);

const sections = pages.map((page) => {
  const suggestions = noteLinks.items
    .map((article) => ({ article, ...scoreArticle(page, article) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  const lines = [`## ${page.title}`, '', `- file: \`${page.file}\``];

  if (suggestions.length === 0) {
    lines.push('- 候補なし');
    return lines.join('\n');
  }

  lines.push('');
  for (const suggestion of suggestions) {
    lines.push(
      `- score ${suggestion.score}: [${suggestion.article.title}](${suggestion.article.url})`,
      `  - matched: ${suggestion.matched.join(', ') || 'なし'}`,
    );
  }

  return lines.join('\n');
});

const report = [
  '# note Link Suggestions',
  '',
  `source: ${noteLinks.source}`,
  `fetchedAt: ${noteLinks.fetchedAt}`,
  '',
  '候補は自動採点です。採用するURLだけ各Markdownの `noteArticles` に転記してください。',
  '',
  ...sections,
  '',
].join('\n');

await mkdir(new URL('../reports/', import.meta.url), { recursive: true });
await writeFile(OUTPUT_PATH, report);

console.log(`Wrote suggestions -> reports/note-link-suggestions.md`);
