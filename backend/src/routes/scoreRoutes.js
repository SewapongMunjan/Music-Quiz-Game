const express = require('express');
const router = express.Router();
const scoreController = require('../controllers/scoreController');

// Get top scores
router.get('/api/scores/top', scoreController.getTopScores);

// Save a new score
router.post('/api/scores', scoreController.saveScore);

module.exports = router;