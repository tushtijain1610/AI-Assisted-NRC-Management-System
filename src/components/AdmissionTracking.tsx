import React, { useState } from 'react';
import { TrendingUp, User, Calendar, CheckCircle, XCircle, Clock, FileText, Activity, Heart } from 'lucide-react';
import { useApp, TreatmentTracker } from '../context/AppContext';

const AdmissionTracking: React.FC = () => {
  const { treatmentTrackers, patients, beds, t } = useApp();
  const [filterStatus, setFilterStatus] = useState<'all' | 'admitted' | 'discharged'>('all');
  const [selectedTracker, setSelectedTracker] = useState<TreatmentTracker | null>(null);

  const admittedPatients = treatmentTrackers.filter(tracker => !tracker.dischargeDate);
  const dischargedPatients = treatmentTrackers.filter(tracker => tracker.dischargeDate);

  const filteredTrackers = treatmentTrackers.filter(tracker => {
    if (filterStatus === 'admitted') return !tracker.dischargeDate;
    if (filterStatus === 'discharged') return tracker.dischargeDate;
    return true;
  });

  const TrackerDetailsModal = ({ tracker }: { tracker: TreatmentTracker }) => {
    const patient = patients.find(p => p.id === tracker.patientId);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Admission/Discharge Tracking</h3>
                <p className="text-sm text-gray-600">{patient?.name}</p>
              </div>
              <button
                onClick={() => setSelectedTracker(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Patient Info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Patient Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium">{t('common.name')}:</span> {patient?.name}</div>
                <div><span className="font-medium">{t('common.age')}:</span> {patient?.age} years</div>
                <div><span className="font-medium">Type:</span> {patient?.type === 'child' ? t('patient.child') : t('patient.pregnant')}</div>
                <div><span className="font-medium">Nutrition Status:</span> {patient?.nutritionStatus.replace('_', ' ')}</div>
              </div>
            </div>

            {/* Admission Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Admission Details</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Admission Date:</span> {new Date(tracker.admissionDate).toLocaleDateString()}</div>
                  <div><span className="font-medium">Hospital ID:</span> {tracker.hospitalId}</div>
                  <div><span className="font-medium">Duration:</span> {tracker.dischargeDate ? 
                    Math.ceil((new Date(tracker.dischargeDate).getTime() - new Date(tracker.admissionDate).getTime()) / (1000 * 60 * 60 * 24)) :
                    Math.ceil((new Date().getTime() - new Date(tracker.admissionDate).getTime()) / (1000 * 60 * 60 * 24))
                  } days</div>
                  {tracker.dischargeDate && (
                    <div><span className="font-medium">Discharge Date:</span> {new Date(tracker.dischargeDate).toLocaleDateString()}</div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Current Status</h4>
                <div className="flex items-center space-x-2 mb-3">
                  {tracker.dischargeDate ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        Discharged
                      </span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        Currently Admitted
                      </span>
                    </>
                  )}
                </div>
                {tracker.dailyProgress.length > 0 && (
                  <div className="text-sm">
                    <span className="font-medium">Latest Weight:</span> {tracker.dailyProgress[tracker.dailyProgress.length - 1].weight} kg
                  </div>
                )}
              </div>
            </div>

            {/* Treatment Plan */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Treatment Plan</h4>
              <div className="flex flex-wrap gap-2">
                {tracker.treatmentPlan.map((treatment, index) => (
                  <span key={index} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                    {treatment}
                  </span>
                ))}
              </div>
            </div>

            {/* Progress Tracking */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Progress Tracking</h4>
              <div className="space-y-3">
                {tracker.dailyProgress.slice(-5).map((progress, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{new Date(progress.date).toLocaleDateString()}</span>
                      <div className="flex items-center space-x-4 text-sm">
                        <span>Weight: {progress.weight} kg</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          progress.appetite === 'good' ? 'bg-green-100 text-green-700' :
                          progress.appetite === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          Appetite: {progress.appetite}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{progress.notes}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Discharge Summary */}
            {tracker.dischargeSummary && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-3">Discharge Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">Final Weight:</span> {tracker.dischargeSummary.finalWeight} kg</div>
                  <div><span className="font-medium">Next Checkup:</span> {new Date(tracker.dischargeSummary.nextCheckupDate).toLocaleDateString()}</div>
                </div>
                <div className="mt-3">
                  <span className="font-medium">Health Improvement:</span>
                  <p className="text-sm mt-1">{tracker.dischargeSummary.healthImprovement}</p>
                </div>
                <div className="mt-3">
                  <span className="font-medium">Follow-up Instructions:</span>
                  <ul className="list-disc list-inside text-sm mt-1">
                    {tracker.dischargeSummary.followUpInstructions.map((instruction, index) => (
                      <li key={index}>{instruction}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Admission/Discharge Tracking</h2>
            <p className="text-gray-600">Monitor patient admission and discharge records</p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Clock className="w-6 h-6 text-blue-600 mr-2" />
              <div>
                <p className="text-sm text-blue-600">Currently Admitted</p>
                <p className="text-2xl font-bold text-blue-800">{admittedPatients.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
              <div>
                <p className="text-sm text-green-600">Successfully Discharged</p>
                <p className="text-2xl font-bold text-green-800">{dischargedPatients.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <TrendingUp className="w-6 h-6 text-purple-600 mr-2" />
              <div>
                <p className="text-sm text-purple-600">Average Stay</p>
                <p className="text-2xl font-bold text-purple-800">
                  {dischargedPatients.length > 0 ? 
                    Math.round(dischargedPatients.reduce((sum, tracker) => 
                      sum + Math.ceil((new Date(tracker.dischargeDate!).getTime() - new Date(tracker.admissionDate).getTime()) / (1000 * 60 * 60 * 24)), 0
                    ) / dischargedPatients.length) : 0
                  } days
                </p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Activity className="w-6 h-6 text-yellow-600 mr-2" />
              <div>
                <p className="text-sm text-yellow-600">Recovery Rate</p>
                <p className="text-2xl font-bold text-yellow-800">
                  {dischargedPatients.length > 0 ? 
                    Math.round((dischargedPatients.filter(t => t.dischargeSummary?.healthImprovement.includes('improved')).length / dischargedPatients.length) * 100) : 0
                  }%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Records</option>
            <option value="admitted">Currently Admitted</option>
            <option value="discharged">Discharged</option>
          </select>
        </div>
      </div>

      {/* Records List */}
      <div className="space-y-4">
        {filteredTrackers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No admission/discharge records found</p>
          </div>
        ) : (
          filteredTrackers.map(tracker => {
            const patient = patients.find(p => p.id === tracker.patientId);
            const latestProgress = tracker.dailyProgress[tracker.dailyProgress.length - 1];
            const stayDuration = tracker.dischargeDate ? 
              Math.ceil((new Date(tracker.dischargeDate).getTime() - new Date(tracker.admissionDate).getTime()) / (1000 * 60 * 60 * 24)) :
              Math.ceil((new Date().getTime() - new Date(tracker.admissionDate).getTime()) / (1000 * 60 * 60 * 24));
            
            return (
              <div key={tracker.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{patient?.name}</h3>
                      <p className="text-sm text-gray-600">
                        {patient?.type === 'child' ? t('patient.child') : t('patient.pregnant')} • {t('common.age')}: {patient?.age}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {tracker.dischargeDate ? (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center space-x-1">
                        <CheckCircle className="w-4 h-4" />
                        <span>Discharged</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>Admitted</span>
                      </span>
                    )}
                    <button
                      onClick={() => setSelectedTracker(tracker)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <FileText className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Admission Details</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>Admitted: {new Date(tracker.admissionDate).toLocaleDateString()}</span>
                      </div>
                      {tracker.dischargeDate && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>Discharged: {new Date(tracker.dischargeDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div>Duration: {stayDuration} days</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Current Progress</h4>
                    {latestProgress && (
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>Weight: {latestProgress.weight} kg</div>
                        <div className="flex items-center space-x-2">
                          <Heart className="w-3 h-3" />
                          <span>Appetite: {latestProgress.appetite}</span>
                        </div>
                        <div>Last Update: {new Date(latestProgress.date).toLocaleDateString()}</div>
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Treatment Plan</h4>
                    <div className="flex flex-wrap gap-1">
                      {tracker.treatmentPlan.slice(0, 2).map((treatment, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                          {treatment}
                        </span>
                      ))}
                      {tracker.treatmentPlan.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                          +{tracker.treatmentPlan.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Status</h4>
                    <div className="space-y-1 text-sm">
                      <div>Hospital: {tracker.hospitalId}</div>
                      {tracker.dischargeSummary && (
                        <div className="text-green-600">
                          Recovery: {tracker.dischargeSummary.healthImprovement.includes('improved') ? 'Improved' : 'Stable'}
                        </div>
                      )}
                      {!tracker.dischargeDate && (
                        <div className="text-blue-600">
                          Active Treatment
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {tracker.dischargeSummary && (
                  <div className="mt-4 p-3 bg-green-50 rounded-md">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-800">Discharge Summary Available</span>
                    </div>
                    <p className="text-sm text-green-700">{tracker.dischargeSummary.healthImprovement}</p>
                    <div className="text-xs text-green-600 mt-1">
                      Next checkup: {new Date(tracker.dischargeSummary.nextCheckupDate).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {selectedTracker && <TrackerDetailsModal tracker={selectedTracker} />}
    </div>
  );
};

export default AdmissionTracking;