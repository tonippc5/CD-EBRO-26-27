const { kv } = require('@vercel/kv');

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
    if (req.method === 'GET') {
      const { key } = req.query;
      if (!key) {
        return res.status(400).json({ error: 'Missing key parameter' });
      }
      const data = await kv.get(key);
      return res.status(200).json(data || null);
    }

    if (req.method === 'POST') {
      const { key, data } = req.body;
      if (!key) {
        return res.status(400).json({ error: 'Missing key parameter' });
      }
      await kv.set(key, data);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};
