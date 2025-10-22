const Category = require('../models/Category');

const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true })
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });
        res.json(categories);
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ message: 'Failed to fetch categories', error: error.message });
    }
};

const addCategory = async (req, res) => {
    const { name, description, color } = req.body;
    
    try {
        const existingCategory = await Category.findOne({ name: name.trim() });
        if (existingCategory) {
            return res.status(400).json({ message: 'Category with this name already exists' });
        }

        const category = await Category.create({ 
            name: name.trim(),
            description: description?.trim(),
            color: color || '#3B82F6',
            createdBy: req.user.id 
        });
        
        await category.populate('createdBy', 'name email');
        
        res.status(201).json(category);
    } catch (error) {
        console.error('Add category error:', error);
        res.status(500).json({ message: 'Failed to create category', error: error.message });
    }
};

const updateCategory = async (req, res) => {
    const { name, description, color, isActive } = req.body;
    
    try {
        const category = await Category.findById(req.params.id);
        
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        if (name && name.trim() !== category.name) {
            const existingCategory = await Category.findOne({ 
                name: name.trim(), 
                _id: { $ne: req.params.id } 
            });
            if (existingCategory) {
                return res.status(400).json({ message: 'Category with this name already exists' });
            }
        }

        category.name = name?.trim() || category.name;
        category.description = description?.trim() || category.description;
        category.color = color || category.color;
        if (isActive !== undefined) category.isActive = isActive;
        
        const updatedCategory = await category.save();
        await updatedCategory.populate('createdBy', 'name email');
        
        res.json(updatedCategory);
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ message: 'Failed to update category', error: error.message });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        category.isActive = false;
        await category.save();
        
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ message: 'Failed to delete category', error: error.message });
    }
};

const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id)
            .populate('createdBy', 'name email');
            
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        
        res.json(category);
    } catch (error) {
        console.error('Get category by ID error:', error);
        res.status(500).json({ message: 'Failed to fetch category', error: error.message });
    }
};

module.exports = { 
    getCategories, 
    addCategory, 
    updateCategory, 
    deleteCategory,
    getCategoryById
};