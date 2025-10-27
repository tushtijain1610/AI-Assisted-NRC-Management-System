import React, { useState } from 'react';
import { FileText, User, Calendar, Activity, Pill, TestTube, Heart, Thermometer, Weight, Ruler, Eye, Plus } from 'lucide-react';
import { useApp, MedicalRecord } from '../context/AppContext';

const MedicalRecords: React.FC = () => {
  const { patients, medicalRecords, getPatientMedicalHistory, addMedicalRecord, t } = useApp();
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const patientRecords = selectedPatient ? getPatientMedicalHistory(selectedPatient) : [];
  const patient = selectedPatient ? patients.find(p => p.id === selectedPatient) : null;

  const getVisitTypeColor = (type: string) => {
    switch (type) {
      case 'admission': return 'bg-blue-100 text-blue-800';
      case 'routine': return 'bg-green-100 text-green-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'follow_up': return 'bg-yellow-100 text-yellow-800';
      case 'discharge': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const AddMedicalRecordForm = () => {
    const [formData, setFormData] = useState({
      patientId: selectedPatient,
      visitType: 'routine' as 'routine' | 'emergency' | 'follow_up' | 'admission' | 'discharge',
      healthWorkerId: 'HW001',
      weight: '',
      height: '',
      temperature: '',
      bloodPressure: '',
      pulse: '',
      respiratoryRate: '',
      oxygenSaturation: '',
      symptoms: '',
      diagnosis: '',
      treatment: '',
      medications: '',
      appetite: 'moderate' as 'poor' | 'moderate' | 'good',
      foodIntake: 'adequate' as 'inadequate' | 'adequate' | 'excessive',
      supplements: '',
      dietPlan: '',
      hemoglobin: '',
      bloodSugar: '',
      proteinLevel: '',
      notes: '',
      nextVisitDate: '',
      followUpRequired: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      const newRecord: Omit<MedicalRecord, 'id'> = {
        patientId: formData.patientId,
        date: new Date().toISOString().split('T')[0],
        visitType: formData.visitType,
        healthWorkerId: formData.healthWorkerId,
        vitals: {
          weight: parseFloat(formData.weight),
          height: parseFloat(formData.height),
          temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
          bloodPressure: formData.bloodPressure || undefined,
          pulse: formData.pulse ? parseInt(formData.pulse) : undefined,
          respiratoryRate: formData.respiratoryRate ? parseInt(formData.respiratoryRate) : undefined,
          oxygenSaturation: formData.oxygenSaturation ? parseInt(formData.oxygenSaturation) : undefined,
        },
        symptoms: formData.symptoms.split(',').map(s => s.trim()).filter(s => s),
        diagnosis: formData.diagnosis.split(',').map(d => d.trim()).filter(d => d),
        treatment: formData.treatment.split(',').map(t => t.trim()).filter(t => t),
        medications: formData.medications.split('\n').map(med => {
          const parts = med.split('|').map(p => p.trim());
          return {
            name: parts[0] || '',
            dosage: parts[1] || '',
            frequency: parts[2] || '',
            duration: parts[3] || '',
          };
        }).filter(med => med.name),
        nutritionAssessment: {
          appetite: formData.appetite,
          foodIntake: formData.foodIntake,
          supplements: formData.supplements.split(',').map(s => s.trim()).filter(s => s),
          dietPlan: formData.dietPlan || undefined,
        },
        labResults: {
          hemoglobin: formData.hemoglobin ? parseFloat(formData.hemoglobin) : undefined,
          bloodSugar: formData.bloodSugar ? parseFloat(formData.bloodSugar) : undefined,
          proteinLevel: formData.proteinLevel ? parseFloat(formData.proteinLevel) : undefined,
        },
        notes: formData.notes,
        nextVisitDate: formData.nextVisitDate || undefined,
        followUpRequired: formData.followUpRequired,
      };

      addMedicalRecord(newRecord);
      setShowAddForm(false);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{t('medical.addMedical')}</h3>
            <p className="text-sm text-gray-600">{t('patient.patient')}: {patient?.name}</p>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('medical.visitType')}</label>
                <select
                  value={formData.visitType}
                  onChange={(e) => setFormData({...formData, visitType: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="routine">{t('medical.routine')}</option>
                  <option value="follow_up">{t('medical.followUp')}</option>
                  <option value="emergency">{t('medical.emergency')}</option>
                  <option value="admission">{t('medical.admission')}</option>
                  <option value="discharge">{t('medical.discharge')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('visit.healthWorkerId')}</label>
                <input
                  type="text"
                  required
                  value={formData.healthWorkerId}
                  onChange={(e) => setFormData({...formData, healthWorkerId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Vitals */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">{t('medical.vitalSigns')}</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.weight')} (kg)</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.height')} (cm)</label>
                  <input
                    type="number"
                    required
                    value={formData.height}
                    onChange={(e) => setFormData({...formData, height: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('medical.temperature')} (°F)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.temperature}
                    onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('patient.bloodPressure')}</label>
                  <input
                    type="text"
                    placeholder="120/80"
                    value={formData.bloodPressure}
                    onChange={(e) => setFormData({...formData, bloodPressure: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Clinical Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('medical.symptoms')} ({t('common.commaSeparated')})</label>
                <textarea
                  value={formData.symptoms}
                  onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('medical.diagnosis')} ({t('common.commaSeparated')})</label>
                <textarea
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Medications */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('medical.medicationsFormat')}
              </label>
              <textarea
                value={formData.medications}
                onChange={(e) => setFormData({...formData, medications: e.target.value})}
                rows={4}
                placeholder={t('medical.medicationsPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Nutrition Assessment */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">{t('medical.nutritionAssessment')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('survey.foodIntake')}</label>
                  <select
                    value={formData.foodIntake}
                    onChange={(e) => setFormData({...formData, foodIntake: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="inadequate">{t('survey.inadequate')}</option>
                    <option value="adequate">{t('survey.adequate')}</option>
                    <option value="excessive">{t('survey.excessive')}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notes and Follow-up */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('medical.clinicalNotes')}</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.followUpRequired}
                  onChange={(e) => setFormData({...formData, followUpRequired: e.target.checked})}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">{t('medical.followUpRequired')}</span>
              </label>
              {formData.followUpRequired && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('medical.nextVisitDate')}</label>
                  <input
                    type="date"
                    value={formData.nextVisitDate}
                    onChange={(e) => setFormData({...formData, nextVisitDate: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
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
                {t('medical.saveRecord')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const RecordDetailsModal = ({ record }: { record: MedicalRecord }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{t('medical.recordDetails')}</h3>
              <p className="text-sm text-gray-600">
                {new Date(record.date).toLocaleDateString()} - {t(`medical.${record.visitType}`)}
              </p>
            </div>
            <button
              onClick={() => setSelectedRecord(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
        <div className="p-6 space-y-6">
          {/* Vitals */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">{t('medical.vitalSigns')}</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Weight className="w-4 h-4 text-blue-600" />
                <span className="text-sm">{t('common.weight')}: {record.vitals.weight} kg</span>
              </div>
              <div className="flex items-center space-x-2">
                <Ruler className="w-4 h-4 text-green-600" />
                <span className="text-sm">{t('common.height')}: {record.vitals.height} cm</span>
              </div>
              {record.vitals.temperature && (
                <div className="flex items-center space-x-2">
                  <Thermometer className="w-4 h-4 text-red-600" />
                  <span className="text-sm">{t('medical.temp')}: {record.vitals.temperature}°F</span>
                </div>
              )}
              {record.vitals.bloodPressure && (
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-purple-600" />
                  <span className="text-sm">{t('medical.bp')}: {record.vitals.bloodPressure}</span>
                </div>
              )}
            </div>
          </div>

          {/* Clinical Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">{t('medical.symptoms')}</h4>
              <div className="space-y-2">
                {record.symptoms.map((symptom, index) => (
                  <span key={index} className="inline-block px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs mr-2">
                    {symptom}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">{t('medical.diagnosis')}</h4>
              <div className="space-y-2">
                {record.diagnosis.map((diag, index) => (
                  <span key={index} className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs mr-2">
                    {diag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Medications */}
          {record.medications.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">{t('medical.medications')}</h4>
              <div className="space-y-2">
                {record.medications.map((med, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                    <Pill className="w-4 h-4 text-green-600" />
                    <span className="font-medium">{med.name}</span>
                    <span className="text-sm text-gray-600">
                      {med.dosage} - {med.frequency} for {med.duration}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lab Results */}
          {record.labResults && Object.keys(record.labResults).length > 0 && (
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">{t('medical.labResults')}</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {record.labResults.hemoglobin && (
                  <div className="flex items-center space-x-2">
                    <TestTube className="w-4 h-4 text-red-600" />
                    <span className="text-sm">{t('medical.hb')}: {record.labResults.hemoglobin} g/dL</span>
                  </div>
                )}
                {record.labResults.bloodSugar && (
                  <div className="flex items-center space-x-2">
                    <TestTube className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">{t('medical.sugar')}: {record.labResults.bloodSugar} mg/dL</span>
                  </div>
                )}
                {record.labResults.proteinLevel && (
                  <div className="flex items-center space-x-2">
                    <TestTube className="w-4 h-4 text-green-600" />
                    <span className="text-sm">{t('medical.protein')}: {record.labResults.proteinLevel} g/dL</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {record.notes && (
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">{t('medical.clinicalNotes')}</h4>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">{record.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t('medical.records')}</h2>
            <p className="text-gray-600">{t('medical.completeHistory')}</p>
          </div>
          {selectedPatient && (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>{t('medical.addRecord')}</span>
            </button>
          )}
        </div>

        {/* Patient Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('medical.selectPatient')}</label>
          <select
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">{t('medical.choosePatient')}</option>
            {patients.map(patient => (
              <option key={patient.id} value={patient.id}>
                {patient.name} - {patient.type === 'child' ? t('patient.child') : t('patient.pregnant')} ({t('medical.registration')}: {patient.registrationNumber})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Patient Summary */}
      {patient && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{patient.name}</h3>
              <p className="text-sm text-gray-600">
                {patient.type === 'child' ? t('patient.child') : t('patient.pregnant')} • {t('common.age')}: {patient.age} • 
                {t('medical.registration')}: {patient.registrationNumber}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-700">{t('medical.currentWeight')}:</span>
              <p className="text-lg font-semibold text-blue-600">{patient.weight} kg</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">{t('common.height')}:</span>
              <p className="text-lg font-semibold text-green-600">{patient.height} cm</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">{t('patient.nutritionStatus')}:</span>
              <p className="text-sm font-semibold text-orange-600">{t(`patient.${patient.nutritionStatus}`)}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">{t('medical.totalRecords')}:</span>
              <p className="text-lg font-semibold text-purple-600">{patientRecords.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* Medical Records List */}
      {selectedPatient && (
        <div className="space-y-4">
          {patientRecords.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">{t('medical.noRecords')}</p>
            </div>
          ) : (
            patientRecords.map(record => (
              <div key={record.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Activity className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVisitTypeColor(record.visitType)}`}>
                          {t(`medical.${record.visitType}`)}
                        </span>
                        <span className="text-sm text-gray-600">by {record.healthWorkerId}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{new Date(record.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedRecord(record)}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">{t('medical.vitals')}</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>{t('common.weight')}: {record.vitals.weight} kg</div>
                      <div>{t('common.height')}: {record.vitals.height} cm</div>
                      {record.vitals.temperature && <div>{t('medical.temp')}: {record.vitals.temperature}°F</div>}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">{t('medical.keyFindings')}</h4>
                    <div className="space-y-1">
                      {record.diagnosis.slice(0, 2).map((diag, index) => (
                        <span key={index} className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs mr-1">
                          {diag}
                        </span>
                      ))}
                      {record.diagnosis.length > 2 && (
                        <span className="text-xs text-gray-500">+{record.diagnosis.length - 2} {t('medical.more')}</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">{t('medical.followUpStatus')}</h4>
                    <div className="text-sm text-gray-600">
                      {record.followUpRequired ? (
                        <span className="text-orange-600">{t('common.required')}</span>
                      ) : (
                        <span className="text-green-600">{t('ticket.notRequired')}</span>
                      )}
                      {record.nextVisitDate && (
                        <div className="text-xs mt-1">{t('visit.nextAttempt', { date: new Date(record.nextVisitDate).toLocaleDateString() })}</div>
                      )}
                    </div>
                  </div>
                </div>

                {record.notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-700">{record.notes}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Modals */}
      {showAddForm && <AddMedicalRecordForm />}
      {selectedRecord && <RecordDetailsModal record={selectedRecord} />}
    </div>
  );
};

export default MedicalRecords;