import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const NewsList = ({ newsItems, setNewsItems, setEditingNews }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const handleDelete = async (newsId, headline) => {
    if (!window.confirm(`Are you sure you want to delete "${headline}"?`)) {
      return;
    }

    try {
      await axiosInstance.delete(`/api/news/${newsId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setNewsItems(newsItems.filter((news) => news._id !== newsId));
      alert('News deleted successfully!');
    } catch (error) {
      console.error('Delete news error:', error);
      alert(error.message || 'Failed to delete news. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (newsItems.length === 0) {
    return (
      <div className="bg-white p-8 shadow-md rounded-lg text-center">
        <div className="text-gray-500 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-medium text-gray-700 mb-2">No News Articles Yet</h3>
        <p className="text-gray-500">
          {isAdmin 
            ? "Create your first news article to get started." 
            : "No news articles have been published yet."
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          News Articles ({newsItems.length})
        </h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {newsItems.map((news) => (
          <div key={news._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border">
            {/* Article Header */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                    {news.headline}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    {/* Category */}
                    {news.category && (
                      <div className="flex items-center gap-1">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: news.category.color }}
                        />
                        <span>{news.category.name}</span>
                      </div>
                    )}
                    
                    {/* Status */}
                    <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(news.status)}`}>
                      {news.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content Preview */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {news.content}
              </p>

              {/* Tags */}
              {news.tags && news.tags.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {news.tags.slice(0, 3).map((tag, index) => (
                      <span 
                        key={index}
                        className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                    {news.tags.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{news.tags.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Article Meta */}
              <div className="text-xs text-gray-500 space-y-1 border-t pt-3">
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Author: {news.userId?.name || 'Unknown'}
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m6 4a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h12a2 2 0 012 2v6z" />
                  </svg>
                  Published: {formatDate(news.publishDate)}
                </div>
                {news.viewCount > 0 && (
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Views: {news.viewCount}
                  </div>
                )}
              </div>

              {/* Action Buttons - Only show for admin */}
              {isAdmin && (
                <div className="flex gap-2 mt-4 pt-3 border-t">
                  <button
                    onClick={() => setEditingNews(news)}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white text-sm py-2 px-3 rounded transition-colors focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                  >
                    <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2.5 2.5 0 113.536 3.536L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(news._id, news.headline)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm py-2 px-3 rounded transition-colors focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsList;