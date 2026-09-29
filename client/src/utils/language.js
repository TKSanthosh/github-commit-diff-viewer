import Prism from 'prismjs';

// Load common language components
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-java';

const EXTENSION_MAP = {
  js: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  jsx: 'jsx',
  ts: 'typescript',
  tsx: 'jsx',
  json: 'json',
  py: 'python',
  go: 'go',
  css: 'css',
  scss: 'css',
  html: 'markup',
  xml: 'markup',
  svg: 'markup',
  md: 'markdown',
  markdown: 'markdown',
  sh: 'bash',
  bash: 'bash',
  zsh: 'bash',
  sql: 'sql',
  c: 'c',
  h: 'c',
  cpp: 'cpp',
  hpp: 'cpp',
  cc: 'cpp',
  java: 'java'
};

/**
 * Detects language identifier for Prism from a file path.
 *
 * @param {string} filePath
 * @returns {string|null} Prism language grammar name or null
 */
export function detectLanguage(filePath) {
  if (!filePath || typeof filePath !== 'string') return null;
  const match = filePath.match(/\.([a-zA-Z0-9]+)$/);
  if (!match) return null;
  const ext = match[1].toLowerCase();
  return EXTENSION_MAP[ext] || null;
}

/**
 * Highlights a single line of code with Prism while strictly preserving the prefix.
 *
 * @param {string} content - Raw diff line with prefix ('+', '-', or ' ')
 * @param {string|null} language - Language name
 * @returns {{ prefix: string, highlightedHtml: string }}
 */
export function highlightDiffLine(content, language) {
  if (!content) {
    return { prefix: ' ', highlightedHtml: '' };
  }

  const prefix = content.charAt(0);
  const codeText = content.substring(1);

  if (language && Prism.languages[language]) {
    try {
      const highlighted = Prism.highlight(codeText, Prism.languages[language], language);
      return {
        prefix,
        highlightedHtml: highlighted
      };
    } catch (e) {
      // Fallback to plain escaped text if highlighting fails
    }
  }

  return {
    prefix,
    highlightedHtml: escapeHtml(codeText)
  };
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
