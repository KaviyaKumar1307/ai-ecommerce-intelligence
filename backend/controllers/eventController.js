const { UserEvent } = require('../models');

const trackEvent = async (req, res, next) => {
  try {
    const { event_type, product_id, metadata } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!event_type) {
      return res.status(400).json({
        success: false,
        message: 'event_type is required.'
      });
    }

    const event = await UserEvent.create({
      user_id: userId,
      product_id: product_id || null,
      event_type,
      metadata: metadata || null,
      timestamp: new Date()
    });

    return res.status(201).json({
      success: true,
      message: 'Event tracked successfully.',
      data: { event }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  trackEvent
};
