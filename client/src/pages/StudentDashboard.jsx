import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { evaluationService } from '../services/evaluationService';
import Sidebar from '../components/Sidebar';
import ChartCard from '../components/ChartCard';
import { Award, TrendingUp, BookOpen, Target } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    averageScore: 0,
    totalEvaluations: 0,
    improvementRate: 0,
    rank: 0
  });
  const [recentMarks, setRecentMarks] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [marksData, performanceData] = await Promise.all([
        evaluationService.getStudentMarks(user.id),
        evaluationService.getStudentPerformance(user.id)
      ]);

      setStats({
        averageScore: performanceData?.averageScore || 0,
        totalEvaluations: marksData?.length || 0,
        improvementRate: performanceData?.improvementRate || 0,
        rank: performanceData?.rank || 0
      });

      setRecentMarks(marksData?.slice(0, 5) || []);
      setPerformanceData(performanceData?.history || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Average Score',
      value: `${stats.averageScore.toFixed(1)}%`,
      icon: Award,
      color: 'bg-blue-500',
      change: `+${stats.improvementRate.toFixed(1)}%`
    },
    {
      title: 'Total Evaluations',
      value: stats.totalEvaluations,
      icon: BookOpen,
      color: 'bg-green-500',
      change: '+3'
    },
    {
      title: 'Class Rank',
      value: `#${stats.rank}`,
      icon: Target,
      color: 'bg-purple-500',
      change: '+2'
    },
    {
      title: 'Improvement Rate',
      value: `${stats.improvementRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'bg-orange-500',
      change: '+1.2%'
    }
  ];

  if (loading) {
    return (
      <div className="flex">
        <Sidebar role="student" />
        <div className="flex-1 p-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar role="student" />
      
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Student Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.name}!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-green-600">
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
                <p className="text-gray-600 text-sm mt-1">{stat.title}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartCard
            title="Performance Over Time"
            type="line"
            data={performanceData}
            dataKey="score"
            xAxisKey="date"
          />

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Results</h3>
            <div className="space-y-3">
              {recentMarks.length > 0 ? (
                recentMarks.map((mark, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">{mark.subject}</p>
                      <p className="text-sm text-gray-600">{mark.date}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        mark.marks >= 80 ? 'text-green-600' : 
                        mark.marks >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {mark.marks}%
                      </p>
                      <p className="text-xs text-gray-500">
                        {mark.feedback ? 'View feedback' : 'No feedback'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No evaluations yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
