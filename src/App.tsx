import React, { useState } from 'react';
import { Users, Guitar as Hospital, UserCheck, LogOut, Globe, Clock, User, FileText, Calendar, Bed, Brain, Bell, MapPin, Activity, BarChart3, Ticket, Shield, Stethoscope, ClipboardList, TrendingUp } from 'lucide-react';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import Dashboard from './components/Dashboard';
import PatientRegistration from './components/PatientRegistration';
import BedAvailability from './components/BedAvailability';
import Notifications from './components/Notifications';
import PostHospitalizationTracker from './components/PostHospitalizationTracker';
import AnganwadiManagement from './components/AnganwadiManagement';
import WorkerManagement from './components/WorkerManagement';
import AnganwadiVisitTickets from './components/AnganwadiVisitTickets';
import SurveyReports from './components/SurveyReports';
import BedRequests from './components/BedRequests';
import MedicalRecords from './components/MedicalRecords';
import VisitScheduling from './components/VisitScheduling';
import CenterManagement from './components/CenterManagement';
import VisitTicketing from './components/VisitTicketing';
import SurveyManagement from './components/SurveyManagement';
import BedCoordination from './components/BedCoordination';
import AdmissionTracking from './components/AdmissionTracking';
import BedDashboard from './components/BedDashboard';
import TreatmentTracker from './components/TreatmentTracker';
import MedicalReports from './components/MedicalReports';
import BedDemandPrediction from './components/BedDemandPrediction';
import AIHealthPrediction from './components/AIHealthPrediction';
import { AppProvider, useApp } from './context/AppContext';

