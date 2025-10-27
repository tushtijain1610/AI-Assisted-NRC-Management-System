import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
export interface User {
  id: string;
  employee_id: string;
  name: string;
  role: 'anganwadi_worker' | 'supervisor' | 'hospital' | 'admin';
  contact_number?: string;
  email?: string;
}

export interface Patient {
  id: string;
  registrationNumber: string;
  aadhaarNumber?: string;
  name: string;
  age: number;
  type: 'child' | 'pregnant';
  pregnancyWeek?: number;
  contactNumber: string;
  emergencyContact?: string;
  address: string;
  weight: number;
  height: number;
  bloodPressure?: string;
  temperature?: number;
  hemoglobin?: number;
  nutritionStatus: 'normal' | 'malnourished' | 'severely_malnourished';
  medicalHistory: string[];
  symptoms: string[];
  documents: string[];
  photos: string[];
  remarks?: string;
  riskScore?: number;
  nutritionalDeficiency: string[];
  bedId?: string;
  lastVisitDate?: string;
  nextVisitDate?: string;
  registeredBy?: string;
  registrationDate: string;
  admissionDate: string;
  nextVisit: string;
}

export interface Bed {
  id: string;
  hospitalId: string;
  number: string;
  ward: string;
  status: 'available' | 'occupied' | 'maintenance';
  patientId?: string;
  admissionDate?: string;
  patientName?: string;
  patientType?: string;
  nutritionStatus?: string;
  hospitalName?: string;
}

export interface Notification {
  id: string;
  userRole: string;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionRequired: boolean;
  read: boolean;
  date: string;
}

// Context
interface AppContextType {
  // Language
  language: 'en' | 'hi';
  setLanguage: (lang: 'en' | 'hi') => void;
  t: (key: string, params?: any) => string;
  
  // Authentication
  currentUser: User | null;
  userRole: string | null;
  setCurrentUser: (user: User, role: string) => void;
  logout: () => void;
  hasAccess: (feature: string) => boolean;
  
  // Data
  patients: Patient[];
  beds: Bed[];
  notifications: Notification[];
  visits: any[];
  anganwadis: any[];
  workers: any[];
  bedRequests: any[];
  medicalRecords: any[];
  surveys: any[];
  aiPredictions: any[];
  missedVisitTickets: any[];
  visitTickets: any[];
  treatmentTrackers: any[];
  
  // Actions
  addPatient: (patient: Omit<Patient, 'id' | 'registrationNumber' | 'admissionDate'>) => void;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  updateBed: (id: string, updates: Partial<Bed>) => void;
  markNotificationRead: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  
  // Loading states
  loading: boolean;
  error: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Translations
const translations = {
  en: {
    'system.title': 'NRC Management System',
    'system.subtitle': 'AI-Assisted Healthcare Management for SAM Children & Pregnant Women',
    'nav.dashboard': 'Dashboard',
    'nav.patientRegistration': 'Patient Registration',
    'nav.bedAvailability': 'Bed Availability',
    'nav.notifications': 'Notifications',
    'nav.postHospitalization': 'Post-Hospitalization',
    'nav.aiPrediction': 'AI Predictions',
    'nav.medicalRecords': 'Medical Records',
    'nav.visitScheduling': 'Visit Scheduling',
    'nav.centerManagement': 'Center Management',
    'nav.workerManagement': 'Worker Management',
    'nav.visitTicketing': 'Visit Ticketing',
    'nav.surveyManagement': 'Survey Management',
    'nav.bedCoordination': 'Bed Coordination',
    'nav.admissionTracking': 'Admission Tracking',
    'nav.bedRequests': 'Bed Requests',
    'nav.bedDashboard': 'Bed Dashboard',
    'nav.treatmentTracker': 'Treatment Tracker',
    'nav.medicalReports': 'Medical Reports',
    'nav.bedDemandPrediction': 'Bed Demand Prediction',
    'common.name': 'Name',
    'common.age': 'Age',
    'common.contact': 'Contact',
    'common.address': 'Address',
    'common.weight': 'Weight',
    'common.height': 'Height',
    'common.status': 'Status',
    'common.date': 'Date',
    'common.time': 'Time',
    'common.actions': 'Actions',
    'common.cancel': 'Cancel',
    'common.submit': 'Submit',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.view': 'View',
    'common.update': 'Update',
    'common.approve': 'Approve',
    'common.decline': 'Decline',
    'common.pending': 'Pending',
    'common.approved': 'Approved',
    'common.declined': 'Declined',
    'common.years': 'years',
    'common.yearsOld': 'years old',
    'patient.patient': 'Patient',
    'patient.child': 'Child',
    'patient.pregnant': 'Pregnant Woman',
    'patient.nutritionStatus': 'Nutrition Status',
    'patient.normal': 'Normal',
    'patient.malnourished': 'Malnourished',
    'patient.severelyMalnourished': 'Severely Malnourished',
    'bed.available': 'Available',
    'bed.occupied': 'Occupied',
    'bed.maintenance': 'Maintenance'
  },
  hi: {
    'system.title': 'एनआरसी प्रबंधन प्रणाली',
    'system.subtitle': 'एआई-सहायक स्वास्थ्य प्रबंधन SAM बच्चों और गर्भवती महिलाओं के लिए',
    'nav.dashboard': 'डैशबोर्ड',
    'nav.patientRegistration': 'रोगी पंजीकरण',
    'nav.bedAvailability': 'बिस्तर उपलब्धता',
    'nav.notifications': 'सूचनाएं',
    'common.name': 'नाम',
    'common.age': 'आयु',
    'common.contact': 'संपर्क',
    'common.address': 'पता',
    'common.weight': 'वजन',
    'common.height': 'ऊंचाई',
    'common.status': 'स्थिति',
    'patient.child': 'बच्चा',
    'patient.pregnant': 'गर्भवती महिला'
  }
};

// Provider Component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [patients, setPatients] = useState<Patient[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [anganwadis, setAnganwadis] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [bedRequests, setBedRequests] = useState<any[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [surveys, setSurveys] = useState<any[]>([]);
  const [aiPredictions, setAiPredictions] = useState<any[]>([]);
  const [missedVisitTickets, setMissedVisitTickets] = useState<any[]>([]);
  const [visitTickets, setVisitTickets] = useState<any[]>([]);
  const [treatmentTrackers, setTreatmentTrackers] = useState<any[]>([]);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  // Translation function
  const t = (key: string, params?: any): string => {
    const translation = translations[language][key] || key;
    if (params) {
      return translation.replace(/\{(\w+)\}/g, (match, paramKey) => params[paramKey] || match);
    }
    return translation;
  };

