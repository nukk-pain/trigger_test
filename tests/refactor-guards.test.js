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
    expect(index).toContain('href="styles/layout.css"');
    expect(index).toContain('href="styles/body-map.css"');
    expect(index).toContain('href="styles/analysis.css"');
    expect(read('styles.css').split('\n').length).toBeLessThan(2800);
  });

  it('keeps analysis flow as a coordinator over focused browser modules', () => {
    const analysisFlow = read('src/browser/analysis-flow.js');

    expect(analysisFlow.split('\n').length).toBeLessThanOrEqual(250);
    expect(analysisFlow).toContain("from './analysis-ai.js'");
    expect(analysisFlow).toContain("from './analysis-renderer.js'");
    expect(read('src/browser/analysis-ai.js')).toContain('export async function analyzeWithAI');
    expect(read('src/browser/analysis-renderer.js')).toContain('export function displayGPTResults');
    expect(read('src/browser/analysis-renderer.js')).toContain('export function showRedFlagWarning');
  });

  it('keeps general utilities split by responsibility while preserving re-exports', () => {
    const utils = read('lib/utils.js');

    expect(utils.split('\n').length).toBeLessThanOrEqual(80);
    expect(utils).toContain("from './area-display.js'");
    expect(utils).toContain("from './markdown-format.js'");
    expect(utils).toContain("from './validation.js'");
    expect(read('lib/area-display.js')).toContain('export function getAreaDisplayName');
    expect(read('lib/markdown-format.js')).toContain('export function formatAIResponse');
    expect(read('lib/validation.js')).toContain('export function validateStep1');
  });

  it('keeps data sets in dedicated modules with a compatibility barrel', () => {
    const data = read('lib/data.js');

    expect(data.split('\n').length).toBeLessThanOrEqual(40);
    expect(data).toContain("from './data/trigger-points.js'");
    expect(data).toContain("from './data/fascial-lines.js'");
    expect(data).toContain("from './data/red-flags.js'");
    expect(read('lib/data/trigger-points.js')).toContain('export const triggerPointsDB');
    expect(read('lib/data/fascial-lines.js')).toContain('export const fascialLinesDB');
    expect(read('lib/data/red-flags.js')).toContain('export const redFlagConditions');
  });

  it('splits env loader tests by subject', () => {
    expect(fs.existsSync(path.join(process.cwd(), 'tests/env-loader/env-loader.test.js'))).toBe(true);
    expect(fs.existsSync(path.join(process.cwd(), 'tests/env-loader/usage-tracker.test.js'))).toBe(true);
    expect(fs.existsSync(path.join(process.cwd(), 'tests/env-loader.test.js'))).toBe(false);
  });

  it('uses a single status payload helper and removes legacy API aliases', () => {
    expect(read('server.js')).toContain("require('./lib/server-status.cjs')");
    expect(read('api/status.js')).toContain("require('../lib/server-status.cjs')");
    expect(read('server.js')).not.toContain("app.get('/api/config'");
    expect(fs.existsSync(path.join(process.cwd(), 'api/gemini.js'))).toBe(false);
    expect(read('lib/env-loader.js')).not.toContain('/api/config');
  });
});
