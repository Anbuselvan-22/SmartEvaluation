import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  BookOpen,
  TrendingUp,
  Award
} from 'lucide-react';

const Sidebar = ({ role }) => {
  const teacherMenuItems = [
    { path: '/teacher-dashboard', icon: Home, label: 'Dashboard' },
    { path: '/evaluation', icon: FileText, label: 'Evaluate Papers' },
    { path: '/teacher-students', icon: Users, label: 'Students' },
    { path: '/teacher-analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/teacher-settings', icon: Settings, label: 'Settings' },
  ];

  const studentMenuItems = [
    { path: '/student-dashboard', icon: Home, label: 'Dashboard' },
    { path: '/student-marks', icon: Award, label: 'My Marks' },
    { path: '/student-performance', icon: TrendingUp, label: 'Performance' },
    { path: '/student-feedback', icon: BookOpen, label: 'Feedback' },
    { path: '/student-settings', icon: Settings, label: 'Settings' },
  ];

  const menuItems = role === 'teacher' ? teacherMenuItems : studentMenuItems;

  return (
    <div className="w-64 bg-white shadow-lg h-screen sticky top-0">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <BookOpen className="h-8 w-8 text-indigo-600" />
          <h2 className="text-xl font-bold text-gray-800">Smart Eval</h2>
        </div>
        
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          <p>Logged in as {role}</p>
          <p className="text-xs mt-1">© 2024 Smart Evaluation</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
