import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpenIcon, 
  AcademicCapIcon, 
  UsersIcon, 
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const { logout } = useAuth();
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalCertificates: 0,
    totalRevenue: 0,
    certificatesThisMonth: 0,
    certificatesThisYear: 0,
    recentCertificates: [],
    courseStats: [],
    monthlyTrends: []
  });
  const [loading, setLoading] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch courses and certificates data
      const [coursesRes, certificatesRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/courses`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/certificates`)
      ]);

      const courses = coursesRes.data.data || [];
      const certificates = certificatesRes.data.data || [];

      // Calculate statistics
      const totalCourses = courses.length;
      const totalCertificates = certificates.length;
      const totalRevenue = courses.reduce((sum, course) => sum + parseFloat(course.fees || 0), 0);
      
      // Calculate monthly and yearly certificates
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      
      const certificatesThisMonth = certificates.filter(cert => {
        const certDate = new Date(cert.issue_date);
        return certDate.getMonth() === thisMonth && certDate.getFullYear() === thisYear;
      }).length;

      const certificatesThisYear = certificates.filter(cert => {
        const certDate = new Date(cert.issue_date);
        return certDate.getFullYear() === thisYear;
      }).length;

      // Get recent certificates (last 5)
      const recentCertificates = certificates
        .sort((a, b) => new Date(b.issue_date) - new Date(a.issue_date))
        .slice(0, 5);

      // Course statistics
      const courseStats = courses.map(course => ({
        name: course.title,
        certificates: certificates.filter(cert => cert.course_name === course.title).length
      }));

      // Monthly trends (last 6 months)
      const monthlyTrends = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = date.toLocaleString('default', { month: 'short' });
        const monthCertificates = certificates.filter(cert => {
          const certDate = new Date(cert.issue_date);
          return certDate.getMonth() === date.getMonth() && certDate.getFullYear() === date.getFullYear();
        }).length;
        
        monthlyTrends.push({ month: monthName, count: monthCertificates });
      }

      setStats({
        totalCourses,
        totalCertificates,
        totalRevenue,
        certificatesThisMonth,
        certificatesThisYear,
        recentCertificates,
        courseStats,
        monthlyTrends
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyticsClick = () => {
    if (!showAnalytics) {
      fetchDashboardData();
    }
    setShowAnalytics(!showAnalytics);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Admin Dashboard
            </h1>
            <p className="text-lg text-gray-600">
              Welcome to the Reachout Academy admin panel
            </p>
          </div>
          <button
            onClick={logout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Link
            to="/admin/courses"
            className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow"
          >
            <div className="text-blue-600 mb-4">
              <BookOpenIcon className="h-12 w-12" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Manage Courses</h3>
            <p className="text-gray-600">Add, edit, and delete courses</p>
          </Link>

          <Link
            to="/admin/certificates"
            className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow"
          >
            <div className="text-blue-600 mb-4">
              <AcademicCapIcon className="h-12 w-12" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Manage Certificates</h3>
            <p className="text-gray-600">Issue and manage certificates</p>
          </Link>

          <button
            onClick={handleAnalyticsClick}
            className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow text-left"
          >
            <div className="text-blue-600 mb-4">
              <ChartBarIcon className="h-12 w-12" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics</h3>
            <p className="text-gray-600">View course and certificate statistics</p>
          </button>
        </div>

        {/* Analytics Section */}
        {showAnalytics && (
          <div className="mt-12">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h2>
              <button
                onClick={() => setShowAnalytics(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading analytics...</p>
              </div>
            ) : (
              <>
                {/* Quick Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <BookOpenIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Courses</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <AcademicCapIcon className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Certificates</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalCertificates}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <ArrowTrendingUpIcon className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">This Month</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.certificatesThisMonth}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts and Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  {/* Monthly Trends Chart */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Certificate Trends</h3>
                    <div className="space-y-3">
                      {stats.monthlyTrends.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{item.month}</span>
                          <div className="flex items-center">
                            <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${Math.max((item.count / Math.max(...stats.monthlyTrends.map(t => t.count), 1)) * 100, 5)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900 w-8 text-right">{item.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Course Performance */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Performance</h3>
                    <div className="space-y-3">
                      {stats.courseStats.map((course, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 truncate flex-1">{course.name}</span>
                          <div className="flex items-center">
                            <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ width: `${Math.max((course.certificates / Math.max(...stats.courseStats.map(c => c.certificates), 1)) * 100, 5)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900 w-8 text-right">{course.certificates}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Certificates Issued</h3>
                  {stats.recentCertificates.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No certificates issued yet</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Student
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Course
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Issue Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {stats.recentCertificates.map((cert) => (
                            <tr key={cert.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {cert.student_name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {cert.course_name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(cert.issue_date).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  cert.status === 'Valid' 
                                    ? 'bg-green-100 text-green-800' 
                                    : cert.status === 'Expired'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {cert.status === 'Valid' && <CheckCircleIcon className="h-3 w-3 mr-1" />}
                                  {cert.status === 'Expired' && <ExclamationTriangleIcon className="h-3 w-3 mr-1" />}
                                  {cert.status === 'Revoked' && <XCircleIcon className="h-3 w-3 mr-1" />}
                                  {cert.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 