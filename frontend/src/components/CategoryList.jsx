import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const CategoryList = ({ categories, setCategories, setEditingCategory }) => {
  const { user } = useAuth();

  // Handle category deletion
  const handleDelete = async (categoryId, categoryName) => {
    if (!window.confirm(`Are you sure you want to delete the category "${categoryName}"? This action cannot be undone.`)) {
      return;
    } 

    try {
      await axiosInstance.delete(`/api/categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      
      // Remove the category from the list
      setCategories(categories.filter((category) => category._id !== categoryId));
      alert('Category deleted successfully!');
    } catch (error) {
      console.error('Delete category error:', error);
      alert(error.message || 'Failed to delete category. Please try again.');
    }
  };

  // Handle edit category
  const handleEdit = (category) => {
    setEditingCategory(category);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (categories.length === 0) {
    return (
      <div className="bg-white p-8 shadow-md rounded-lg text-center">
        <div className="text-gray-500 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-xl font-medium text-gray-700 mb-2">No Categories Yet</h3>
        <p className="text-gray-500">Create your first category to organize your news articles.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Categories ({categories.length})</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <div 
            key={category._id} 
            className="bg-white p-6 rounded-lg shadow-md border-l-4 hover:shadow-lg transition-shadow"
            style={{ borderLeftColor: category.color }}
          >
            {/* Category Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <h3 className="font-bold text-lg text-gray-800 truncate">
                  {category.name}
                </h3>
              </div>
              <span 
                className="text-xs px-2 py-1 rounded-full text-white"
                style={{ backgroundColor: category.color }}
              >
                Active
              </span>
            </div>

            {/* Category Description */}
            {category.description && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {category.description}
              </p>
            )}

            {/* Category Meta Info */}
            <div className="text-xs text-gray-500 mb-4 space-y-1">
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Created by: {category.createdBy?.name || 'Unknown'}
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m6 4a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h12a2 2 0 012 2v6z" />
                </svg>
                Created: {formatDate(category.createdAt)}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(category)}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white text-sm py-2 px-3 rounded transition-colors focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
              >
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              <button
                onClick={() => handleDelete(category._id, category.name)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm py-2 px-3 rounded transition-colors focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryList;