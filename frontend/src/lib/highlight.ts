import type { HighlighterCore } from 'shiki/core';

/**
 * Lazily-created singleton shiki highlighter. We use the fine-grained core
 * bundle with only the grammars this curriculum needs, so the bundle stays small.
 * Dual themes are emitted as CSS variables (see `.vz-code` rules in globals.css),
 * which makes light/dark switching instant with no re-highlighting.
 */
let highlighterPromise: Promise<HighlighterCore> | null = null;

export const SUPPORTED_LANGS = [
  'python',
  'sql',
  'bash',
  'yaml',
  'dockerfile',
  'jinja',
  'json',
  'ini',
] as const;

export type CodeLang = (typeof SUPPORTED_LANGS)[number] | 'text';

async function createHighlighter(): Promise<HighlighterCore> {
  const [{ createHighlighterCore }, { createJavaScriptRegexEngine }] = await Promise.all([
    import('shiki/core'),
    import('shiki/engine/javascript'),
  ]);

  return createHighlighterCore({
    themes: [import('shiki/themes/github-light.mjs'), import('shiki/themes/github-dark.mjs')],
    langs: [
      import('shiki/langs/python.mjs'),
      import('shiki/langs/sql.mjs'),
      import('shiki/langs/bash.mjs'),
      import('shiki/langs/yaml.mjs'),
      import('shiki/langs/dockerfile.mjs'),
      import('shiki/langs/jinja.mjs'),
      import('shiki/langs/json.mjs'),
      import('shiki/langs/ini.mjs'),
    ],
    engine: createJavaScriptRegexEngine(),
  });
}

export function getHighlighter(): Promise<HighlighterCore> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter();
  }
  return highlighterPromise;
}

const htmlCache = new Map<string, string>();

export async function highlightToHtml(code: string, lang: CodeLang): Promise<string> {
  const key = `${lang}\u0000${code}`;
  const cached = htmlCache.get(key);
  if (cached) return cached;

  const highlighter = await getHighlighter();
  const html = highlighter.codeToHtml(code, {
    lang: lang === 'text' ? 'text' : lang,
    themes: { light: 'github-light', dark: 'github-dark' },
    defaultColor: false,
  });
  htmlCache.set(key, html);
  return html;
}

/** Map arbitrary fence labels (```py, ```sh, ...) onto supported grammars. */
export function normalizeLang(label?: string | null): CodeLang {
  const l = (label || '').toLowerCase().trim();
  switch (l) {
    case 'py':
    case 'python':
    case 'pyspark':
      return 'python';
    case 'sql':
    case 'postgresql':
    case 'postgres':
    case 'mysql':
    case 'sparksql':
      return 'sql';
    case 'bash':
    case 'sh':
    case 'shell':
    case 'zsh':
    case 'console':
      return 'bash';
    case 'yaml':
    case 'yml':
      return 'yaml';
    case 'docker':
    case 'dockerfile':
      return 'dockerfile';
    case 'jinja':
    case 'jinja2':
    case 'dbt':
      return 'jinja';
    case 'json':
      return 'json';
    case 'ini':
    case 'toml':
    case 'cfg':
      return 'ini';
    default:
      return 'text';
  }
}

/** Human readable label for the chip shown in the code block header. */
export const LANG_LABEL: Record<CodeLang, string> = {
  python: 'Python',
  sql: 'SQL',
  bash: 'Shell',
  yaml: 'YAML',
  dockerfile: 'Dockerfile',
  jinja: 'Jinja / dbt',
  json: 'JSON',
  ini: 'Config',
  text: 'Text',
};

/**
 * Pick a grammar for the lesson's main `code` snippet. Lessons store code as
 * a bare string without a language, so we combine module hints with a few
 * cheap content heuristics.
 */
export function detectLanguage(code: string, moduleId: string): CodeLang {
  const src = code.trim();
  const head = src.slice(0, 400);

  if (/\{%\s*(snapshot|macro|set|if|for)\b|\{\{\s*(ref|source|config)\s*\(/.test(src)) return 'jinja';
  if (/^FROM\s+\S+/m.test(head) && /^(RUN|COPY|CMD|WORKDIR|ENTRYPOINT)\b/m.test(src)) return 'dockerfile';
  if (/^#!\/(usr\/)?bin\/(env\s+)?(ba)?sh/.test(src) || /^set -[euo]/m.test(head)) return 'bash';
  if (/^(docker|git|kubectl|pip|curl|chmod|mkdir|cd|export|echo|cat|grep|ls)\s/m.test(head)) return 'bash';
  if (/^(version:|name:|apiVersion:|services:|on:|jobs:|models:|sources:)/m.test(head) && !/^\s*(def|import|from)\s/m.test(head)) {
    return 'yaml';
  }
  if (/^\s*(SELECT|WITH|CREATE|INSERT|UPDATE|DELETE|MERGE|ALTER|DROP)\b/im.test(head) && !/^\s*(import|from|def)\s/m.test(head)) {
    return 'sql';
  }
  if (/^\s*(import|from)\s+\w+|^\s*def\s+\w+\(/m.test(head)) return 'python';

  switch (moduleId) {
    case 'sql':
    case 'data_architecture':
    case 'dbt':
      return 'sql';
    case 'devops':
      return 'bash';
    default:
      return 'python';
  }
}