function AppContent() {
  const { language, setLanguage, currentUser, userRole, setCurrentUser, logout, hasAccess, t } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Show admin panel for admin users
  if (userRole === 'admin') {
    return <AdminPanel />;
  }

  // Show login if no user is logged in
  if (!currentUser || !userRole) {
    return <Login onLogin={(role, userData) => setCurrentUser(userData, role)} />;
  }

  // Define navigation based on role
  const getNavigation = () => {
    const baseNavigation = [
      { id: 'dashboard', name: t('nav.dashboard'), icon: BarChart3 }
    ];

    if (userRole === 'anganwadi_worker') {
      return [
        ...baseNavigation,
        { id: 'patientRegistration', name: t('nav.patientRegistration'), icon: Users },
        { id: 'medicalRecords', name: t('nav.medicalRecords'), icon: FileText },
        { id: 'visitScheduling', name: t('nav.visitScheduling'), icon: Calendar },
        { id: 'bedAvailability', name: t('nav.bedAvailability'), icon: Bed },
        { id: 'notifications', name: t('nav.notifications'), icon: Bell },
        { id: 'aiPrediction', name: t('nav.aiPrediction'), icon: Brain },
        { id: 'postHospitalization', name: t('nav.postHospitalization'), icon: Activity }
      ];
    }

    if (userRole === 'supervisor') {
      return [
        ...baseNavigation,
        { id: 'centerManagement', name: t('nav.centerManagement'), icon: MapPin },
        { id: 'workerManagement', name: t('nav.workerManagement'), icon: UserCheck },
        { id: 'patientRegistration', name: t('nav.patientRegistration'), icon: Users },
        { id: 'medicalRecords', name: t('nav.medicalRecords'), icon: FileText },
        { id: 'visitTicketing', name: t('nav.visitTicketing'), icon: Ticket },
        { id: 'surveyManagement', name: t('nav.surveyManagement'), icon: ClipboardList },
        { id: 'bedCoordination', name: t('nav.bedCoordination'), icon: Bed },
        { id: 'admissionTracking', name: t('nav.admissionTracking'), icon: TrendingUp },
        { id: 'notifications', name: t('nav.notifications'), icon: Bell }
      ];
    }

    if (userRole === 'hospital') {
      return [
        ...baseNavigation,
        { id: 'bedDashboard', name: t('nav.bedDashboard'), icon: Bed },
        { id: 'notifications', name: t('nav.notifications'), icon: Bell },
        { id: 'treatmentTracker', name: t('nav.treatmentTracker'), icon: Stethoscope },
        { id: 'medicalReports', name: t('nav.medicalReports'), icon: FileText },
        { id: 'bedDemandPrediction', name: t('nav.bedDemandPrediction'), icon: Brain },
        { id: 'patientRegistration', name: t('nav.patientRegistration'), icon: Users },
        { id: 'medicalRecords', name: t('nav.medicalRecords'), icon: Activity }
      ];
    }

    return baseNavigation;
  };

  const navigation = getNavigation().filter(item => hasAccess(item.id));

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'anganwadi_worker': return 'Anganwadi Worker';
      case 'supervisor': return 'Department Supervisor';
      case 'hospital': return 'Hospital Staff';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'anganwadi_worker': return 'bg-green-100 text-green-800';
      case 'supervisor': return 'bg-blue-100 text-blue-800';
      case 'hospital': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'anganwadi_worker': return <Users className="w-4 h-4" />;
      case 'supervisor': return <UserCheck className="w-4 h-4" />;
      case 'hospital': return <Hospital className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'patientRegistration':
        return hasAccess('patientRegistration') ? <PatientRegistration /> : <div className="p-8 text-center text-gray-500">Access Denied</div>;
      case 'bedAvailability':
        return hasAccess('bedAvailability') ? <BedAvailability /> : <div className="p-8 text-center text-gray-500">Access Denied</div>;
      case 'notifications':
        return hasAccess('notifications') ? <Notifications /> : <div className="p-8 text-center text-gray-500">Access Denied</div>;
      case 'postHospitalization':
        return hasAccess('postHospitalization') ? <PostHospitalizationTracker /> : <div className="p-8 text-center text-gray-500">Access Denied</div>;
      case 'aiPrediction':
        return hasAccess('aiPrediction') ? <AIHealthPrediction /> : <div className="p-8 text-center text-gray-500">Access Denied</div>;
      case 'medicalRecords':
        return hasAccess('medicalRecords') ? <MedicalRecords /> : <div className="p-8 text-center text-gray-500">Access Denied</div>;
      case 'visitScheduling':
        return hasAccess('visitScheduling') ? <VisitScheduling /> : <div className="p-8 text-center text-gray-500">Access Denied</div>;
      case 'surveys':
        return hasAccess('surveys') ? <SurveyReports /> : <div className="p-8 text-center text-gray-500">Access Denied</div>;
      case 'visitTickets':
        return hasAccess('visitTickets') ? <AnganwadiVisitTickets /> : <div className="p-8 text-center text-gray-500">Access Denied</div>;
      case 'centerManagement':
        return hasAccess('centerManagement') ? <AnganwadiManagement /> : <div className="p-8 text-center text-gray-500">Access Denied</div>;
      case 'workerManagement':
        return hasAccess('workerManagement') ? <WorkerManagement /> : <div className="p-8 text-center text-gray-500">Access Denied</div>;
      case 'visitTicketing':
        return hasAccess('visitTicketing') ? <VisitTicketing /> : <div className="p-8 text-center text-gray-500">Access Denied</div>;
      case 'surveyManagement':
        return hasAccess('surveyManagement') ? <SurveyManagement /> : <div className="p-8 text-center text-gray-500">Access Denied</div>;
      case 'bedCoordination':
        return hasAccess('bedCoordination') ? <BedCoordination /> : <div className="p-8 text-center text-gray-500">Access Denied</div>;
      case 'admissionTracking':
        return hasAccess('admissionTracking') ? <AdmissionTracking /> : <div className="p-8 text-center text-gray-500">Access Denied</div>;
      case 'bedRequests':
        return hasAccess('bedRequests') ? <BedRequests /> : <div className="p-8 text-center text-gray-500">Access Denied</div>;
      case 'bedDashboard':
        return hasAccess('bedDashboard') ? <BedDashboard /> : <div className="p-8 text-center text-gray-500">Access Denied</div>;
      case 'treatmentTracker':
        return hasAccess('treatmentTracker') ? <TreatmentTracker /> : <div className="p-8 text-center text-gray-500">Access Denied</div>;
      case 'medicalReports':
        return hasAccess('medicalReports') ? <MedicalReports /> : <div className="p-8 text-center text-gray-500">Access Denied</div>;
      case 'bedDemandPrediction':
        return hasAccess('bedDemandPrediction') ? <BedDemandPrediction /> : <div className="p-8 text-center text-gray-500">Access Denied</div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-semibold text-gray-900">{t('system.title')}</h1>
                  <p className="text-xs text-gray-600">{t('system.subtitle')}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Language Switcher */}
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-gray-600" />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'en' | 'hi')}
                  className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="en">English</option>
                  <option value="hi">हिंदी</option>
                </select>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{new Date().toLocaleDateString()}</span>
              </div>
              {/* User Info */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{currentUser.name}</div>
                  <div className={`text-xs px-2 py-1 rounded-full flex items-center space-x-1 ${getRoleColor(userRole)}`}>
                    {getRoleIcon(userRole)}
                    <span>{getRoleDisplayName(userRole)}</span>
                  </div>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">
                    {(currentUser.name || '').split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <nav className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-sm font-medium text-gray-900">Navigation</h2>
                <p className="text-xs text-gray-500 mt-1">{getRoleDisplayName(userRole)} Portal</p>
              </div>
              <div className="p-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center px-3 py-2 text-left rounded-md transition-colors ${
                        activeTab === item.id
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      <span className="text-sm font-medium">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;