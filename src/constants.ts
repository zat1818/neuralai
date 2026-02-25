export const API_BASE_URL = '';
export const SOCKET_URL = window.location.origin;

export const AI_PROVIDERS = [
  { id: 'gemini', name: 'Gemini', description: 'Google DeepMind powerful multimodal AI.', link: 'https://aistudio.google.com/app/apikey' },
  { id: 'groq', name: 'Groq', description: 'Ultra-fast inference engine for Llama/Mixtral.', link: 'https://console.groq.com/keys' },
  { id: 'mistral', name: 'Mistral', description: 'Efficient open-weight models from Mistral AI.', link: 'https://console.mistral.ai/api-keys/' },
  { id: 'cohere', name: 'Cohere', description: 'Enterprise-grade NLP and RAG capabilities.', link: 'https://dashboard.cohere.com/api-keys' },
  { id: 'openai', name: 'OpenAI', description: 'The industry standard GPT-4o and GPT-4.', link: 'https://platform.openai.com/api-keys' },
  { id: 'anthropic', name: 'Anthropic', description: 'Claude 3.5 Sonnet with high reasoning.', link: 'https://console.anthropic.com/settings/keys' },
  { id: 'xai', name: 'xAI / Grok', description: 'Real-time knowledge from X platform.', link: 'https://console.x.ai/' },
  { id: 'together', name: 'Together AI', description: 'Access to 100+ open-source models.', link: 'https://api.together.xyz/settings/api-keys' },
  { id: 'perplexity', name: 'Perplexity', description: 'Real-time web search integrated AI.', link: 'https://www.perplexity.ai/settings/api' },
];

export const TRADING_PAIRS = [
  'XAUUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'BTCUSD', 'ETHUSD', 'SOLUSD'
];

export const ANALYSIS_MODES = [
  { id: 'scalping', name: 'Scalping', description: '1-15m timeframe analysis' },
  { id: 'intraday', name: 'Intraday', description: '1h-4h timeframe analysis' },
  { id: 'swing', name: 'Swing', description: 'Daily timeframe analysis' },
];
