const { getClientEnvPayload } = require('./client-config.cjs');

function getPublicEnvPayload(env) {
  return {
    success: true,
    data: getClientEnvPayload(env)
  };
}

module.exports = { getPublicEnvPayload };
