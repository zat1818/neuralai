import { Router } from 'express';
import { pool } from './db';
import axios from 'axios';

const router = Router();

// Endpoint untuk memilih model AI (update preferensi user)
router.post('/choose-model', async (req, res) => {
  try {
    const { user_id, model_preference } = req.body;
    await pool.query('UPDATE api_keys SET model_preference = $1 WHERE user_id = $2', [model_preference, user_id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update model preference', details: err });
  }
});

// Endpoint analisis chart/sinyal (proxy ke provider AI sesuai API key user)
router.post('/analyze', async (req, res) => {
  try {
    const { user_id, chart_data, prompt } = req.body;
    // Ambil API key & model user
    const { rows } = await pool.query('SELECT provider, api_key, model_preference FROM api_keys WHERE user_id = $1 LIMIT 1', [user_id]);
    if (!rows.length) return res.status(400).json({ error: 'API key not found' });
    const { provider, api_key, model_preference } = rows[0];

    // Contoh: proxy ke OpenAI (atau provider lain sesuai kebutuhan)
    let aiResponse;
    if (provider === 'openai') {
      aiResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: model_preference || 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a trading signal assistant.' },
          { role: 'user', content: prompt + '\nChart data: ' + JSON.stringify(chart_data) }
        ]
      }, {
        headers: { 'Authorization': `Bearer ${api_key}` }
      });
      res.json({ result: aiResponse.data });
    } else {
      res.status(400).json({ error: 'Provider not supported yet' });
    }
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to analyze chart', details: err?.response?.data || err.message });
  }
});

// API Key CRUD sesuai frontend
router.get('/user/apikey', async (req, res) => {
  try {
    const user_id = req.headers['x-user-id'] || req.query.user_id;
    if (!user_id) return res.status(400).json({ error: 'user_id required' });
    const result = await pool.query('SELECT * FROM api_keys WHERE user_id = $1', [user_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch API keys', details: err });
  }
});

router.put('/user/apikey', async (req, res) => {
  try {
    const { user_id, provider, api_key, model_preference } = req.body;
    // Upsert
    const result = await pool.query(
      'INSERT INTO api_keys (user_id, provider, api_key, model_preference) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id, provider) DO UPDATE SET api_key = $3, model_preference = $4 RETURNING *',
      [user_id, provider, api_key, model_preference]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save API key', details: err });
  }
});

router.delete('/user/apikey/:provider', async (req, res) => {
  try {
    const user_id = req.headers['x-user-id'] || req.query.user_id;
    const { provider } = req.params;
    if (!user_id) return res.status(400).json({ error: 'user_id required' });
    await pool.query('DELETE FROM api_keys WHERE user_id = $1 AND provider = $2', [user_id, provider]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete API key', details: err });
  }
});

// Dummy test endpoint
router.post('/user/apikey/test', async (req, res) => {
  // Always return valid for now
  res.json({ valid: true });
});

// Endpoint models (dummy)
router.get('/models', async (req, res) => {
  const provider = req.query.provider as string | undefined;
  // Dummy: return 2 model per provider
  if (!provider) return res.json([]);
  res.json([
    { id: provider + '-model-1', name: provider.toUpperCase() + ' Model 1' },
    { id: provider + '-model-2', name: provider.toUpperCase() + ' Model 2' }
  ]);
});

// Endpoint signal generate
router.post('/signal/generate', async (req, res) => {
  try {
    const { user_id, provider, model, pair, mode } = req.body;
    // Dummy: return signal result
    res.json({
      signal: 'BUY',
      confidence: Math.random(),
      provider,
      model,
      pair,
      mode,
      generated_at: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate signal', details: err });
  }
});

export default router;
