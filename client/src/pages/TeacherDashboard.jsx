import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { evaluationService } from '../services/evaluationService';
import Sidebar from '../components/Sidebar';
import ChartCard from '../components/ChartCard';
import { Users, FileText, TrendingUp, Award, Clock } from 'lucide-react';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalEvaluations: 0,
    averageScore: 0,
    pendingEvaluations: 0
  });
  const [recentEvaluations, setRecentEvaluations] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [studentsData, analyticsData] = await Promise.all([
        evaluationService.getTeacherStudents(user.id),
        evaluationService.getTeacherAnalytics(user.id)
      ]);

      setStats({
        totalStudents: studentsData?.length || 0,
        totalEvaluations: analyticsData?.totalEvaluations || 0,
        averageScore: analyticsData?.averageScore || 0,
        pendingEvaluations: analyticsData?.pendingEvaluations || 0
      });

      setRecentEvaluations(analyticsData?.recentEvaluations || []);
      setPerformanceData(analyticsData?.performanceTrend || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Evaluations Completed',
      value: stats.totalEvaluations,
      icon: FileText,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      title: 'Average Score',
      value: `${stats.averageScore.toFixed(1)}%`,
      icon: Award,
      color: 'bg-purple-500',
      change: '+2.3%'
    },
    {
      title: 'Pending Evaluations',
      value: stats.pendingEvaluations,
      icon: Clock,
      color: 'bg-orange-500',
      change: '-3'
    }
  ];

  if (loading) {
    return (
      <div className="flex">
        <Sidebar role="teacher" />
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
      <Sidebar role="teacher" />
      
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Teacher Dashboard</h1>
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
            title="Performance Trend"
            type="line"
            data={performanceData}
            dataKey="score"
            xAxisKey="date"
          />

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Evaluations</h3>
            <div className="space-y-3">
              {recentEvaluations.length > 0 ? (
                recentEvaluations.map((evaluation, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">{evaluation.studentName}</p>
                      <p className="text-sm text-gray-600">{evaluation.subject}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-indigo-600">{evaluation.score}%</p>
                      <p className="text-xs text-gray-500">{evaluation.date}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No recent evaluations</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
