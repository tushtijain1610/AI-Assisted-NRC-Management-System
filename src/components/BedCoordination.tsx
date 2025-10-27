import React, { useState } from 'react';
import { Bed, Plus, CheckCircle, XCircle, Wrench, User, Calendar, AlertCircle, FileText } from 'lucide-react';
import { useApp, Bed as BedType } from '../context/AppContext';

const BedCoordination: React.FC = () => {
  const { beds, patients, updateBed, addBedRequest, t } = useApp();
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showAdmissionForm, setShowAdmissionForm] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedBedId, setSelectedBedId] = useState<string>('');

  const wards = ['all', ...Array.from(new Set(beds.map(bed => bed.ward)))];

  const filteredBeds = beds.filter(bed => {
    const matchesWard = selectedWard === 'all' || bed.ward === selectedWard;
    const matchesStatus = selectedStatus === 'all' || bed.status === selectedStatus;
    return matchesWard && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'occupied': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'maintenance': return <Wrench className="w-4 h-4 text-yellow-600" />;
      default: return <Bed className="w-4 h-4 text-gray-600" />;
    }
  };

  const availableBeds = beds.filter(bed => bed.status === 'available');
  const occupiedBeds = beds.filter(bed => bed.status === 'occupied');
  const maintenanceBeds = beds.filter(bed => bed.status === 'maintenance');

  const AdmissionForm = () => {
    const [patientId, setPatientId] = useState('');
    const availablePatients = patients.filter(p => !p.bedId);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (patientId && selectedBedId) {
        updateBed(selectedBedId, {
          status: 'occupied',
          patientId: patientId,
          admissionDate: new Date().toISOString().split('T')[0],
        });
        setShowAdmissionForm(false);
        setPatientId('');
        setSelectedBedId('');
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Admit Patient to Bed</h3>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Patient for Admission
              </label>
              <select
                required
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Choose a patient</option>
                {availablePatients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} - {patient.type === 'child' ? t('patient.child') : t('patient.pregnant')} ({patient.nutritionStatus})
                  </option>
                ))}
              </select>
            </div>
            {availablePatients.length === 0 && (
              <div className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-md">
                No patients available for admission. All patients are already assigned to beds.
              </div>
            )}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowAdmissionForm(false);
                  setSelectedBedId('');
                  setPatientId('');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={!patientId || availablePatients.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Admit Patient
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const BedRequestForm = () => {
    const [formData, setFormData] = useState({
      patientId: '',
      urgencyLevel: 'medium' as 'low' | 'medium' | 'high' | 'critical',
      medicalJustification: '',
      currentCondition: '',
      estimatedStayDuration: '',
      specialRequirements: '',
    });

    const availablePatients = patients.filter(p => !p.bedId);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      addBedRequest({
        ...formData,
        requestedBy: 'HW001',
        requestDate: new Date().toISOString().split('T')[0],
        estimatedStayDuration: parseInt(formData.estimatedStayDuration),
        status: 'pending',
      });
      setShowRequestForm(false);
      setFormData({
        patientId: '',
        urgencyLevel: 'medium',
        medicalJustification: '',
        currentCondition: '',
        estimatedStayDuration: '',
        specialRequirements: '',
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{t('bed.request')}</h3>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
              <select
                required
                value={formData.patientId}
                onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a patient</option>
                {availablePatients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} - {patient.type === 'child' ? t('patient.child') : t('patient.pregnant')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('bed.urgencyLevel')}</label>
              <select
                value={formData.urgencyLevel}
                onChange={(e) => setFormData({...formData, urgencyLevel: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">{t('urgency.low')}</option>
                <option value="medium">{t('urgency.medium')}</option>
                <option value="high">{t('urgency.high')}</option>
                <option value="critical">{t('urgency.critical')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('bed.medicalJustification')}</label>
              <textarea
                required
                value={formData.medicalJustification}
                onChange={(e) => setFormData({...formData, medicalJustification: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Provide medical justification for bed request..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Condition</label>
              <textarea
                required
                value={formData.currentCondition}
                onChange={(e) => setFormData({...formData, currentCondition: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe patient's current condition..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('bed.estimatedStay')}</label>
                <input
                  type="number"
                  required
                  value={formData.estimatedStayDuration}
                  onChange={(e) => setFormData({...formData, estimatedStayDuration: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Days"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('bed.specialRequirements')}</label>
              <textarea
                value={formData.specialRequirements}
                onChange={(e) => setFormData({...formData, specialRequirements: e.target.value})}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any special requirements or considerations..."
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowRequestForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {t('common.submit')} Request
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Bed Coordination</h2>
          <button
            onClick={() => setShowRequestForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>{t('bed.request')}</span>
          </button>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
              <div>
                <p className="text-sm text-green-600">{t('bed.available')}</p>
                <p className="text-2xl font-bold text-green-800">{availableBeds.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center">
              <XCircle className="w-6 h-6 text-red-600 mr-2" />
              <div>
                <p className="text-sm text-red-600">{t('bed.occupied')}</p>
                <p className="text-2xl font-bold text-red-800">{occupiedBeds.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Wrench className="w-6 h-6 text-yellow-600 mr-2" />
              <div>
                <p className="text-sm text-yellow-600">{t('bed.maintenance')}</p>
                <p className="text-2xl font-bold text-yellow-800">{maintenanceBeds.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Bed className="w-6 h-6 text-blue-600 mr-2" />
              <div>
                <p className="text-sm text-blue-600">Total Beds</p>
                <p className="text-2xl font-bold text-blue-800">{beds.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Ward</label>
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {wards.map(ward => (
                <option key={ward} value={ward}>
                  {ward === 'all' ? 'All Wards' : ward}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by {t('common.status')}</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="available">{t('bed.available')}</option>
              <option value="occupied">{t('bed.occupied')}</option>
              <option value="maintenance">{t('bed.maintenance')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bed Alert */}
      {availableBeds.length <= 2 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-orange-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-orange-800">Low Bed Availability</h3>
              <p className="text-sm text-orange-600 mt-1">
                Only {availableBeds.length} beds available. Consider preparing for capacity management.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBeds.map(bed => {
          const patient = bed.patientId ? patients.find(p => p.id === bed.patientId) : null;
          
          return (
            <div key={bed.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Bed className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Bed {bed.number}</h3>
                    <p className="text-sm text-gray-600">{bed.ward} Ward</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(bed.status)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bed.status)}`}>
                    {t(`bed.${bed.status}`)}
                  </span>
                </div>
              </div>

              {bed.status === 'occupied' && patient && (
                <div className="bg-gray-50 p-4 rounded-md mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-900">{patient.name}</span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3 h-3" />
                      <span>Admitted: {bed.admissionDate ? new Date(bed.admissionDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div>
                      <span className="font-medium">Type:</span> {patient.type === 'child' ? t('patient.child') : t('patient.pregnant')}
                    </div>
                    <div>
                      <span className="font-medium">{t('common.status')}:</span> {patient.nutritionStatus.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                {bed.status === 'available' && (
                  <button
                    onClick={() => {
                      setSelectedBedId(bed.id);
                      setShowAdmissionForm(true);
                    }}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    Admit Patient
                  </button>
                )}
                {bed.status === 'occupied' && (
                  <button
                    onClick={() => updateBed(bed.id, { 
                      status: 'available', 
                      patientId: undefined, 
                      admissionDate: undefined 
                    })}
                    className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
                  >
                    Discharge
                  </button>
                )}
                {bed.status === 'maintenance' && (
                  <button
                    onClick={() => updateBed(bed.id, { status: 'available' })}
                    className="flex-1 bg-yellow-600 text-white px-3 py-2 rounded-md hover:bg-yellow-700 transition-colors text-sm"
                  >
                    Mark Available
                  </button>
                )}
                {bed.status === 'available' && (
                  <button
                    onClick={() => updateBed(bed.id, { status: 'maintenance' })}
                    className="bg-yellow-600 text-white px-3 py-2 rounded-md hover:bg-yellow-700 transition-colors text-sm"
                  >
                    {t('bed.maintenance')}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {showAdmissionForm && <AdmissionForm />}
      {showRequestForm && <BedRequestForm />}
    </div>
  );
};

export default BedCoordination;