  // API call helper
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`❌ API call failed for ${endpoint}:`, error);
      throw error;
    }
  };

  // Load all data from CSV files via API
  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Loading all data from CSV files...');

      // Load patients
      try {
        const patientsData = await apiCall('/patients');
        setPatients(patientsData);
        console.log('✅ Patients loaded:', patientsData.length);
      } catch (err) {
        console.error('❌ Failed to load patients:', err);
      }

      // Load beds
      try {
        const bedsData = await apiCall('/beds');
        setBeds(bedsData);
        console.log('✅ Beds loaded:', bedsData.length);
      } catch (err) {
        console.error('❌ Failed to load beds:', err);
      }

      // Load notifications for current user role
      if (userRole) {
        try {
          const notificationsData = await apiCall(`/notifications/role/${userRole}`);
          setNotifications(notificationsData);
          console.log('✅ Notifications loaded:', notificationsData.length);
        } catch (err) {
          console.error('❌ Failed to load notifications:', err);
        }
      }

      console.log('✅ All data loaded successfully from CSV files');
    } catch (err) {
      console.error('❌ Failed to load data from CSV:', err);
      setError('Failed to load data. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  // Authentication functions
  const setCurrentUser = (user: User, role: string) => {
    setCurrentUserState(user);
    setUserRole(role);
    const loginTime = new Date().getTime();
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('userRole', role);
    localStorage.setItem('loginTime', loginTime.toString());
  };

  const logout = () => {
    setCurrentUserState(null);
    setUserRole(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('lastActivity');
  };

  // Role-based access control
  const hasAccess = (feature: string): boolean => {
    if (!userRole) return false;

    const permissions = {
      admin: ['*'], // Admin has access to everything
      anganwadi_worker: [
        'dashboard', 'patientRegistration', 'medicalRecords', 'visitScheduling', 
        'bedAvailability', 'notifications', 'aiPrediction', 'postHospitalization'
      ],
      supervisor: [
        'dashboard', 'centerManagement', 'workerManagement', 'patientRegistration',
        'medicalRecords', 'visitTicketing', 'surveyManagement', 'bedCoordination',
        'admissionTracking', 'notifications', 'bedRequests'
      ],
      hospital: [
        'dashboard', 'bedDashboard', 'notifications', 'treatmentTracker',
        'medicalReports', 'bedDemandPrediction', 'patientRegistration', 'medicalRecords'
      ]
    };

    const userPermissions = permissions[userRole] || [];
    return userPermissions.includes('*') || userPermissions.includes(feature);
  };

  // Data manipulation functions
  const addPatient = async (patientData: Omit<Patient, 'id' | 'registrationNumber' | 'admissionDate'>) => {
    try {
      console.log('📝 Adding new patient via API...');
      const response = await apiCall('/patients', {
        method: 'POST',
        body: JSON.stringify(patientData),
      });
      
      console.log('✅ Patient added successfully:', response);
      await loadAllData(); // Reload data to show new patient
    } catch (error) {
      console.error('❌ Failed to add patient:', error);
      setError('Failed to add patient. Please try again.');
    }
  };

  const updatePatient = async (id: string, updates: Partial<Patient>) => {
    try {
      console.log(`📝 Updating patient ${id} via API...`);
      await apiCall(`/patients/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      
      console.log('✅ Patient updated successfully');
      await loadAllData(); // Reload data to show updates
    } catch (error) {
      console.error('❌ Failed to update patient:', error);
      setError('Failed to update patient. Please try again.');
    }
  };

  const updateBed = async (id: string, updates: Partial<Bed>) => {
    try {
      console.log(`📝 Updating bed ${id} via API...`);
      await apiCall(`/beds/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      
      console.log('✅ Bed updated successfully');
      await loadAllData(); // Reload data to show updates
    } catch (error) {
      console.error('❌ Failed to update bed:', error);
      setError('Failed to update bed. Please try again.');
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      console.log(`📝 Marking notification ${id} as read via API...`);
      await apiCall(`/notifications/${id}/read`, {
        method: 'PUT',
      });
      
      console.log('✅ Notification marked as read');
      await loadAllData(); // Reload notifications
    } catch (error) {
      console.error('❌ Failed to mark notification as read:', error);
    }
  };

  const addNotification = async (notificationData: Omit<Notification, 'id'>) => {
    try {
      console.log('📝 Adding new notification via API...');
      await apiCall('/notifications', {
        method: 'POST',
        body: JSON.stringify(notificationData),
      });
      
      console.log('✅ Notification added successfully');
      await loadAllData(); // Reload notifications
    } catch (error) {
      console.error('❌ Failed to add notification:', error);
    }
  };


  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check for stored user session
        const storedUser = localStorage.getItem('currentUser');
        const storedRole = localStorage.getItem('userRole');
        const loginTime = localStorage.getItem('loginTime');

        if (storedUser && storedRole && loginTime) {
          // Check if session has expired (24 hours)
          const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
          const currentTime = new Date().getTime();
          const elapsed = currentTime - parseInt(loginTime);

          if (elapsed > SESSION_DURATION) {
            console.log('⏰ Session expired');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('userRole');
            localStorage.removeItem('loginTime');
            localStorage.removeItem('lastActivity');
            setLoading(false);
            return;
          }

          setCurrentUserState(JSON.parse(storedUser));
          setUserRole(storedRole);
        }

        setLoading(false);
      } catch (error) {
        console.error('❌ Failed to initialize app:', error);
        setError('Failed to initialize application');
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Load data when user logs in
  useEffect(() => {
    if (currentUser && userRole) {
      loadAllData();
    }
  }, [currentUser, userRole]);

  // Auto-logout after inactivity (15 minutes)
  useEffect(() => {
    if (!currentUser) return;

    const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds
    const WARNING_TIME = 2 * 60 * 1000; // 2 minutes warning before logout
    let inactivityTimer: NodeJS.Timeout;
    let warningTimer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      clearTimeout(warningTimer);

      // Show warning 2 minutes before logout
      warningTimer = setTimeout(() => {
        const shouldContinue = confirm('You will be logged out due to inactivity in 2 minutes. Click OK to stay logged in.');
        if (shouldContinue) {
          resetTimer(); // Reset the timer if user wants to continue
        }
      }, INACTIVITY_TIMEOUT - WARNING_TIME);

      // Logout after inactivity timeout
      inactivityTimer = setTimeout(() => {
        console.log('⏰ Auto-logout due to inactivity');
        alert('You have been logged out due to inactivity.');
        logout();
      }, INACTIVITY_TIMEOUT);
    };

    // Events that indicate user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    // Attach event listeners
    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    // Initial timer setup
    resetTimer();

    // Cleanup
    return () => {
      clearTimeout(inactivityTimer);
      clearTimeout(warningTimer);
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [currentUser]);

  const value: AppContextType = {
    // Language
    language,
    setLanguage,
    t,
    
    // Authentication
    currentUser,
    userRole,
    setCurrentUser,
    logout,
    hasAccess,
    
    // Data
    patients,
    beds,
    notifications,
    visits,
    anganwadis,
    workers,
    bedRequests,
    medicalRecords,
    surveys,
    aiPredictions,
    missedVisitTickets,
    visitTickets,
    treatmentTrackers,
    
    // Actions
    addPatient,
    updatePatient,
    updateBed,
    markNotificationRead,
    addNotification,
    
    // Loading states
    loading,
    error,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};