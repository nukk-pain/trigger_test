import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

function read(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

describe('refactor guardrails', () => {
  it('splits browser state and removes inline event handler templates', () => {
    const script = read('script.js');
    const app = read('src/browser/app.js');

    expect(script.trim()).toBe("import './src/browser/app.js';");
    expect(app.split('\n').length).toBeLessThanOrEqual(250);
    expect(app).toContain("from './app-state.js'");
    expect(read('src/browser/selection-ui.js')).toContain('export function setupBodyMapEvents');
    expect(read('src/browser/analysis-flow.js')).toContain('export async function analyzePain');
    expect(read('src/browser/notifications.js')).toContain('export function showNotification');
    expect(read('src/browser/guide-modal.js')).toContain('export function startInteractiveGuide');
    expect(app).not.toMatch(/onclick=/);
    expect(app).not.toMatch(/\.innerHTML\s*=/);
    expect(app).not.toContain('window.currentGuide');
  });

  it('uses OpenRouter runtime names without legacy provider aliases', () => {
    const runtimeConfig = read('config.js');
    const appScript = read('src/browser/app.js');
    const libraryConfig = read('lib/config.js');

    expect(`${runtimeConfig}\n${appScript}\n${libraryConfig}`).not.toMatch(/openaiConfig|geminiConfig|OpenAIConfig/);
    expect(runtimeConfig).toContain('window.openRouterConfig');
    expect(appScript).toContain('window.openRouterConfig');
  });

  it('keeps medical prompts in a dedicated module and attaches them at runtime', () => {
    const promptModule = read('lib/prompts.js');
    const runtimeConfig = read('config.js');
    const libraryConfig = read('lib/config.js');

    expect(promptModule).toContain('RED_FLAG_CHECK');
    expect(promptModule).toContain('응급상황');
    expect(runtimeConfig).toContain('window.MEDICAL_PROMPTS = MEDICAL_PROMPTS');
    expect(libraryConfig).not.toContain('const MEDICAL_PROMPTS =');
  });

  it('uses canonical lib modules for runtime config and env loading', () => {
    expect(read('config.js')).toContain("from './lib/config.js'");
    expect(read('env-loader.js')).toContain("from './lib/env-loader.js'");
    expect(read('index.html')).toContain('type="module" src="env-loader.js"');
    expect(read('index.html')).toContain('type="module" src="config.js"');
  });

  it('splits CSS into a base stylesheet loaded before feature styles', () => {
    const index = read('index.html');

    expect(index).toContain('href="styles/base.css"');
    expect(index.indexOf('href="styles/base.css"')).toBeLessThan(index.indexOf('href="styles.css"'));
  });
});
