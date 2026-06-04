import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { handleChatRequest } = require('../lib/openrouter-proxy.cjs');

function getAllowedOrigins(env) {
  return new Set([
    ...(env.ALLOWED_ORIGINS || '').split(',').map(origin => origin.trim()).filter(Boolean),
    env.OPENROUTER_SITE_URL
  ].filter(Boolean));
}

function applyCors(req, res, env) {
  const origin = req.headers?.origin;
  const allowedOrigins = getAllowedOrigins(env);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (!origin) {
    return true;
  }

  if (allowedOrigins.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    return true;
  }

  return false;
}

export default async function handler(req, res) {
  const originAllowed = applyCors(req, res, process.env);
  if (!originAllowed) {
    res.status(403).json({ error: 'Origin not allowed' });
    return;
  }

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const result = await handleChatRequest({ req, env: process.env });
  for (const [key, value] of Object.entries(result.headers || {})) {
    res.setHeader(key, value);
  }
  res.status(result.status).json(result.body);
}
