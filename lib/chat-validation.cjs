const VALID_ROLES = new Set(['system', 'user', 'assistant']);
const DEFAULT_MAX_MESSAGES = 6;
const DEFAULT_MAX_MESSAGE_CHARS = 2000;
const DEFAULT_MAX_BODY_BYTES = 16384;

function parsePositiveInteger(value, fallback) {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getChatValidationConfig(env = {}) {
  return {
    maxMessages: parsePositiveInteger(env.MAX_CHAT_MESSAGES, DEFAULT_MAX_MESSAGES),
    maxMessageChars: parsePositiveInteger(env.MAX_CHAT_MESSAGE_CHARS, DEFAULT_MAX_MESSAGE_CHARS),
    maxBodyBytes: parsePositiveInteger(env.MAX_CHAT_BODY_BYTES, DEFAULT_MAX_BODY_BYTES)
  };
}

function byteLength(value) {
  return Buffer.byteLength(String(value), 'utf8');
}

function validateChatBody(body, env = {}) {
  const config = getChatValidationConfig(env);
  const serializedBody = JSON.stringify(body || {});

  if (byteLength(serializedBody) > config.maxBodyBytes) {
    return { valid: false };
  }

  const messages = body?.messages;
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > config.maxMessages) {
    return { valid: false };
  }

  const validMessages = messages.every(message => {
    if (!message || !VALID_ROLES.has(message.role)) {
      return false;
    }
    if (typeof message.content !== 'string' || message.content.trim().length === 0) {
      return false;
    }
    return message.content.length <= config.maxMessageChars;
  });

  return { valid: validMessages };
}

module.exports = {
  DEFAULT_MAX_BODY_BYTES,
  getChatValidationConfig,
  validateChatBody
};
