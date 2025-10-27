import React, { useState } from 'react';
import { Activity, Plus, User, Calendar, TrendingUp, AlertTriangle, CheckCircle, FileText, Heart } from 'lucide-react';
import { useApp, TreatmentTracker } from '../context/AppContext';

const PostHospitalizationTracker: React.FC = () => {
  const { treatmentTrackers, patients, addTreatmentTracker, updateTreatmentTracker, t } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedTracker, setSelectedTracker] = useState<TreatmentTracker | null>(null);

  const dischargedPatients = treatmentTrackers.filter(tracker => tracker.dischargeDate);
  const activeTrackers = treatmentTrackers.filter(tracker => !tracker.dischargeDate);

  const AddTrackerForm = () => {
    const [formData, setFormData] = useState({
      patientId: '',
      hospitalId: 'HOSP001',
      treatmentPlan: '',
      doctorRemarks: '',
      weight: '',
      appetite: 'moderate' as 'poor' | 'moderate' | 'good',
      notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      addTreatmentTracker({
        ...formData,
        admissionDate: new Date().toISOString().split('T')[0],
        treatmentPlan: formData.treatmentPlan.split(',').map(t => t.trim()).filter(t => t),
        medicineSchedule: [],
        doctorRemarks: formData.doctorRemarks.split(',').map(r => r.trim()).filter(r => r),
        dailyProgress: [{
          date: new Date().toISOString().split('T')[0],
          weight: parseFloat(formData.weight),
          appetite: formData.appetite,
          notes: formData.notes,
        }],
        labReports: [],
      });
      setShowAddForm(false);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Add Post-Hospitalization Tracker</h3>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('patient.patient')}</label>
              <select
                required
                value={formData.patientId}
                onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">{t('patient.selectPatient')}</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} - {patient.type === 'child' ? t('patient.child') : t('patient.pregnant')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Treatment Plan (comma separated)</label>
              <textarea
                required
                value={formData.treatmentPlan}
                onChange={(e) => setFormData({...formData, treatmentPlan: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Therapeutic feeding, Iron supplementation, Regular monitoring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Remarks (comma separated)</label>
              <textarea
                value={formData.doctorRemarks}
                onChange={(e) => setFormData({...formData, doctorRemarks: e.target.value})}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Patient responding well, Continue current treatment"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.weight}
                  onChange={(e) => setFormData({...formData, weight: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('survey.appetite')}</label>
                <select
                  value={formData.appetite}
                  onChange={(e) => setFormData({...formData, appetite: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="poor">{t('survey.poor')}</option>
                  <option value="moderate">{t('survey.moderate')}</option>
                  <option value="good">{t('survey.good')}</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Progress Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Patient's current condition and progress..."
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Tracker
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const TrackerDetailsModal = ({ tracker }: { tracker: TreatmentTracker }) => {
    const patient = patients.find(p => p.id === tracker.patientId);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Post-Hospitalization Tracker</h3>
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
                <div><span className="font-medium">Admission:</span> {new Date(tracker.admissionDate).toLocaleDateString()}</div>
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

            {/* Daily Progress */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Daily Progress</h4>
              <div className="space-y-3">
                {tracker.dailyProgress.map((progress, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
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

            {/* Doctor Remarks */}
            {tracker.doctorRemarks.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Doctor Remarks</h4>
                <div className="flex flex-wrap gap-2">
                  {tracker.doctorRemarks.map((remark, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {remark}
                    </span>
                  ))}
                </div>
              </div>
            )}

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
            <h2 className="text-2xl font-bold text-gray-900">{t('nav.postHospitalization')}</h2>
            <p className="text-gray-600">Continue tracking discharged patients and submit follow-up reports</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Tracker</span>
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Activity className="w-6 h-6 text-blue-600 mr-2" />
              <div>
                <p className="text-sm text-blue-600">Active Trackers</p>
                <p className="text-2xl font-bold text-blue-800">{activeTrackers.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
              <div>
                <p className="text-sm text-green-600">Discharged</p>
                <p className="text-2xl font-bold text-green-800">{dischargedPatients.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-6 h-6 text-yellow-600 mr-2" />
              <div>
                <p className="text-sm text-yellow-600">Follow-up Due</p>
                <p className="text-2xl font-bold text-yellow-800">
                  {treatmentTrackers.filter(t => t.dischargeSummary?.nextCheckupDate).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <TrendingUp className="w-6 h-6 text-purple-600 mr-2" />
              <div>
                <p className="text-sm text-purple-600">Recovery Rate</p>
                <p className="text-2xl font-bold text-purple-800">85%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trackers List */}
      <div className="space-y-4">
        {treatmentTrackers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No post-hospitalization trackers found</p>
          </div>
        ) : (
          treatmentTrackers.map(tracker => {
            const patient = patients.find(p => p.id === tracker.patientId);
            const latestProgress = tracker.dailyProgress[tracker.dailyProgress.length - 1];
            
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
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        Discharged
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        Active Treatment
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Treatment Progress</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>Admission: {new Date(tracker.admissionDate).toLocaleDateString()}</div>
                      {tracker.dischargeDate && (
                        <div>Discharge: {new Date(tracker.dischargeDate).toLocaleDateString()}</div>
                      )}
                      <div>Duration: {tracker.dischargeDate ? 
                        Math.ceil((new Date(tracker.dischargeDate).getTime() - new Date(tracker.admissionDate).getTime()) / (1000 * 60 * 60 * 24)) :
                        Math.ceil((new Date().getTime() - new Date(tracker.admissionDate).getTime()) / (1000 * 60 * 60 * 24))
                      } days</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Latest Progress</h4>
                    {latestProgress && (
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>Weight: {latestProgress.weight} kg</div>
                        <div className="flex items-center space-x-2">
                          <Heart className="w-3 h-3" />
                          <span>Appetite: {latestProgress.appetite}</span>
                        </div>
                        <div>Date: {new Date(latestProgress.date).toLocaleDateString()}</div>
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

      {/* Modals */}
      {showAddForm && <AddTrackerForm />}
      {selectedTracker && <TrackerDetailsModal tracker={selectedTracker} />}
    </div>
  );
};

export default PostHospitalizationTracker;