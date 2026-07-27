import { readdirSync, statSync, mkdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname, sep, basename } from 'path';
import TurndownService from 'turndown';

const DOCS_DIR = join(process.cwd(), 'docs');
const OUTPUT_DIR = join(process.cwd(), 'docs-md');

const turndown = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
});

turndown.addRule('codeBlock', {
  filter: (n) => n.tagName === 'PRE',
  replacement: (_, n) => {
    const code = n.textContent?.trim() || '';
    const langClass = n.querySelector('code')?.className || '';
    const lang = langClass.match(/language-(\w+)/)?.[1] || '';
    return `\n\`\`\`${lang}\n${code}\n\`\`\`\n\n`;
  },
});
turndown.addRule('images', {
  filter: (n) => n.tagName === 'IMG',
  replacement: (_, n) => `![${n.getAttribute('alt') || ''}](${n.getAttribute('src') || ''})`,
});
turndown.addRule('relativeLinks', {
  filter: (n) => n.tagName === 'A' && n.hasAttribute('href'),
  replacement: (content, n) => {
    const href = n.getAttribute('href') || '';
    if (href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) {
      return `[${content}](${href})`;
    }
    const mdHref = href.replace(/\.html(#.*)?$/, '.md$1');
    return `[${content}](${mdHref})`;
  },
});

function extractContent(html) {
  // Find <div class="content custom">...</div>
  const match = html.match(/<div[^>]*class="content\s+custom[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?:<script|<\/body>)/);
  if (match) return match[1];

  // Fallback: find any div with class containing "content"
  const fallback = html.match(/<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/);
  if (fallback) return fallback[1];

  // Last resort: return everything between <body> and </body>
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/);
  if (bodyMatch) return bodyMatch[1];

  return html;
}

function collectHtmlFiles(dir) {
  const results = [];
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      try {
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
          results.push(...collectHtmlFiles(fullPath));
        } else if (entry.toLowerCase().endsWith('.html')) {
          results.push(fullPath);
        }
      } catch { /* skip */ }
    }
  } catch { /* skip */ }
  return results;
}

function convertFile(htmlPath) {
  const relPath = htmlPath.replace(DOCS_DIR + sep, '').replace(/\\/g, '/');
  const outputPath = join(OUTPUT_DIR, relPath.replace(/\.html$/, '.md'));
  try {
    const html = readFileSync(htmlPath, 'utf-8');
    const content = extractContent(html);
    let md = turndown.turndown(content);
    // Clean up excessive whitespace
    md = md.replace(/\n{4,}/g, '\n\n\n').replace(/^[ \t]+/gm, '').replace(/\n{3,}/g, '\n\n').trim();
    // Add title from filename if not present
    const title = basename(htmlPath, '.html').replace(/[-_]/g, ' ');
    if (!md.startsWith('#')) {
      md = `# ${title}\n\n${md}`;
    }
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, md, 'utf-8');
    console.log(`  ✓ ${relPath.replace(/\.html$/, '.md')}`);
    return true;
  } catch (err) {
    console.log(`  ✗ ${basename(htmlPath)}: ${err.message}`);
    return false;
  }
}

console.log('HTML -> Markdown 批量转换 (content-only mode)');
console.log(`输入: ${DOCS_DIR}`);
console.log(`输出: ${OUTPUT_DIR}\n`);

if (!existsSync(DOCS_DIR)) {
  console.error(`ERROR: ${DOCS_DIR} 不存在`);
  process.exit(1);
}

const htmlFiles = collectHtmlFiles(DOCS_DIR);
console.log(`找到 ${htmlFiles.length} 个 HTML 文件\n`);

let ok = 0, fail = 0;
for (const f of htmlFiles) {
  if (convertFile(f)) ok++; else fail++;
}

console.log(`\n完成: ${ok} 成功, ${fail} 失败`);
console.log(`输出目录: ${OUTPUT_DIR}`);
