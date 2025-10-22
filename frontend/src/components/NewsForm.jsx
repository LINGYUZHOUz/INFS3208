import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const NewsForm = ({ newsItems, setNewsItems, editingNews, setEditingNews }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ 
    headline: '', 
    content: '', 
    publishDate: '',
    category: '',
    status: 'draft',
    tags: [],
    imageBase64: '' // Add image field
  });
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get('/api/categories', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setCategories(response.data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    if (user) fetchCategories();
  }, [user]);

  useEffect(() => {
    if (editingNews) {
      setFormData({
        headline: editingNews.headline,
        content: editingNews.content,
        publishDate: editingNews.publishDate ? editingNews.publishDate.split('T')[0] : '',
        category: editingNews.category?._id || '',
        status: editingNews.status || 'draft',
        tags: editingNews.tags || [],
        imageBase64: editingNews.imageBase64 || '' // Handle existing image
      });
    } else {
      setFormData({ 
        headline: '', 
        content: '', 
        publishDate: '',
        category: '',
        status: 'draft',
        tags: [],
        imageBase64: '' // Reset image field
      });
    }
    setErrors({});
  }, [editingNews]);

  // Handle image file upload and convert to base64
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({ ...formData, imageBase64: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.headline.trim()) {
      newErrors.headline = 'Headline is required';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    if (!formData.publishDate) {
      newErrors.publishDate = 'Publish date is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
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
      if (editingNews) {
        const response = await axiosInstance.put(`/api/news/${editingNews._id}`, formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setNewsItems(newsItems.map((news) => (news._id === response.data._id ? response.data : news)));
        alert('News updated successfully!');
      } else {
        const response = await axiosInstance.post('/api/news', formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setNewsItems([response.data, ...newsItems]);
        alert('News created successfully!');
      }
      
      setEditingNews(null);
      setFormData({ 
        headline: '', 
        content: '', 
        publishDate: '',
        category: '',
        status: 'draft',
        tags: [],
        imageBase64: '' // Reset image field
      });
      setErrors({});
    } catch (error) {
      console.error('News operation failed:', error);
      
      if (error.response?.status === 403) {
        alert('Access denied. Only administrators can create/edit news articles.');
      } else {
        alert(error.message || 'Failed to save news. Please try again.');
      }
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

  const handleTagsChange = (e) => {
    const tagsArray = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData({ ...formData, tags: tagsArray });
  };

  const handleCancel = () => {
    setEditingNews(null);
    setFormData({ 
      headline: '', 
      content: '', 
      publishDate: '',
      category: '',
      status: 'draft',
      tags: [],
      imageBase64: '' // Reset image field
    });
    setErrors({});
  };

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  // Don't render the form if user is not admin
  if (!isAdmin) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded-lg mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {editingNews ? 'Edit News Article' : 'Create News Article'}
        </h2>
        {editingNews && (
          <button
            type="button"
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Cancel
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label htmlFor="headline" className="block text-sm font-medium text-gray-700 mb-2">
            Headline *
          </label>
          <input
            type="text"
            id="headline"
            name="headline"
            placeholder="Enter news headline"
            value={formData.headline}
            onChange={handleInputChange}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.headline ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          />
          {errors.headline && <p className="text-red-500 text-sm mt-1">{errors.headline}</p>}
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.category ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
        </div>

        <div>
          <label htmlFor="publishDate" className="block text-sm font-medium text-gray-700 mb-2">
            Publish Date *
          </label>
          <input
            type="date"
            id="publishDate"
            name="publishDate"
            value={formData.publishDate}
            onChange={handleInputChange}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.publishDate ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          />
          {errors.publishDate && <p className="text-red-500 text-sm mt-1">{errors.publishDate}</p>}
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isSubmitting}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
            Tags (Optional)
          </label>
          <input
            type="text"
            id="tags"
            placeholder="Enter tags separated by commas"
            value={formData.tags.join(', ')}
            onChange={handleTagsChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isSubmitting}
          />
          <p className="text-gray-500 text-sm mt-1">Separate tags with commas</p>
        </div>

        {/* Image Upload Field */}
        <div className="md:col-span-2">
          <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
            Article Image (Optional)
          </label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isSubmitting}
          />
          <p className="text-gray-500 text-sm mt-1">Supported formats: JPG, PNG, GIF. Max size: 5MB</p>
          
          {/* Image Preview - Simple text indicator */}
          {formData.imageBase64 && (
            <div className="mt-2 text-sm text-green-600">
              ✓ Image uploaded successfully
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Content *
          </label>
          <textarea
            id="content"
            name="content"
            placeholder="Enter news content"
            value={formData.content}
            onChange={handleInputChange}
            rows="6"
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.content ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          />
          {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full mt-6 py-3 px-4 rounded-lg font-medium transition-colors ${
          isSubmitting
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        } text-white`}
      >
        {isSubmitting 
          ? (editingNews ? 'Updating...' : 'Creating...') 
          : (editingNews ? 'Update News' : 'Create News')
        }
      </button>
    </form>
  );
};

export default NewsForm;