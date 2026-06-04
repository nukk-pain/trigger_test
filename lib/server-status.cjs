function toInteger(value, fallback) {
  const parsed = parseInt(value || fallback, 10);
  return Number.isFinite(parsed) ? parsed : parseInt(fallback, 10);
}

function getStatusPayload(env = process.env) {
  const proxyConfigured = Boolean(env.OPENROUTER_API_KEY);
  return {
    success: true,
    data: {
      provider: 'openrouter',
      proxyConfigured,
      proxyReady: proxyConfigured,
      model: env.OPENROUTER_MODEL || 'openrouter/auto',
      limits: {
        daily: toInteger(env.DAILY_REQUEST_LIMIT, '50'),
        monthly: toInteger(env.MONTHLY_REQUEST_LIMIT, '1000')
      },
      rateLimit: {
        limit: toInteger(env.SERVER_RATE_LIMIT_MAX || env.DAILY_REQUEST_LIMIT, '50'),
        windowSeconds: toInteger(env.SERVER_RATE_LIMIT_WINDOW_SECONDS, '86400')
      },
      environment: env.NODE_ENV || 'development'
    }
  };
}

module.exports = {
  getStatusPayload
};
