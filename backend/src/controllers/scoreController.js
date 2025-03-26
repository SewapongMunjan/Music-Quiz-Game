// Simple in-memory storage for scores
// In a real app, you would use a database
const scores = [];

// Get top scores
exports.getTopScores = (req, res) => {
  // Sort scores by score value (descending) and get top 10
  const topScores = [...scores]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  
  res.json(topScores);
};

// Save a new score
exports.saveScore = (req, res, next) => {
  try {
    const { playerName, score } = req.body;
    
    // Validate input
    if (!playerName || typeof score !== 'number') {
      return res.status(400).json({ error: 'Invalid input' });
    }
    
    // Create new score entry
    const newScore = {
      id: Date.now().toString(),
      name: playerName,
      score,
      date: new Date()
    };
    
    // Add to scores array
    scores.push(newScore);
    
    // Return the saved score
    res.status(201).json(newScore);
  } catch (error) {
    next(error);
  }
};