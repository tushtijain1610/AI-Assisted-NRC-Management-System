import React, { useState } from 'react';
import { Plus, Search, User, Baby, Heart, FileText, Camera, Upload, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const PatientRegistration: React.FC = () => {
  const { patients, addPatient, currentUser, t } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    aadhaarNumber: '',
    age: '',
    type: 'child' as 'child' | 'pregnant',
    pregnancyWeek: '',
    contactNumber: '',
    address: '',
    weight: '',
    height: '',
    bloodPressure: '',
    temperature: '',
    symptoms: '',
    documents: '',
    photos: '',
    remarks: '',
    nutritionStatus: 'severely_malnourished' as 'normal' | 'malnourished' | 'severely_malnourished'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newPatient = {
      name: formData.name,
      aadhaarNumber: formData.aadhaarNumber,
      age: parseInt(formData.age),
      type: formData.type,
      pregnancyWeek: formData.pregnancyWeek ? parseInt(formData.pregnancyWeek) : undefined,
      contactNumber: formData.contactNumber,
      address: formData.address,
      weight: parseFloat(formData.weight),
      height: parseFloat(formData.height),
      bloodPressure: formData.bloodPressure || undefined,
      temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
      symptoms: formData.symptoms.split(',').map(s => s.trim()).filter(s => s),
      documents: formData.documents.split(',').map(d => d.trim()).filter(d => d),
      photos: formData.photos.split(',').map(p => p.trim()).filter(p => p),
      remarks: formData.remarks,
      nutritionStatus: formData.nutritionStatus,
      medicalHistory: [],
      registrationDate: new Date().toISOString().split('T')[0],
      registeredBy: currentUser.employeeId,
      riskScore: formData.nutritionStatus === 'severely_malnourished' ? 85 : 
                 formData.nutritionStatus === 'malnourished' ? 60 : 30,
      nutritionalDeficiency: formData.nutritionStatus === 'severely_malnourished' ? 
                           ['Protein', 'Iron', 'Vitamin D'] : 
                           formData.nutritionStatus === 'malnourished' ? 
                           ['Iron', 'Vitamin D'] : []
    };

    addPatient(newPatient);
    setShowAddForm(false);
    setFormData({
      name: '',
      aadhaarNumber: '',
      age: '',
      type: 'child',
      pregnancyWeek: '',
      contactNumber: '',
      address: '',
      weight: '',
      height: '',
      bloodPressure: '',
      temperature: '',
      symptoms: '',
      documents: '',
      photos: '',
      remarks: '',
      nutritionStatus: 'severely_malnourished'
    });
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.aadhaarNumber.includes(searchTerm)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-100 text-green-800';
      case 'malnourished': return 'bg-yellow-100 text-yellow-800';
      case 'severely_malnourished': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'bg-red-100 text-red-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t('patient.registration')}</h2>
            <p className="text-gray-600">Register SAM children and pregnant women with Aadhaar verification</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Register Patient</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name or Aadhaar number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <User className="w-6 h-6 text-blue-600 mr-2" />
            <div>
              <p className="text-sm text-blue-600">Total Registered</p>
              <p className="text-2xl font-bold text-blue-800">{patients.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Baby className="w-6 h-6 text-green-600 mr-2" />
            <div>
              <p className="text-sm text-green-600">Children</p>
              <p className="text-2xl font-bold text-green-800">
                {patients.filter(p => p.type === 'child').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Heart className="w-6 h-6 text-pink-600 mr-2" />
            <div>
              <p className="text-sm text-pink-600">Pregnant Women</p>
              <p className="text-2xl font-bold text-pink-800">
                {patients.filter(p => p.type === 'pregnant').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
            <div>
              <p className="text-sm text-red-600">SAM Cases</p>
              <p className="text-2xl font-bold text-red-800">
                {patients.filter(p => p.nutritionStatus === 'severely_malnourished').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Patient List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Registered Patients</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredPatients.map((patient) => (
            <div key={patient.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    {patient.type === 'child' ? (
                      <Baby className="w-6 h-6 text-blue-600" />
                    ) : (
                      <Heart className="w-6 h-6 text-pink-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{patient.name}</h4>
                    <p className="text-sm text-gray-600">
                      {patient.type === 'child' ? 'Child' : 'Pregnant Woman'} • Age: {patient.age}
                      {patient.pregnancyWeek && ` • ${patient.pregnancyWeek} weeks`}
                    </p>
                    <p className="text-xs text-gray-500">Aadhaar: {patient.aadhaarNumber}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.nutritionStatus)}`}>
                      {patient.nutritionStatus === 'severely_malnourished' ? 'SAM' : 
                       patient.nutritionStatus === 'malnourished' ? 'MAM' : 'Normal'}
                    </span>
                    {patient.riskScore && (
                      <div className={`mt-1 px-2 py-1 rounded-full text-xs font-medium ${getRiskScoreColor(patient.riskScore)}`}>
                        Risk: {patient.riskScore}%
                      </div>
                    )}
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <div>Weight: {patient.weight} kg</div>
                    <div>Height: {patient.height} cm</div>
                  </div>
                </div>
              </div>
              
              {patient.symptoms.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Symptoms:</p>
                  <div className="flex flex-wrap gap-2">
                    {patient.symptoms.map((symptom, index) => (
                      <span key={index} className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {patient.nutritionalDeficiency && patient.nutritionalDeficiency.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700 mb-2">Nutritional Deficiencies:</p>
                  <div className="flex flex-wrap gap-2">
                    {patient.nutritionalDeficiency.map((deficiency, index) => (
                      <span key={index} className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                        {deficiency}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {patient.remarks && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-700">{patient.remarks}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Registration Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Register New Patient</h3>
              <p className="text-sm text-gray-600">Register SAM children or pregnant women with complete details</p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number *</label>
                    <input
                      type="text"
                      required
                      pattern="[0-9]{4}-[0-9]{4}-[0-9]{4}"
                      placeholder="1234-5678-9012"
                      value={formData.aadhaarNumber}
                      onChange={(e) => setFormData({...formData, aadhaarNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
                    <input
                      type="number"
                      required
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value as 'child' | 'pregnant'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="child">Child</option>
                      <option value="pregnant">Pregnant Woman</option>
                    </select>
                  </div>
                  {formData.type === 'pregnant' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pregnancy Week</label>
                      <input
                        type="number"
                        min="1"
                        max="42"
                        value={formData.pregnancyWeek}
                        onChange={(e) => setFormData({...formData, pregnancyWeek: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.contactNumber}
                      onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                  <textarea
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Medical Details */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Medical Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg) *</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={formData.weight}
                      onChange={(e) => setFormData({...formData, weight: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm) *</label>
                    <input
                      type="number"
                      required
                      value={formData.height}
                      onChange={(e) => setFormData({...formData, height: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Temperature (°F)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.temperature}
                      onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Blood Pressure</label>
                    <input
                      type="text"
                      placeholder="120/80"
                      value={formData.bloodPressure}
                      onChange={(e) => setFormData({...formData, bloodPressure: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nutrition Status *</label>
                    <select
                      value={formData.nutritionStatus}
                      onChange={(e) => setFormData({...formData, nutritionStatus: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="severely_malnourished">Severely Malnourished (SAM)</option>
                      <option value="malnourished">Malnourished (MAM)</option>
                      <option value="normal">Normal</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Symptoms (comma separated)</label>
                  <input
                    type="text"
                    placeholder="Weakness, Loss of appetite, Frequent infections"
                    value={formData.symptoms}
                    onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Documents and Photos */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Documents & Photos</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Documents (comma separated)</label>
                    <input
                      type="text"
                      placeholder="Aadhaar Card, Birth Certificate"
                      value={formData.documents}
                      onChange={(e) => setFormData({...formData, documents: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Photos (comma separated)</label>
                    <input
                      type="text"
                      placeholder="patient_photo.jpg, growth_chart.jpg"
                      value={formData.photos}
                      onChange={(e) => setFormData({...formData, photos: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                  <textarea
                    value={formData.remarks}
                    onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                    rows={3}
                    placeholder="Additional observations and notes..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Register Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientRegistration;