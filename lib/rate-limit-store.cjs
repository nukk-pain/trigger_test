const usageByWindow = new Map();

function parsePositiveInteger(value, fallback) {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeClientKey(value) {
  if (typeof value !== 'string') {
    return '';
  }
  return value.split(',')[0].trim();
}

function getClientKey(req) {
  return normalizeClientKey(req.headers?.['x-forwarded-for']) ||
    normalizeClientKey(req.headers?.['x-real-ip']) ||
    normalizeClientKey(req.socket?.remoteAddress) ||
    'local';
}

function getWindowKeys(now = new Date()) {
  return {
    day: now.toISOString().slice(0, 10),
    month: now.toISOString().slice(0, 7)
  };
}

function getLimits(env) {
  const maxTokens = parsePositiveInteger(env.MAX_TOKENS, 800);
  const dailyLimit = parsePositiveInteger(env.SERVER_RATE_LIMIT_MAX || env.DAILY_REQUEST_LIMIT, 20);
  const monthlyLimit = parsePositiveInteger(env.MONTHLY_REQUEST_LIMIT, 200);
  return {
    dailyLimit,
    monthlyLimit,
    windowSeconds: parsePositiveInteger(env.SERVER_RATE_LIMIT_WINDOW_SECONDS, 86400),
    dailyTokenBudget: parsePositiveInteger(env.DAILY_TOKEN_BUDGET, dailyLimit * (maxTokens + 500)),
    monthlyTokenBudget: parsePositiveInteger(env.MONTHLY_TOKEN_BUDGET, monthlyLimit * (maxTokens + 500)),
    maxTokens
  };
}

function estimateTokenCost(body, env) {
  const messages = Array.isArray(body?.messages) ? body.messages : [];
  const inputChars = messages.reduce((total, message) => {
    return total + (typeof message.content === 'string' ? message.content.length : 0);
  }, 0);
  return Math.ceil(inputChars / 4) + getLimits(env).maxTokens;
}

function getUsageBucket(clientKey, now = new Date()) {
  const windows = getWindowKeys(now);
  const keys = getCounterKeys(clientKey, windows);
  for (const key of Object.values(keys)) {
    if (!usageByWindow.has(key)) {
      usageByWindow.set(key, 0);
    }
  }

  return {
    daily: usageByWindow.get(keys.daily),
    monthly: usageByWindow.get(keys.monthly),
    dailyTokens: usageByWindow.get(keys.dailyTokens),
    monthlyTokens: usageByWindow.get(keys.monthlyTokens),
    record(tokenCost = 0) {
      usageByWindow.set(keys.daily, usageByWindow.get(keys.daily) + 1);
      usageByWindow.set(keys.monthly, usageByWindow.get(keys.monthly) + 1);
      usageByWindow.set(keys.dailyTokens, usageByWindow.get(keys.dailyTokens) + tokenCost);
      usageByWindow.set(keys.monthlyTokens, usageByWindow.get(keys.monthlyTokens) + tokenCost);
    }
  };
}

function getCounterKeys(clientKey, windows) {
  return {
    daily: `rl:${clientKey}:day:${windows.day}:requests`,
    monthly: `rl:${clientKey}:month:${windows.month}:requests`,
    dailyTokens: `rl:${clientKey}:day:${windows.day}:tokens`,
    monthlyTokens: `rl:${clientKey}:month:${windows.month}:tokens`
  };
}

function resetUsage() {
  usageByWindow.clear();
}

function shouldUseUpstash(env) {
  return env.RATE_LIMIT_STORE === 'upstash';
}

function isDurableRequired(env) {
  if (env.REQUIRE_DURABLE_RATE_LIMIT === 'false') return false;
  return env.NODE_ENV === 'production' && !shouldUseUpstash(env);
}

function unavailableResult() {
  return {
    allowed: false,
    status: 503,
    body: {
      error: '서버 사용량 제한 저장소를 사용할 수 없습니다. 잠시 후 다시 시도해주세요.',
      code: 'RATE_LIMIT_STORE_UNAVAILABLE'
    }
  };
}

async function readUpstashUsage(env, clientKey, now, fetchImpl) {
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    return unavailableResult();
  }

  const windows = getWindowKeys(now);
  const keys = getCounterKeys(clientKey, windows);
  const response = await fetchImpl(`${env.UPSTASH_REDIS_REST_URL.replace(/\/$/, '')}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify([
      ['GET', keys.daily],
      ['GET', keys.monthly],
      ['GET', keys.dailyTokens],
      ['GET', keys.monthlyTokens]
    ])
  });

  if (!response.ok) {
    return unavailableResult();
  }

  const payload = await response.json().catch(() => ({}));
  const values = Array.isArray(payload)
    ? payload.map(item => item?.result)
    : Array.isArray(payload.result) ? payload.result : [];
  const countAt = index => {
    const value = Array.isArray(values[index]) ? values[index][1] : values[index];
    return parsePositiveInteger(value, 0);
  };

  return {
    daily: countAt(0),
    monthly: countAt(1),
    dailyTokens: countAt(2),
    monthlyTokens: countAt(3),
    record: async tokenCost => {
      await writeUpstashUsage(env, keys, tokenCost, fetchImpl);
    }
  };
}

async function reserveUpstashUsage(env, req, now, fetchImpl) {
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN || !fetchImpl) {
    return unavailableResult();
  }

  const limits = getLimits(env);
  const tokenCost = estimateTokenCost(req.body, env);
  const keys = getCounterKeys(getClientKey(req), getWindowKeys(now));
  const ttlSeconds = parsePositiveInteger(env.SERVER_RATE_LIMIT_WINDOW_SECONDS, 86400) * 32;

  try {
    const response = await fetchImpl(`${env.UPSTASH_REDIS_REST_URL.replace(/\/$/, '')}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([
        ['INCR', keys.daily],
        ['INCR', keys.monthly],
        ['INCRBY', keys.dailyTokens, tokenCost],
        ['INCRBY', keys.monthlyTokens, tokenCost],
        ['EXPIRE', keys.daily, ttlSeconds],
        ['EXPIRE', keys.monthly, ttlSeconds],
        ['EXPIRE', keys.dailyTokens, ttlSeconds],
        ['EXPIRE', keys.monthlyTokens, ttlSeconds]
      ])
    });

    if (!response.ok) {
      return unavailableResult();
    }

    const payload = await response.json().catch(() => ({}));
    const values = parsePipelineResults(payload);
    if (!values || values.length < 4 || !values.slice(0, 4).every(isCounterValue)) {
      return unavailableResult();
    }
    const counts = {
      daily: parsePositiveInteger(values[0], 0),
      monthly: parsePositiveInteger(values[1], 0),
      dailyTokens: parsePositiveInteger(values[2], 0),
      monthlyTokens: parsePositiveInteger(values[3], 0)
    };
    return buildLimitResult(counts, limits, true);
  } catch (_error) {
    return unavailableResult();
  }
}

function isCounterValue(value) {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0;
}

function parsePipelineResults(payload) {
  if (Array.isArray(payload)) {
    if (payload.some(item => item?.error)) {
      return null;
    }
    return payload.map(item => item?.result);
  }

  if (Array.isArray(payload.result)) {
    return payload.result;
  }

  return null;
}

async function writeUpstashUsage(env, keys, tokenCost, fetchImpl) {
  const ttlSeconds = parsePositiveInteger(env.SERVER_RATE_LIMIT_WINDOW_SECONDS, 86400) * 32;
  const response = await fetchImpl(`${env.UPSTASH_REDIS_REST_URL.replace(/\/$/, '')}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify([
      ['INCR', keys.daily],
      ['INCR', keys.monthly],
      ['INCRBY', keys.dailyTokens, tokenCost],
      ['INCRBY', keys.monthlyTokens, tokenCost],
      ['EXPIRE', keys.daily, ttlSeconds],
      ['EXPIRE', keys.monthly, ttlSeconds],
      ['EXPIRE', keys.dailyTokens, ttlSeconds],
      ['EXPIRE', keys.monthlyTokens, ttlSeconds]
    ])
  });
  if (!response.ok) {
    throw new Error('Rate limit store write failed');
  }
}

async function readUsage(env, req, now = new Date(), fetchImpl = globalThis.fetch) {
  const clientKey = getClientKey(req);
  if (shouldUseUpstash(env)) {
    if (!fetchImpl) {
      return unavailableResult();
    }
    try {
      return await readUpstashUsage(env, clientKey, now, fetchImpl);
    } catch (_error) {
      return unavailableResult();
    }
  }

  if (isDurableRequired(env)) {
    return unavailableResult();
  }

  return getUsageBucket(clientKey, now);
}

async function checkRateLimit(env, req, now = new Date(), fetchImpl = globalThis.fetch) {
  const limits = getLimits(env);
  const tokenCost = estimateTokenCost(req.body, env);
  if (shouldUseUpstash(env)) {
    return reserveUpstashUsage(env, req, now, fetchImpl);
  }

  const bucket = await readUsage(env, req, now, fetchImpl);
  if (bucket.allowed === false) {
    return bucket;
  }

  return buildLimitResult({
    daily: bucket.daily + 1,
    monthly: bucket.monthly + 1,
    dailyTokens: bucket.dailyTokens + tokenCost,
    monthlyTokens: bucket.monthlyTokens + tokenCost
  }, limits, false, () => bucket.record(tokenCost));
}

function buildLimitResult(counts, limits, alreadyRecorded, recordFn) {
  const checks = [
    ['daily', counts.daily, limits.dailyLimit],
    ['monthly', counts.monthly, limits.monthlyLimit],
    ['dailyTokens', counts.dailyTokens, limits.dailyTokenBudget],
    ['monthlyTokens', counts.monthlyTokens, limits.monthlyTokenBudget]
  ];
  const exhausted = checks.find(([_name, used, limit]) => used > limit);

  if (exhausted) {
    const [exhaustedWindow, _used, limit] = exhausted;
    return {
      allowed: false,
      status: 429,
      headers: { 'Retry-After': String(limits.windowSeconds) },
      body: {
        error: `${exhaustedWindow.startsWith('daily') ? '일일' : '월간'} 서버 사용량 한도를 초과했습니다. 잠시 후 다시 시도해주세요.`,
        code: 'RATE_LIMIT_EXCEEDED',
        exhaustedWindow,
        retryAfterSeconds: limits.windowSeconds,
        limit,
        windowSeconds: limits.windowSeconds
      }
    };
  }

  return {
    allowed: true,
    record() {
      if (alreadyRecorded) return undefined;
      return recordFn();
    }
  };
}

module.exports = {
  checkRateLimit,
  estimateTokenCost,
  getClientKey,
  getLimits,
  getUsageBucket,
  getWindowKeys,
  resetUsage
};
