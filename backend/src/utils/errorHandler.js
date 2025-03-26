// Global error handler
module.exports = (err, req, res, next) => {
    console.error('Error:', err);
    
    // Handle specific error types
    if (err.response && err.response.status === 401) {
      return res.status(500).json({ error: 'Spotify API authentication failed' });
    }
    
    if (err.response && err.response.status === 429) {
      return res.status(429).json({ error: 'Rate limit exceeded, please try again later' });
    }
    
    // Default error response
    res.status(500).json({
      error: 'Something went wrong',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  };