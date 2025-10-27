import React, { useState } from 'react';
import { Brain, TrendingUp, AlertTriangle, Calendar, User, Activity, Target, Lightbulb } from 'lucide-react';
import { useApp, HealthPrediction } from '../context/AppContext';

const AIHealthPrediction: React.FC = () => {
  const { aiPredictions, patients, addAIPrediction, t } = useApp();
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePrediction = async () => {
    if (!selectedPatient) return;

    setIsGenerating(true);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    const patient = patients.find(p => p.id === selectedPatient);
    if (!patient) return;

    // Simulate AI prediction based on patient data
    const riskFactors = [];
    let baseDays = 30;
    let confidence = 0.85;

    // Adjust prediction based on nutrition status
    if (patient.nutritionStatus === 'severely_malnourished') {
      baseDays += 30;
      confidence -= 0.1;
      riskFactors.push('Severe malnutrition');
    } else if (patient.nutritionStatus === 'malnourished') {
      baseDays += 15;
      confidence -= 0.05;
      riskFactors.push('Malnutrition');
    }

    // Adjust based on medical history
    if (patient.medicalHistory.includes('Anemia')) {
      baseDays += 10;
      riskFactors.push('Anemia');
    }
    if (patient.medicalHistory.includes('Hypertension')) {
      baseDays += 5;
      riskFactors.push('Hypertension');
    }

    // Adjust based on age
    if (patient.type === 'child' && patient.age < 2) {
      baseDays += 20;
      riskFactors.push('Very young age');
    }

    // Add some randomness to simulate AI variability
    const variation = Math.random() * 20 - 10; // -10 to +10 days
    const finalDays = Math.max(7, Math.round(baseDays + variation));

    const recommendations = [
      'Regular monitoring of vital signs',
      'Nutritional counseling and diet plan',
      'Micronutrient supplementation',
    ];

    if (patient.nutritionStatus === 'severely_malnourished') {
      recommendations.push('Immediate therapeutic feeding');
      recommendations.push('24-hour medical supervision');
    }

    if (patient.type === 'pregnant') {
      recommendations.push('Prenatal care and monitoring');
      recommendations.push('Folic acid supplementation');
    }

    const newPrediction: Omit<HealthPrediction, 'id'> = {
      patientId: selectedPatient,
      date: new Date().toISOString().split('T')[0],
      predictedRecoveryDays: finalDays,
      confidence: Math.max(0.5, Math.min(1.0, confidence)),
      riskFactors,
      recommendations,
    };

    addAIPrediction(newPrediction);
    setIsGenerating(false);
    setSelectedPatient('');
  };

  const getRecoveryTimeColor = (days: number) => {
    if (days <= 30) return 'bg-green-100 text-green-800';
    if (days <= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Brain className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t('ai.healthPrediction')}</h2>
              <p className="text-gray-600">{t('ai.poweredInsights')}</p>
            </div>
          </div>
        </div>

        {/* Generate New Prediction */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('ai.generateNew')}</h3>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">{t('ai.selectPatient')}</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} - {patient.type === 'child' ? t('patient.child') : t('patient.pregnant')} ({patient.nutritionStatus})
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={generatePrediction}
              disabled={!selectedPatient || isGenerating}
              className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>{t('ai.analyzing')}</span>
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  <span>{t('ai.generatePrediction')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* AI Insights Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="font-semibold text-gray-900">{t('ai.quickRecovery')}</h3>
              <p className="text-2xl font-bold text-green-600">
                {aiPredictions.filter(p => p.predictedRecoveryDays <= 30).length}
              </p>
              <p className="text-sm text-gray-600">{t('ai.lessThanEqual30')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-6 h-6 text-yellow-600" />
            <div>
              <h3 className="font-semibold text-gray-900">{t('ai.moderateRecovery')}</h3>
              <p className="text-2xl font-bold text-yellow-600">
                {aiPredictions.filter(p => p.predictedRecoveryDays > 30 && p.predictedRecoveryDays <= 60).length}
              </p>
              <p className="text-sm text-gray-600">{t('ai.between31And60')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-gray-900">{t('ai.extendedRecovery')}</h3>
              <p className="text-2xl font-bold text-red-600">
                {aiPredictions.filter(p => p.predictedRecoveryDays > 60).length}
              </p>
              <p className="text-sm text-gray-600">{t('ai.greaterThan60')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Predictions List */}
      <div className="space-y-4">
        {aiPredictions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">{t('ai.noPredictions')}</p>
            <p className="text-sm text-gray-400 mt-2">{t('ai.selectPatientFirst')}</p>
          </div>
        ) : (
          aiPredictions.map(prediction => {
            const patient = patients.find(p => p.id === prediction.patientId);
            if (!patient) return null;

            return (
              <div key={prediction.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                      <p className="text-sm text-gray-600">
                        {patient.type === 'child' ? t('patient.child') : t('patient.pregnant')} • {t('common.age')}: {patient.age} • {patient.nutritionStatus.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(prediction.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center mt-1">
                      <Brain className="w-4 h-4 mr-1 text-purple-600" />
                      <span className="text-sm font-medium text-purple-600">{t('ai.generated')}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">{t('ai.recoveryPrediction')}</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{t('ai.estimatedRecoveryTime')}:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRecoveryTimeColor(prediction.predictedRecoveryDays)}`}>
                          {prediction.predictedRecoveryDays} {t('ai.days')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{t('ai.confidenceLevel')}:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(prediction.confidence)}`}>
                          {Math.round(prediction.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">{t('ai.riskFactors')}</h4>
                    <div className="space-y-2">
                      {prediction.riskFactors.map((factor, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          <span className="text-sm text-gray-700">{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">{t('ai.recommendations')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {prediction.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                        <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-blue-800">{recommendation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* AI Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">{t('ticket.importantNote')}</h3>
            <p className="text-sm text-yellow-700 mt-1">
              {t('ticket.aiDisclaimer')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIHealthPrediction;