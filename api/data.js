const { createClient } = require('redis');

// Cache the connection client across serverless function warm starts
let client;

async function getRedisClient() {
  if (!client) {
    client = createClient({
      url: process.env.KV_REDIS_URL
    });
    client.on('error', (err) => console.error('Redis Client Error', err));
    await client.connect();
  }
  return client;
}

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const redis = await getRedisClient();

    if (req.method === 'GET') {
      const { key } = req.query;
      if (!key) {
        return res.status(400).json({ error: 'Missing key parameter' });
      }
      const val = await redis.get(key);
      const data = val ? JSON.parse(val) : null;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { key, data } = req.body;
      if (!key) {
        return res.status(400).json({ error: 'Missing key parameter' });
      }
      await redis.set(key, JSON.stringify(data));
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};
