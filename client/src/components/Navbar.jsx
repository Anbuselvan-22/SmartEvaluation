import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, BookOpen, BarChart3 } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const getDashboardLink = () => {
    return user?.role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard';
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-indigo-600 mr-3" />
            <a 
              href={getDashboardLink()}
              className="text-xl font-bold text-gray-800 hover:text-indigo-600 transition-colors"
            >
              Smart Evaluation
            </a>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-600" />
              <span className="text-gray-700 font-medium">
                {user?.name}
              </span>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {user?.role}
              </span>
            </div>
            
            {user?.role === 'teacher' && (
              <a
                href="/evaluation"
                className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600 transition-colors"
              >
                <BarChart3 className="h-5 w-5" />
                <span>Evaluate</span>
              </a>
            )}
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
