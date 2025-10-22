import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const CategoryForm = ({ categories, setCategories, editingCategory, setEditingCategory }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    color: '#3B82F6' 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const colorOptions = [
    { value: '#3B82F6', name: 'Blue' },
    { value: '#10B981', name: 'Green' },
    { value: '#F59E0B', name: 'Yellow' },
    { value: '#EF4444', name: 'Red' },
    { value: '#8B5CF6', name: 'Purple' },
    { value: '#06B6D4', name: 'Cyan' },
    { value: '#F97316', name: 'Orange' },
    { value: '#84CC16', name: 'Lime' }
  ];

  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name,
        description: editingCategory.description || '',
        color: editingCategory.color || '#3B82F6',
      });
    } else {
      setFormData({ name: '', description: '', color: '#3B82F6' });
    }
    setErrors({});
  }, [editingCategory]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Category name must be at least 2 characters';
    }
    
    if (formData.description && formData.description.length > 200) {
      newErrors.description = 'Description must be less than 200 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (editingCategory) {
        const response = await axiosInstance.put(
          `/api/categories/${editingCategory._id}`, 
          formData, 
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        
        setCategories(categories.map((cat) => 
          cat._id === response.data._id ? response.data : cat
        ));
        
        alert('Category updated successfully!');
      } else {
        const response = await axiosInstance.post('/api/categories', formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        
        setCategories([...categories, response.data]);
        alert('Category created successfully!');
      }
      
      setEditingCategory(null);
      setFormData({ name: '', description: '', color: '#3B82F6' });
      setErrors({});
    } catch (error) {
      console.error('Category operation failed:', error);
      alert(error.message || 'Failed to save category. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleCancel = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', color: '#3B82F6' });
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded-lg mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          {editingCategory ? 'Edit Category' : 'Create New Category'}
        </h2>
        {editingCategory && (
          <button
            type="button"
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Cancel
          </button>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Category Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          placeholder="Enter category name"
          value={formData.name}
          onChange={handleInputChange}
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={isSubmitting}
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>

      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description (Optional)
        </label>
        <textarea
          id="description"
          name="description"
          placeholder="Enter category description"
          value={formData.description}
          onChange={handleInputChange}
          rows="3"
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={isSubmitting}
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        <p className="text-gray-500 text-sm mt-1">
          {formData.description.length}/200 characters
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category Color
        </label>
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => setFormData({ ...formData, color: color.value })}
              className={`w-8 h-8 rounded-full border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                formData.color === color.value ? 'border-gray-800' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
              disabled={isSubmitting}
            />
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded border border-gray-300" 
            style={{ backgroundColor: formData.color }}
          />
          <span className="text-sm text-gray-600">{formData.color}</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
          isSubmitting
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        } text-white`}
      >
        {isSubmitting 
          ? (editingCategory ? 'Updating...' : 'Creating...') 
          : (editingCategory ? 'Update Category' : 'Create Category')
        }
      </button>
    </form>
  );
};

export default CategoryForm;