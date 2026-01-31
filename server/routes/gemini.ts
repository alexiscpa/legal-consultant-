import { Router } from 'express';
import { getScenarioAdvice, reviewContract, chatStream } from '../services/geminiService.js';

const router = Router();

// Diagnostic endpoint
router.get('/status', (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY || '';
  res.json({
    apiKeySet: !!apiKey,
    apiKeyLength: apiKey.length,
    apiKeyPrefix: apiKey ? apiKey.substring(0, 8) + '...' : 'NOT SET'
  });
});

// Get scenario advice
router.post('/scenario', async (req, res) => {
  const { scenario } = req.body;
  if (!scenario) {
    return res.status(400).json({ error: 'Scenario is required' });
  }

  try {
    const result = await getScenarioAdvice(scenario);
    res.json(result);
  } catch (err: any) {
    console.error('Error getting scenario advice:', err);
    res.status(err.status || 500).json({ error: err.message || 'Failed to get advice' });
  }
});

// Review contract
router.post('/contract', async (req, res) => {
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ error: 'Contract content is required' });
  }

  try {
    const result = await reviewContract(content);
    res.json(result);
  } catch (err: any) {
    console.error('Error reviewing contract:', err);
    res.status(err.status || 500).json({ error: err.message || 'Failed to review contract' });
  }
});

// Chat with streaming response
router.post('/chat', async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    for await (const chunk of chatStream(message, history)) {
      res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
    }
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err: any) {
    console.error('Error in chat:', err);
    res.write(`data: ${JSON.stringify({ error: err.message || 'Chat failed' })}\n\n`);
    res.end();
  }
});

export default router;
