import React from 'react';
import { 
  Users, Calendar, AlertTriangle, Bed, TrendingUp, Clock, 
  Activity, FileText, MapPin, UserCheck, Bell, Brain,
  Heart, Baby, Stethoscope, BarChart3
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const Dashboard: React.FC = () => {
  const { patients, visits, beds, notifications, userRole, t } = useApp();

  // Calculate statistics based on role
  const getStatistics = () => {
    const totalPatients = patients.length;
    const childPatients = patients.filter(p => p.type === 'child').length;
    const pregnantPatients = patients.filter(p => p.type === 'pregnant').length;
    const severelyMalnourished = patients.filter(p => p.nutritionStatus === 'severely_malnourished').length;
    const unreadNotifications = notifications.filter(n => !n.read).length;
    const todaysVisits = visits.filter(v => v.scheduledDate === new Date().toISOString().split('T')[0]).length;
    const availableBeds = beds.filter(b => b.status === 'available').length;
    const occupiedBeds = beds.filter(b => b.status === 'occupied').length;

    return {
      totalPatients,
      childPatients,
      pregnantPatients,
      severelyMalnourished,
      unreadNotifications,
      todaysVisits,
      availableBeds,
      occupiedBeds
    };
  };

  const stats = getStatistics();

  // Role-specific dashboard content
  const getRoleDashboard = () => {
    if (userRole === 'anganwadi_worker') {
      return {
        title: 'Anganwadi Worker Dashboard',
        subtitle: 'Patient detection, registration, and field monitoring',
        primaryStats: [
          { label: 'Patients Registered', value: stats.totalPatients, icon: Users, color: 'bg-blue-500' },
          { label: 'SAM Children', value: stats.severelyMalnourished, icon: AlertTriangle, color: 'bg-red-500' },
          { label: "Today's Visits", value: stats.todaysVisits, icon: Calendar, color: 'bg-green-500' },
          { label: 'Notifications', value: stats.unreadNotifications, icon: Bell, color: 'bg-purple-500' }
        ],
        features: [
          { name: 'Patient Registration', description: 'Register SAM children & pregnant women with Aadhaar', icon: Users },
          { name: 'Medical Records', description: 'Update vitals and nutrition parameters', icon: FileText },
          { name: 'Visit Scheduling', description: 'Self-assign household visits', icon: Calendar },
          { name: 'Bed Requests', description: 'Check availability and raise requests', icon: Bed },
          { name: 'AI Predictions', description: 'View risk scores and deficiency patterns', icon: Brain },
          { name: 'Post-Hospital Tracking', description: 'Continue tracking discharged patients', icon: Activity }
        ]
      };
    }

    if (userRole === 'supervisor') {
      return {
        title: 'Department Supervisor Dashboard',
        subtitle: 'Block/District level oversight and management',
        primaryStats: [
          { label: 'Total Patients', value: stats.totalPatients, icon: Users, color: 'bg-blue-500' },
          { label: 'Centers Managed', value: 2, icon: MapPin, color: 'bg-green-500' },
          { label: 'Active Workers', value: 2, icon: UserCheck, color: 'bg-purple-500' },
          { label: 'Pending Tickets', value: 5, icon: AlertTriangle, color: 'bg-orange-500' }
        ],
        features: [
          { name: 'Dashboard Analytics', description: 'Patient trends, visit completions, worker performance', icon: BarChart3 },
          { name: 'Center Management', description: 'Add/manage Anganwadi centers and areas', icon: MapPin },
          { name: 'Worker Management', description: 'View profiles, assign visits, track performance', icon: UserCheck },
          { name: 'Visit Ticketing', description: 'Auto-generated tickets for missed visits', icon: FileText },
          { name: 'Survey Management', description: 'Review area-level malnutrition data', icon: Activity },
          { name: 'Bed Coordination', description: 'Monitor allocation and validate requests', icon: Bed }
        ]
      };
    }

    if (userRole === 'hospital') {
      return {
        title: 'Government Hospital Dashboard',
        subtitle: 'NRC-equipped hospital treatment and bed management',
        primaryStats: [
          { label: 'Available Beds', value: stats.availableBeds, icon: Bed, color: 'bg-green-500' },
          { label: 'Occupied Beds', value: stats.occupiedBeds, icon: Bed, color: 'bg-red-500' },
          { label: 'Active Treatments', value: 8, icon: Stethoscope, color: 'bg-blue-500' },
          { label: 'Pending Requests', value: 3, icon: Clock, color: 'bg-orange-500' }
        ],
        features: [
          { name: 'Bed Dashboard', description: 'Real-time bed status and management', icon: Bed },
          { name: 'Treatment Tracker', description: 'Daily progress, medicine schedules, doctor remarks', icon: Stethoscope },
          { name: 'Medical Reports', description: 'Upload lab reports and discharge summaries', icon: FileText },
          { name: 'Notification System', description: 'Bed requests and high-priority alerts', icon: Bell },
          { name: 'AI Bed Prediction', description: 'Future demand using AI predictions', icon: Brain },
          { name: 'Discharge Management', description: 'Track recovery and follow-up requirements', icon: Activity }
        ]
      };
    }

    return { title: 'Dashboard', subtitle: '', primaryStats: [], features: [] };
  };

  const dashboardData = getRoleDashboard();

  const recentActivities = [
    { id: 1, type: 'registration', message: 'New SAM child registered: Aarav Kumar', time: '2 hours ago', icon: Users },
    { id: 2, type: 'bed_request', message: 'Bed request approved for Priya Devi', time: '4 hours ago', icon: Bed },
    { id: 3, type: 'visit', message: 'Household visit completed in Sadar Bazaar', time: '6 hours ago', icon: Calendar },
    { id: 4, type: 'alert', message: 'High risk patient alert generated', time: '8 hours ago', icon: AlertTriangle },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{dashboardData.title}</h2>
            <p className="text-gray-600">{dashboardData.subtitle}</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardData.primaryStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Features */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-600" />
            Available Features
          </h3>
          <div className="space-y-4">
            {dashboardData.features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{feature.name}</h4>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-green-600" />
            Recent Activities
          </h3>
          <div className="space-y-4">
            {recentActivities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Icon className="w-4 h-4 text-gray-500" />
                      <p className="text-sm text-gray-900">{activity.message}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Stats for Role */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
          Quick Overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Baby className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-800">{stats.childPatients}</p>
            <p className="text-sm text-blue-600">Children</p>
          </div>
          <div className="text-center p-4 bg-pink-50 rounded-lg">
            <Heart className="w-8 h-8 text-pink-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-pink-800">{stats.pregnantPatients}</p>
            <p className="text-sm text-pink-600">Pregnant Women</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-800">{stats.severelyMalnourished}</p>
            <p className="text-sm text-red-600">SAM Cases</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Bed className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-800">{stats.availableBeds}</p>
            <p className="text-sm text-green-600">Available Beds</p>
          </div>
        </div>
      </div>

      {/* Bilingual Notice */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-900">Bilingual System • द्विभाषी प्रणाली</h3>
            <p className="text-sm text-blue-700 mt-1">
              This system supports both English and Hindi languages for better accessibility.
              <br />
              यह प्रणाली बेहतर पहुंच के लिए अंग्रेजी और हिंदी दोनों भाषाओं का समर्थन करती है।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;