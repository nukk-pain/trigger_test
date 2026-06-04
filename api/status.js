function getStatusPayload() {
  const proxyConfigured = Boolean(process.env.OPENROUTER_API_KEY);
  return {
    success: true,
    data: {
      provider: 'openrouter',
      proxyConfigured,
      proxyReady: proxyConfigured,
      model: process.env.OPENROUTER_MODEL || 'openrouter/auto',
      limits: {
        daily: parseInt(process.env.DAILY_REQUEST_LIMIT || '50', 10),
        monthly: parseInt(process.env.MONTHLY_REQUEST_LIMIT || '1000', 10)
      },
      rateLimit: {
        limit: parseInt(process.env.SERVER_RATE_LIMIT_MAX || process.env.DAILY_REQUEST_LIMIT || '50', 10),
        windowSeconds: parseInt(process.env.SERVER_RATE_LIMIT_WINDOW_SECONDS || '86400', 10)
      },
      environment: process.env.NODE_ENV || 'development'
    }
  };
}

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  res.status(200).json(getStatusPayload());
}
