import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link 
            to="/" 
            className="text-2xl font-bold hover:text-blue-200 transition-colors"
          >
            📰 News Management System
          </Link>

          <div className="flex items-center space-x-6">
            {user ? (
              <>
                <div className="hidden md:flex items-center space-x-4">
                  <Link 
                    to="/news" 
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/news') 
                        ? 'bg-blue-700 text-white' 
                        : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                    }`}
                  >
                    📝 Articles
                  </Link>
                   {user.role === 'admin' && (
                  <Link 
                    to="/categories" 
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/categories') 
                        ? 'bg-blue-700 text-white' 
                        : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                    }`}
                  >
                    🏷️ Categories
                  </Link>
                  )}
                  <Link 
                    to="/profile" 
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/profile') 
                        ? 'bg-blue-700 text-white' 
                        : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                    }`}
                  >
                    👤 Profile
                  </Link>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="hidden sm:block">
                    <span className="text-blue-100 text-sm">
                      Welcome, <span className="font-medium">{user.name}</span>
                    </span>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md text-sm font-medium transition-colors focus:ring-2 focus:ring-red-300 focus:ring-offset-2 focus:ring-offset-blue-600"
                  >
                    🚪 Logout
                  </button>
                </div>

                <div className="md:hidden">
                  <button className="text-blue-100 hover:text-white">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-4">
                  <Link 
                    to="/login" 
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/login') 
                        ? 'bg-blue-700 text-white' 
                        : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                    }`}
                  >
                    🔐 Login
                  </Link>
                  <Link
                    to="/register"
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/register') 
                        ? 'bg-green-600 text-white' 
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    ✨ Register
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {user && (
          <div className="md:hidden border-t border-blue-700 pt-4 pb-2">
            <div className="flex flex-col space-y-2">
              <Link 
                to="/news" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/news') 
                    ? 'bg-blue-700 text-white' 
                    : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                }`}
              >
                📝 Articles
              </Link>
              <Link 
                to="/categories" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/categories') 
                    ? 'bg-blue-700 text-white' 
                    : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                }`}
              >
                🏷️ Categories
              </Link>
              <Link 
                to="/profile" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/profile') 
                    ? 'bg-blue-700 text-white' 
                    : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                }`}
              >
                👤 Profile
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;