// ローカル専用の管理サーバー。公開サイト（ref.aul-dox.jp）とは無関係の、手元だけで動く道具。
// ブラウザの管理画面から、データ分析HTMLのアップロード・タイトル編集を行い、
// 「保存」で src/ にファイルを書き込み → git commit → git push まで一括実行する。
// 公開サイトの実体は従来どおり静的HTMLのまま（CMS化はしていない）。

import { createServer } from 'node:http';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, '..');
const TITLES_PATH = join(REPO_ROOT, 'src', 'data-titles.json');
const UI_PATH = join(SCRIPT_DIR, 'admin-ui.html');
const PORT = 4455;

const CATEGORIES = { kaigo: '介護分野', shogai: '障がい分野', keiei: '経営の見える化' };
const SLUG_RE = /^[a-zA-Z0-9._-]+$/;
const YM_RE = /^\d{4}-\d{2}$/;

// 種類ごとの配置ルール。
//   dashboard    -> src/dashboards/<category>/<slug>.html          （キー: dashboards/<category>/<slug>）
//   deep-research-> src/Deep-Research/<category>/<ym>/<slug>.html   （キー: Deep-Research/<category>/<ym>/<slug>）
const ROOTS = { dashboard: 'dashboards', 'deep-research': 'Deep-Research' };

function loadTitles() {
  try {
    return JSON.parse(readFileSync(TITLES_PATH, 'utf-8').replace(/^﻿/, '')) ?? {};
  } catch {
    return {};
  }
}

function saveTitles(map) {
  const sorted = Object.fromEntries(Object.entries(map).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(TITLES_PATH, `${JSON.stringify(sorted, null, 2)}\n`);
}

function extractTitle(html, fallback) {
  const match = html.match(/<h1>([\s\S]*?)<\/h1>/);
  if (!match) return fallback;
  return match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

// 既存のダッシュボード・Deep Researchファイルを一覧化（現在の表示タイトル付き）。
function listItems() {
  const titles = loadTitles();
  const items = [];
  for (const [type, root] of Object.entries(ROOTS)) {
    const baseDir = join(REPO_ROOT, 'src', root);
    if (!existsSync(baseDir)) continue;
    const entries = readdirSync(baseDir, { recursive: true, withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
      const abs = join(entry.parentPath ?? entry.path, entry.name);
      const rel = abs.slice(baseDir.length + 1).replace(/\\/g, '/').replace(/\.html$/, '');
      const key = `${root}/${rel}`;
      const category = rel.split('/')[0] ?? '';
      let html = '';
      try { html = readFileSync(abs, 'utf-8'); } catch {}
      items.push({
        type,
        key,
        category,
        categoryLabel: CATEGORIES[category] ?? category,
        title: titles[key]?.trim() || extractTitle(html, rel),
        overridden: Boolean(titles[key]?.trim()),
      });
    }
  }
  return items.sort((a, b) => a.key.localeCompare(b.key));
}

function runGit(paths, message) {
  const log = [];
  const run = (args) => {
    const out = execFileSync('git', args, { cwd: REPO_ROOT, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] });
    log.push(`$ git ${args.join(' ')}\n${out}`.trim());
    return out;
  };
  run(['add', '--', ...paths]);
  // ステージ差分が無ければ何もしない。
  try {
    execFileSync('git', ['diff', '--cached', '--quiet'], { cwd: REPO_ROOT });
    return { ok: true, changed: false, log: 'No changes to publish.' };
  } catch {
    // 差分あり（exit code 1）
  }
  run(['commit', '-m', message]);
  run(['push']);
  return { ok: true, changed: true, log: log.join('\n\n') };
}

function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'content-length': Buffer.byteLength(payload) });
  res.end(payload);
}

function readBody(req) {
  return new Promise((res, rej) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 5_000_000) { rej(new Error('body too large')); req.destroy(); }
    });
    req.on('end', () => res(data));
    req.on('error', rej);
  });
}

async function handleUpload(req, res) {
  const body = JSON.parse(await readBody(req));
  const { type, category, ym, slug, title, htmlContent } = body;

  if (!ROOTS[type]) return json(res, 400, { error: '種類が不正です。' });
  if (!CATEGORIES[category]) return json(res, 400, { error: '分野が不正です。' });
  if (!SLUG_RE.test(slug ?? '')) return json(res, 400, { error: 'スラッグは英数字・ハイフン・アンダースコアのみです。' });
  if (!title?.trim()) return json(res, 400, { error: 'タイトルを入力してください。' });
  if (!htmlContent?.trim()) return json(res, 400, { error: 'HTMLファイルが空です。' });
  if (type === 'deep-research' && !YM_RE.test(ym ?? '')) return json(res, 400, { error: '年月は YYYY-MM 形式で入力してください。' });

  const root = ROOTS[type];
  const relParts = type === 'deep-research' ? [category, ym, `${slug}.html`] : [category, `${slug}.html`];
  const relPath = join('src', root, ...relParts);
  const absPath = join(REPO_ROOT, relPath);

  if (existsSync(absPath)) return json(res, 409, { error: `同名ファイルが既に存在します: ${relPath.replace(/\\/g, '/')}` });

  mkdirSync(dirname(absPath), { recursive: true });
  writeFileSync(absPath, htmlContent);

  const key = `${root}/${relParts.join('/').replace(/\.html$/, '')}`;
  const titles = loadTitles();
  titles[key] = title.trim();
  saveTitles(titles);

  try {
    const result = runGit([relPath.replace(/\\/g, '/'), 'src/data-titles.json'], `Add ${type} ${key} via admin`);
    return json(res, 200, { ok: true, message: `公開しました: /${type === 'deep-research' ? 'reports' : 'data'}/${relParts.join('/').replace(/\.html$/, '')}/`, log: result.log });
  } catch (e) {
    return json(res, 500, { error: `保存はしましたが git 操作に失敗しました: ${e.message}` });
  }
}

async function handleTitle(req, res) {
  const body = JSON.parse(await readBody(req));
  const { key, title } = body;
  if (!key || typeof key !== 'string') return json(res, 400, { error: 'キーが不正です。' });
  if (!title?.trim()) return json(res, 400, { error: 'タイトルを入力してください。' });

  const titles = loadTitles();
  titles[key] = title.trim();
  saveTitles(titles);

  try {
    const result = runGit(['src/data-titles.json'], `Update title for ${key} via admin`);
    return json(res, 200, { ok: true, message: 'タイトルを更新しました。', log: result.log });
  } catch (e) {
    return json(res, 500, { error: `保存はしましたが git 操作に失敗しました: ${e.message}` });
  }
}

const server = createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
      const html = readFileSync(UI_PATH);
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      return res.end(html);
    }
    if (req.method === 'GET' && req.url === '/api/items') {
      return json(res, 200, { categories: CATEGORIES, items: listItems() });
    }
    if (req.method === 'POST' && req.url === '/api/upload') return await handleUpload(req, res);
    if (req.method === 'POST' && req.url === '/api/title') return await handleTitle(req, res);
    json(res, 404, { error: 'not found' });
  } catch (e) {
    json(res, 500, { error: e.message });
  }
});

// 127.0.0.1 のみにバインド（外部からアクセス不可）。
server.listen(PORT, '127.0.0.1', () => {
  console.log(`AUL DoX admin -> http://127.0.0.1:${PORT}/`);
  console.log('ブラウザで上記URLを開いてください。終了は Ctrl+C。');
});
