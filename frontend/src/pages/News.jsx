import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import NewsForm from '../components/NewsForm';
import NewsList from '../components/NewsList';
import { useAuth } from '../context/AuthContext';
import WeatherWidget from '../components/WeatherWidget';

// Pagination Component
const Pagination = ({ pagination, onPageChange, loading }) => {
  const { currentPage, totalPages, totalItems, hasNextPage, hasPrevPage } = pagination;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);

      if (currentPage <= 3) {
        start = 1;
        end = 5;
      }
      
      if (currentPage >= totalPages - 2) {
        start = totalPages - 4;
        end = totalPages;
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mt-8 p-4 bg-white rounded-lg shadow">
      {/* Pagination Info */}
      <div className="text-sm text-gray-600 mb-4 sm:mb-0">
        Showing {Math.min((currentPage - 1) * 10 + 1, totalItems)} - {Math.min(currentPage * 10, totalItems)} of {totalItems} results
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center space-x-2">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevPage || loading}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            !hasPrevPage || loading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          ← Previous
        </button>

        {/* Page Numbers */}
        <div className="flex space-x-1">
          {getPageNumbers().map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              disabled={loading}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pageNum === currentPage
                  ? 'bg-blue-600 text-white'
                  : loading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {pageNum}
            </button>
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage || loading}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            !hasNextPage || loading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

const News = () => {
  const { user } = useAuth();
  const [newsItems, setNewsItems] = useState([]);
  const [editingNews, setEditingNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  
  // Filter state
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    limit: 10
  });

  const isAdmin = user?.role === 'admin';

  // Fetch news data
  const fetchNews = async (page = 1, newFilters = filters) => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: newFilters.limit.toString()
      });
      
      if (newFilters.category) params.append('category', newFilters.category);
      if (newFilters.status) params.append('status', newFilters.status);
      
      const newsResponse = await axiosInstance.get(`/api/news?${params}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      
      // Handle response data
      if (newsResponse.data.news && newsResponse.data.pagination) {
        // Response with pagination info
        setNewsItems(newsResponse.data.news);
        setPagination(newsResponse.data.pagination);
      } else if (Array.isArray(newsResponse.data)) {
        // Direct array response (backwards compatibility)
        setNewsItems(newsResponse.data);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: newsResponse.data.length,
          hasNextPage: false,
          hasPrevPage: false
        });
      } else {
        setNewsItems([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          hasNextPage: false,
          hasPrevPage: false
        });
      }

    } catch (error) {
      console.error('Failed to fetch news:', error);
      setError(error.message || 'Failed to load news articles. Please try again.');
      setNewsItems([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        hasNextPage: false,
        hasPrevPage: false
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics data
  const fetchStats = async () => {
    if (!user || !isAdmin) return;
    
    try {
      const statsResponse = await axiosInstance.get('/api/news/stats', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setStats(statsResponse.data);
    } catch (error) {
      console.log('Stats not available:', error);
    }
  };

  // Initial load
  useEffect(() => {
    fetchNews(1, filters);
    fetchStats();
  }, [user]);

  // Handle page changes
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages && !loading) {
      fetchNews(newPage, filters);
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchNews(1, newFilters); // Reset to first page when filtering
  };

  // Refresh news list after updates
  const refreshNewsList = () => {
    fetchNews(pagination.currentPage, filters);
  };

  // Custom setNewsItems, called after adding/updating/deleting news
  const handleNewsUpdate = (updatedNews) => {
    setNewsItems(updatedNews);
    // Optional: refresh statistics
    if (isAdmin) {
      fetchStats();
    }
  };

  // Show loading state
  if (loading && newsItems.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-4 text-gray-600">Loading news articles...</span>
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
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Articles</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchNews(1, filters)}
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
        {/* <div className="md:col-span-1">
          <WeatherWidget />
        </div> */}
        <h1 className="text-4xl font-bold text-gray-800 mb-2">News Articles</h1>
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            {isAdmin 
              ? "Create, manage, and organize your news articles." 
              : "Browse and read the latest news articles."
            }
            {pagination.totalItems > 0 && ` ${pagination.totalItems} article${pagination.totalItems !== 1 ? 's' : ''} total.`}
          </p>
          
          {/* User Role Badge */}
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              isAdmin 
                ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                : 'bg-blue-100 text-blue-800 border border-blue-200'
            }`}>
              {isAdmin ? '👑 Administrator' : '👤 Reader'}
            </span>
          </div>
        </div>
      </div>

      {/* Admin Info Banner - Only show for non-admin users if no articles exist */}
      {!isAdmin && newsItems.length === 0 && !loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-lg font-medium text-blue-800">Welcome to News Management System</h3>
              <p className="text-blue-700">News articles will appear here once administrators publish them.</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Dashboard */}
      {stats && isAdmin && pagination.totalItems > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="bg-blue-500 rounded-lg p-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-600">Total Articles</p>
                <p className="text-2xl font-bold text-blue-900">{pagination.totalItems}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="bg-green-500 rounded-lg p-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-600">Published</p>
                <p className="text-2xl font-bold text-green-900">
                  {newsItems.filter(n => n.status === 'published').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="bg-yellow-500 rounded-lg p-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-yellow-600">Draft</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {newsItems.filter(n => n.status === 'draft').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="bg-purple-500 rounded-lg p-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-600">Total Views</p>
                <p className="text-2xl font-bold text-purple-900">
                  {newsItems.reduce((sum, n) => sum + (n.viewCount || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Items Per Page Control */}
      {pagination.totalItems > 0 && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Items per page:</label>
                <select
                  value={filters.limit}
                  onChange={(e) => handleFilterChange({ ...filters, limit: parseInt(e.target.value) })}
                  className="border border-gray-300 rounded px-3 py-1 text-sm"
                  disabled={loading}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>
          </div>
        </div>
      )}

      {/* News Form - Only shows for admin users */}
      <NewsForm
        newsItems={newsItems}
        setNewsItems={handleNewsUpdate}
        editingNews={editingNews}
        setEditingNews={setEditingNews}
      />

      {/* Loading indicator for page changes */}
      {loading && newsItems.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading...</span>
          </div>
        </div>
      )}

      {/* News List - Shows for all users */}
      <NewsList 
        newsItems={newsItems} 
        setNewsItems={handleNewsUpdate} 
        setEditingNews={setEditingNews} 
      />

      {/* Pagination */}
      <Pagination 
        pagination={pagination}
        onPageChange={handlePageChange}
        loading={loading}
      />
    </div>
  );
};

export default News;