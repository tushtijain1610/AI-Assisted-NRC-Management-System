import React, { useState } from 'react';
import { FileText, Plus, Search, Calendar, User, Heart, Thermometer, Activity } from 'lucide-react';
import { useApp, SurveyReport } from '../context/AppContext';

const SurveyReports: React.FC = () => {
  const { surveys, patients, addSurvey, t } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<string>('all');

  const filteredSurveys = surveys.filter(survey => {
    const patient = patients.find(p => p.id === survey.patientId);
    const matchesSearch = patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         survey.observations.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPatient = selectedPatient === 'all' || survey.patientId === selectedPatient;
    return matchesSearch && matchesPatient;
  });

  const getAppetiteColor = (appetite: string) => {
    switch (appetite) {
      case 'good': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const AddSurveyForm = () => {
    const [formData, setFormData] = useState({
      patientId: '',
      observations: '',
      appetite: 'moderate' as 'poor' | 'moderate' | 'good',
      foodIntake: 'adequate' as 'inadequate' | 'adequate' | 'excessive',
      supplements: '',
      symptoms: '',
      recommendations: '',
      healthWorkerId: 'HW001',
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      addSurvey({
        ...formData,
        date: new Date().toISOString().split('T')[0],
        nutritionData: {
          appetite: formData.appetite,
          foodIntake: formData.foodIntake,
          supplements: formData.supplements.split(',').map(s => s.trim()).filter(s => s),
        },
        symptoms: formData.symptoms.split(',').map(s => s.trim()).filter(s => s),
        recommendations: formData.recommendations.split(',').map(r => r.trim()).filter(r => r),
      });
      setShowAddForm(false);
      setFormData({
        patientId: '',
        observations: '',
        appetite: 'moderate',
        foodIntake: 'adequate',
        supplements: '',
        symptoms: '',
        recommendations: '',
        healthWorkerId: 'HW001',
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{t('survey.submitReport')}</h3>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('survey.observations')}</label>
              <textarea
                required
                value={formData.observations}
                onChange={(e) => setFormData({...formData, observations: e.target.value})}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('survey.observationsPlaceholder')}
              />
            </div>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('survey.supplements')} ({t('common.commaSeparated')})</label>
              <input
                type="text"
                value={formData.supplements}
                onChange={(e) => setFormData({...formData, supplements: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('survey.supplementsPlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('survey.symptoms')} ({t('common.commaSeparated')})</label>
              <input
                type="text"
                value={formData.symptoms}
                onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('survey.symptomsPlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('ai.recommendations')} ({t('common.commaSeparated')})</label>
              <textarea
                value={formData.recommendations}
                onChange={(e) => setFormData({...formData, recommendations: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('survey.recommendationsPlaceholder')}
              />
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
                {t('survey.submit')}
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
          <h2 className="text-2xl font-bold text-gray-900">{t('survey.reports')}</h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>{t('survey.submit')}</span>
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={t('survey.searchReports')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">{t('survey.allPatients')}</option>
            {patients.map(patient => (
              <option key={patient.id} value={patient.id}>
                {patient.name} - {patient.type === 'child' ? t('patient.child') : t('patient.pregnant')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredSurveys.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">{t('survey.noReports')}</p>
          </div>
        ) : (
          filteredSurveys.map(survey => {
            const patient = patients.find(p => p.id === survey.patientId);
            if (!patient) return null;

            return (
              <div key={survey.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                      <p className="text-sm text-gray-600">
                        {patient.type === 'child' ? t('patient.child') : t('patient.pregnant')} • {t('common.age')}: {patient.age}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(survey.date).toLocaleDateString()}
                    </div>
                    <p className="text-sm text-gray-600">By: {survey.healthWorkerId}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">{t('survey.medicalObservations')}</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                      {survey.observations}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">{t('survey.nutritionAssessment')}</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{t('survey.appetite')}:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAppetiteColor(survey.nutritionData.appetite)}`}>
                          {t(`survey.${survey.nutritionData.appetite}`)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{t('survey.foodIntake')}:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {t(`survey.${survey.nutritionData.foodIntake}`)}
                        </span>
                      </div>
                      {survey.nutritionData.supplements.length > 0 && (
                        <div>
                          <span className="text-sm text-gray-600">{t('survey.supplements')}:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {survey.nutritionData.supplements.map((supplement, index) => (
                              <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                {supplement}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {survey.symptoms.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">{t('survey.symptomsObserved')}</h4>
                    <div className="flex flex-wrap gap-2">
                      {survey.symptoms.map((symptom, index) => (
                        <span key={index} className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs flex items-center">
                          <Thermometer className="w-3 h-3 mr-1" />
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {survey.recommendations.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">{t('ai.recommendations')}</h4>
                    <div className="flex flex-wrap gap-2">
                      {survey.recommendations.map((recommendation, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs flex items-center">
                          <Activity className="w-3 h-3 mr-1" />
                          {recommendation}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {showAddForm && <AddSurveyForm />}
    </div>
  );
};

export default SurveyReports;