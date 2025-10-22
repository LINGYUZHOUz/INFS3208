const express = require('express');
const { getNews, addNews, updateNews, deleteNews, getNewsById, getNewsStats } = require('../controllers/newsController');
const { requireAdmin } = require('../middleware/roleMiddleware');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/news/stats - Get news statistics
router.get('/stats', getNewsStats);

// GET /api/news/:id - Get specific news by ID  
router.get('/:id', getNewsById);

// GET /api/news - Get all news (accessible to all authenticated users)
router.get('/', getNews);

// POST /api/news - Create news (admin only)
router.post('/', requireAdmin, addNews);

// PUT /api/news/:id - Update news (admin only)  
router.put('/:id', requireAdmin, updateNews);

// DELETE /api/news/:id - Delete news (admin only)
router.delete('/:id', requireAdmin, deleteNews);

module.exports = router;