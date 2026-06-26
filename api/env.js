const { getPublicEnvPayload } = require('../lib/public-env-config.cjs');

module.exports = function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        res.status(200).json(getPublicEnvPayload(process.env));
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to load environment variables',
            message: error.message
        });
    }
};
