const express = require('express');
const { 
    getCategories, 
    addCategory, 
    updateCategory, 
    deleteCategory,
    getCategoryById 
} = require('../controllers/categoryController');

const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(protect);

router.route('/')
    .get(getCategories)
    .post(addCategory);

router.route('/:id')
    .get(getCategoryById)
    .put(updateCategory)
    .delete(deleteCategory);

module.exports = router;