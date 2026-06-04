function parseInteger(value, fallback) {
  const parsed = parseInt(value || fallback, 10);
  return Number.isNaN(parsed) ? parseInt(fallback, 10) : parsed;
}

function parseFloatValue(value, fallback) {
  const parsed = parseFloat(value || fallback);
  return Number.isNaN(parsed) ? parseFloat(fallback) : parsed;
}

function getClientEnvPayload(env) {
  const dailyLimit = parseInteger(env.DAILY_REQUEST_LIMIT, '20');
  const monthlyLimit = parseInteger(env.MONTHLY_REQUEST_LIMIT, '200');

  return {
    DAILY_REQUEST_LIMIT: String(dailyLimit),
    MONTHLY_REQUEST_LIMIT: String(monthlyLimit),
    OPENROUTER_MODEL: env.OPENROUTER_MODEL || '',
    MAX_TOKENS: parseInteger(env.MAX_TOKENS, '800'),
    TEMPERATURE: parseFloatValue(env.TEMPERATURE, '1'),
    DAILY_LIMIT: dailyLimit,
    MONTHLY_LIMIT: monthlyLimit,
    ENABLE_AI_QA: env.ENABLE_AI_QA || 'false',
    ENABLE_DETAILED_ANALYSIS: env.ENABLE_DETAILED_ANALYSIS || 'true',
    OPENROUTER_SITE_URL: env.OPENROUTER_SITE_URL || '',
    OPENROUTER_APP_NAME: env.OPENROUTER_APP_NAME || ''
  };
}

module.exports = { getClientEnvPayload };
