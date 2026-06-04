import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { getStatusPayload } = require('../lib/server-status.cjs');

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  res.status(200).json(getStatusPayload(process.env));
}
