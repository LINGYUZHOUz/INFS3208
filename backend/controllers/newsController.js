const News = require('../models/New');
const Category = require('../models/Category');
const mongoose = require('mongoose');

const getNews = async (req, res) => {
    debugger
    try {
        const { category, status, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;
        
        let filter = {};
         if (req.user.role !== 'admin') {
            filter.status = 'published';
        }
        if (category) filter.category = category;
        if (status) filter.status = status;
        debugger
        const news = await News.find(filter)
            .populate('category', 'name color')
            .populate('userId', 'name email')
            .sort({ publishDate: -1, createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        const totalCount = await News.countDocuments(filter);
        
        res.json({
            news,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / limit),
                totalItems: totalCount,
                hasNextPage: page < Math.ceil(totalCount / limit),
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error('Get news error:', error);
        res.status(500).json({ message: 'Failed to fetch news', error: error.message });
    }
};

const addNews = async (req, res) => {
    const { headline, content, publishDate, category, status, tags, imageBase64  } = req.body;
    
    try {
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return res.status(400).json({ message: 'Invalid category selected' });
        }

        const processedTags = tags ? [...new Set(tags.filter(tag => tag.trim() !== ''))] : [];

        const news = await News.create({ 
            userId: req.user.id, 
            headline: headline.trim(),
            content: content.trim(),
            publishDate,
            category,
            status: status || 'draft',
            tags: processedTags,
            imageBase64 : imageBase64 || ''
        });
        
        await news.populate([
            { path: 'category', select: 'name color' },
            { path: 'userId', select: 'name email' }
        ]);
        
        res.status(201).json(news);
    } catch (error) {
        console.error('Add news error:', error);
        res.status(500).json({ message: 'Failed to create news', error: error.message });
    }
};

const updateNews = async (req, res) => {
    const { headline, content, publishDate, category, status, tags, imageBase64  } = req.body;
    
    try {
        const news = await News.findById(req.params.id);
        
        if (!news) {
            return res.status(404).json({ message: 'News not found' });
        }
        
        if (news.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Access denied. You can only edit your own news.' });
        }

        if (category) {
            const categoryExists = await Category.findById(category);
            if (!categoryExists) {
                return res.status(400).json({ message: 'Invalid category selected' });
            }
        }

        const processedTags = tags ? [...new Set(tags.filter(tag => tag.trim() !== ''))] : news.tags;

        news.headline = headline?.trim() || news.headline;
        news.content = content?.trim() || news.content;
        news.publishDate = publishDate || news.publishDate;
        news.category = category || news.category;
        news.status = status || news.status;
        news.tags = processedTags;
        news.imageBase64 = imageBase64 || '';
        
        const updatedNews = await news.save();
        
        await updatedNews.populate([
            { path: 'category', select: 'name color' },
            { path: 'userId', select: 'name email' }
        ]);
        
        res.json(updatedNews);
    } catch (error) {
        console.error('Update news error:', error);
        res.status(500).json({ message: 'Failed to update news', error: error.message });
    }
};

const deleteNews = async (req, res) => {
    try {
        const news = await News.findById(req.params.id);
        
        if (!news) {
            return res.status(404).json({ message: 'News not found' });
        }
        
        if (news.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Access denied. You can only delete your own news.' });
        }

        await News.findByIdAndDelete(req.params.id);
        res.json({ message: 'News deleted successfully' });
    } catch (error) {
        console.error('Delete news error:', error);
        res.status(500).json({ message: 'Failed to delete news', error: error.message });
    }
};

const getNewsById = async (req, res) => {
    try {
        const news = await News.findById(req.params.id)
            .populate('category', 'name color description')
            .populate('userId', 'name email');
            
        if (!news) {
            return res.status(404).json({ message: 'News not found' });
        }
        
        news.viewCount += 1;
        await news.save();
        
        res.json(news);
    } catch (error) {
        console.error('Get news by ID error:', error);
        res.status(500).json({ message: 'Failed to fetch news', error: error.message });
    }
};

const getNewsStats = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const stats = await News.aggregate([
            { $match: { userId: mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalViews: { $sum: '$viewCount' }
                }
            }
        ]);
        
        const categoryStats = await News.aggregate([
            { $match: { userId: mongoose.Types.ObjectId(userId) } },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'categoryInfo'
                }
            },
            { $unwind: '$categoryInfo' },
            {
                $group: {
                    _id: '$category',
                    categoryName: { $first: '$categoryInfo.name' },
                    count: { $sum: 1 }
                }
            }
        ]);
        
        res.json({
            statusStats: stats,
            categoryStats: categoryStats
        });
    } catch (error) {
        console.error('Get news stats error:', error);
        res.status(500).json({ message: 'Failed to fetch news statistics', error: error.message });
    }
};

module.exports = { 
    getNews, 
    addNews, 
    updateNews, 
    deleteNews,
    getNewsById,
    getNewsStats
};