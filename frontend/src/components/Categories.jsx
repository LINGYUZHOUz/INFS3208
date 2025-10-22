import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import CategoryForm from '../components/CategoryForm';
import CategoryList from '../components/CategoryList';
import { useAuth } from '../context/AuthContext';

const Categories = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await axiosInstance.get('/api/categories', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        
        setCategories(response.data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setError(error.message || 'Failed to load categories. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [user]);

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-4 text-gray-600">Loading categories...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Categories</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Category Management</h1>
        <p className="text-gray-600">
          Organize your news articles by creating and managing categories. 
          Categories help readers find relevant content quickly.
        </p>
      </div>

      {/* Category Form */}
      <CategoryForm
        categories={categories}
        setCategories={setCategories}
        editingCategory={editingCategory}
        setEditingCategory={setEditingCategory}
      />

      {/* Category List */}
      <CategoryList 
        categories={categories} 
        setCategories={setCategories} 
        setEditingCategory={setEditingCategory} 
      />
    </div>
  );
};

export default Categories;