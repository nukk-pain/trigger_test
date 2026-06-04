const { validateChatBody } = require('./chat-validation.cjs');
const {
  checkRateLimit,
  getClientKey,
  getUsageBucket,
  getWindowKeys,
  resetUsage
} = require('./rate-limit-store.cjs');

function getOpenRouterBaseUrl(env) {
  return (env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1').replace(/\/$/, '');
}

function getPublicConfig(env) {
  return {
    model: env.OPENROUTER_MODEL || '',
    maxTokens: parseNumber(env.MAX_TOKENS, 800),
    temperature: parseFloatValue(env.TEMPERATURE, 1)
  };
}

function parseNumber(value, fallback) {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseFloatValue(value, fallback) {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
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

async function handleChatRequest({ req, env, fetchImpl = fetch }) {
  const validation = validateChatBody(req.body, env);
  if (!validation.valid) {
    return {
      status: 400,
      body: {
        error: '유효한 chat messages 배열이 필요합니다.',
        code: 'CHAT_VALIDATION_FAILED'
      }
    };
  }
  const { messages } = req.body;

  const apiKey = env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return { status: 401, body: { error: 'OpenRouter API 키가 서버에 설정되지 않았습니다.' } };
  }

  const rateLimit = await checkRateLimit(env, req, new Date(), fetchImpl);
  if (!rateLimit.allowed) {
    return { status: rateLimit.status, body: rateLimit.body, headers: rateLimit.headers };
  }
  try {
    await rateLimit.record();
  } catch (_error) {
    return {
      status: 503,
      body: {
        error: '서버 사용량 제한 저장소를 사용할 수 없습니다. 잠시 후 다시 시도해주세요.',
        code: 'RATE_LIMIT_STORE_UNAVAILABLE'
      }
    };
  }

  try {
    const response = await fetchImpl(`${getOpenRouterBaseUrl(env)}/chat/completions`, {
      method: 'POST',
      headers: buildHeaders(env, apiKey),
      body: JSON.stringify(buildRequestBody(env, messages))
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        status: response.status,
        body: {
          error: 'AI 응답을 가져오지 못했습니다. 잠시 후 다시 시도해주세요.',
          code: 'UPSTREAM_CHAT_FAILED'
        }
      };
    }

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
        error: 'AI 응답을 가져오지 못했습니다. 잠시 후 다시 시도해주세요.',
        code: 'UPSTREAM_CHAT_FAILED'
      }
    };
  }
}

module.exports = {
  buildHeaders,
  buildRequestBody,
  checkRateLimit,
  getClientKey,
  getOpenRouterBaseUrl,
  getPublicConfig,
  getUsageBucket,
  getWindowKeys,
  handleChatRequest,
  resetUsage
};
