const usageByWindow = new Map();

function getOpenRouterBaseUrl(env) {
  return (env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1').replace(/\/$/, '');
}

function getPublicConfig(env) {
  return {
    model: env.OPENROUTER_MODEL || 'openrouter/auto',
    maxTokens: parseInt(env.MAX_TOKENS || '1500', 10),
    temperature: parseFloat(env.TEMPERATURE || '1')
  };
}

function isValidMessage(message) {
  return Boolean(
    message &&
    ['system', 'user', 'assistant'].includes(message.role) &&
    typeof message.content === 'string' &&
    message.content.trim().length > 0
  );
}

function validateMessages(messages) {
  return Array.isArray(messages) && messages.length > 0 && messages.every(isValidMessage);
}

function buildHeaders(env, apiKey) {
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  };

  if (env.OPENROUTER_SITE_URL) {
    headers['HTTP-Referer'] = env.OPENROUTER_SITE_URL;
  }

  if (env.OPENROUTER_APP_NAME) {
    headers['X-Title'] = env.OPENROUTER_APP_NAME;
  }

  return headers;
}

function buildRequestBody(env, messages) {
  const config = getPublicConfig(env);
  return {
    model: config.model,
    messages,
    max_tokens: config.maxTokens,
    temperature: config.temperature,
    stream: false
  };
}

function getClientKey(req) {
  return req.headers?.['x-forwarded-for'] || req.headers?.['x-real-ip'] || req.socket?.remoteAddress || 'local';
}

function getWindowKeys(now = new Date()) {
  return {
    day: now.toISOString().slice(0, 10),
    month: now.toISOString().slice(0, 7)
  };
}

function getUsageBucket(clientKey, now = new Date()) {
  const windows = getWindowKeys(now);
  const key = `${clientKey}:${windows.day}:${windows.month}`;
  if (!usageByWindow.has(key)) {
    usageByWindow.set(key, { daily: 0, monthly: 0 });
  }
  return usageByWindow.get(key);
}

function checkRateLimit(env, req, now = new Date()) {
  const dailyLimit = parseInt(env.SERVER_RATE_LIMIT_MAX || env.DAILY_REQUEST_LIMIT || '50', 10);
  const monthlyLimit = parseInt(env.MONTHLY_REQUEST_LIMIT || '1000', 10);
  const windowSeconds = parseInt(env.SERVER_RATE_LIMIT_WINDOW_SECONDS || '86400', 10);
  const bucket = getUsageBucket(getClientKey(req), now);

  if (bucket.daily >= dailyLimit || bucket.monthly >= monthlyLimit) {
    return {
      allowed: false,
      status: 429,
      headers: { 'Retry-After': String(windowSeconds) },
      body: {
        error: '서버 사용량 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
        retryAfterSeconds: windowSeconds,
        limit: dailyLimit,
        windowSeconds
      }
    };
  }

  return {
    allowed: true,
    record() {
      bucket.daily += 1;
      bucket.monthly += 1;
    }
  };
}

function resetUsage() {
  usageByWindow.clear();
}

async function handleChatRequest({ req, env, fetchImpl = fetch }) {
  const { messages } = req.body || {};
  if (!validateMessages(messages)) {
    return { status: 400, body: { error: '유효한 messages 배열이 필요합니다.' } };
  }

  const apiKey = env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return { status: 401, body: { error: 'OpenRouter API 키가 서버에 설정되지 않았습니다.' } };
  }

  const rateLimit = checkRateLimit(env, req);
  if (!rateLimit.allowed) {
    return { status: rateLimit.status, body: rateLimit.body, headers: rateLimit.headers };
  }

  try {
    const response = await fetchImpl(`${getOpenRouterBaseUrl(env)}/chat/completions`, {
      method: 'POST',
      headers: buildHeaders(env, apiKey),
      body: JSON.stringify(buildRequestBody(env, messages))
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = data.error?.message || data.error || `HTTP ${response.status}`;
      return { status: response.status, body: { error: message } };
    }

    rateLimit.record();
    return {
      status: 200,
      body: {
        output: data.choices?.[0]?.message?.content || '',
        usage: data.usage
      }
    };
  } catch (error) {
    console.error('OpenRouter API 호출 오류:', error);
    return {
      status: 500,
      body: {
        error: 'OpenRouter API 호출 중 오류 발생',
        details: error.message || '알 수 없는 오류'
      }
    };
  }
}

module.exports = {
  buildHeaders,
  buildRequestBody,
  getClientKey,
  getOpenRouterBaseUrl,
  getPublicConfig,
  handleChatRequest,
  resetUsage,
  validateMessages
};
