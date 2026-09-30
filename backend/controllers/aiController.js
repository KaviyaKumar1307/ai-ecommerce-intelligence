const aiService = require('../services/aiService');

const semanticSearch = async (req, res, next) => {
  try {
    const { q, query, limit = 10 } = { ...req.query, ...req.body };
    const searchQuery = q || query;

    if (!searchQuery || !searchQuery.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required.'
      });
    }

    const userId = req.user ? req.user.id : null;
    const result = await aiService.semanticSearch(searchQuery.trim(), parseInt(limit, 10), userId);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getRecommendations = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : (req.query.user_id ? parseInt(req.query.user_id, 10) : null);
    const productId = req.query.product_id ? parseInt(req.query.product_id, 10) : null;
    const strategy = req.query.strategy || 'HYBRID';
    const limit = parseInt(req.query.limit || '8', 10);

    const result = await aiService.getRecommendations(userId, productId, strategy, limit);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const shoppingAssistant = async (req, res, next) => {
  try {
    const { message, history } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required.'
      });
    }

    const result = await aiService.shoppingAssistant(message.trim(), history || []);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getForecast = async (req, res, next) => {
  try {
    const horizon = parseInt(req.query.horizon || '30', 10);
    const result = await aiService.getSalesForecast(horizon);

    // Normalize response for frontend: frontend expects { success, data: { predictions, model_metrics } }
    const rawData = result.data || {};
    const predictions = rawData.forecast || rawData.predictions || [];
    const model_metrics = rawData.metrics || rawData.model_metrics || {};

    return res.status(200).json({
      success: true,
      fallback: result.fallback || false,
      warning: result.warning,
      data: {
        predictions,
        model_metrics,
        model_name: rawData.model_name || 'LinearRegression'
      }
    });
  } catch (error) {
    next(error);
  }
};

const getSegments = async (req, res, next) => {
  try {
    const result = await aiService.getCustomerSegmentation();
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getAIStatus = async (req, res, next) => {
  try {
    const health = await aiService.checkHealth();
    let modelInfo = null;
    if (health.online) {
      modelInfo = await aiService.getModelInfo();
    }

    return res.status(200).json({
      success: true,
      service: 'FastAPI AI Engine',
      online: health.online,
      health: health.data || health.error,
      model_info: modelInfo ? modelInfo.data : null
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  semanticSearch,
  getRecommendations,
  shoppingAssistant,
  getForecast,
  getSegments,
  getAIStatus
};
