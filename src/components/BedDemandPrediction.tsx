import React, { useState } from 'react';
import { Brain, TrendingUp, Calendar, BarChart3, AlertTriangle, Bed, Activity, Target } from 'lucide-react';
import { useApp } from '../context/AppContext';

const BedDemandPrediction: React.FC = () => {
  const { beds, bedRequests, treatmentTrackers, t } = useApp();
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter'>('month');

  // Calculate current metrics
  const currentOccupancy = beds.filter(bed => bed.status === 'occupied').length;
  const totalBeds = beds.length;
  const occupancyRate = Math.round((currentOccupancy / totalBeds) * 100);
  const pendingRequests = bedRequests.filter(req => req.status === 'pending').length;
  
  // Calculate average stay duration
  const completedTreatments = treatmentTrackers.filter(t => t.dischargeDate);
  const avgStayDuration = completedTreatments.length > 0 ? 
    Math.round(completedTreatments.reduce((sum, tracker) => 
      sum + Math.ceil((new Date(tracker.dischargeDate!).getTime() - new Date(tracker.admissionDate).getTime()) / (1000 * 60 * 60 * 24)), 0
    ) / completedTreatments.length) : 14;

  // Mock AI predictions based on current data
  const generatePredictions = () => {
    const baseOccupancy = currentOccupancy;
    const seasonalFactor = 1.2; // Assume 20% increase during malnutrition season
    const trendFactor = 1.1; // 10% growth trend
    
    const predictions = {
      week: {
        expectedAdmissions: Math.round(pendingRequests * 0.8 + 2),
        expectedDischarges: Math.round(currentOccupancy * 0.15),
        peakOccupancy: Math.min(totalBeds, Math.round(baseOccupancy * 1.1)),
        demandLevel: 'moderate' as 'low' | 'moderate' | 'high' | 'critical',
      },
      month: {
        expectedAdmissions: Math.round((pendingRequests * 0.8 + 8) * seasonalFactor),
        expectedDischarges: Math.round(currentOccupancy * 0.6),
        peakOccupancy: Math.min(totalBeds, Math.round(baseOccupancy * seasonalFactor)),
        demandLevel: 'high' as 'low' | 'moderate' | 'high' | 'critical',
      },
      quarter: {
        expectedAdmissions: Math.round((pendingRequests * 0.8 + 25) * seasonalFactor * trendFactor),
        expectedDischarges: Math.round(currentOccupancy * 2.5),
        peakOccupancy: Math.min(totalBeds, Math.round(baseOccupancy * seasonalFactor * trendFactor)),
        demandLevel: occupancyRate > 80 ? 'critical' as const : 'high' as const,
      },
    };

    return predictions[selectedTimeframe];
  };

  const prediction = generatePredictions();

  const getDemandColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDemandIcon = (level: string) => {
    switch (level) {
      case 'low': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'moderate': return <Activity className="w-4 h-4 text-yellow-600" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <BarChart3 className="w-4 h-4 text-gray-600" />;
    }
  };

  // Mock historical data for trends
  const historicalData = [
    { month: 'Jan', admissions: 12, discharges: 10, occupancy: 85 },
    { month: 'Feb', admissions: 15, discharges: 13, occupancy: 87 },
    { month: 'Mar', admissions: 18, discharges: 14, occupancy: 91 },
    { month: 'Apr', admissions: 22, discharges: 16, occupancy: 97 },
    { month: 'May', admissions: 20, discharges: 18, occupancy: 89 },
    { month: 'Jun', admissions: 16, discharges: 19, occupancy: 86 },
  ];

  const recommendations = [
    {
      priority: 'high',
      title: 'Capacity Planning',
      description: 'Consider preparing additional beds for peak malnutrition season',
      action: 'Review maintenance schedule and prepare backup beds',
    },
    {
      priority: 'medium',
      title: 'Staff Scheduling',
      description: 'Increase nursing staff during predicted high-demand periods',
      action: 'Schedule additional staff for next month',
    },
    {
      priority: 'medium',
      title: 'Resource Management',
      description: 'Stock additional medical supplies for increased patient load',
      action: 'Order therapeutic feeding supplies and medications',
    },
    {
      priority: 'low',
      title: 'Discharge Planning',
      description: 'Optimize discharge processes to improve bed turnover',
      action: 'Review discharge criteria and follow-up protocols',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Brain className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">AI Bed Demand Prediction</h2>
              <p className="text-gray-600">Future bed demand using AI predictions for capacity planning</p>
            </div>
          </div>
        </div>

        {/* Timeframe Selection */}
        <div className="flex space-x-4">
          {(['week', 'month', 'quarter'] as const).map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => setSelectedTimeframe(timeframe)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedTimeframe === timeframe
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Next {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Bed className="w-6 h-6 text-blue-600 mr-2" />
            <div>
              <p className="text-sm text-blue-600">Current Occupancy</p>
              <p className="text-2xl font-bold text-blue-800">{currentOccupancy}/{totalBeds}</p>
              <p className="text-xs text-blue-600">{occupancyRate}% occupied</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Calendar className="w-6 h-6 text-green-600 mr-2" />
            <div>
              <p className="text-sm text-green-600">Avg. Stay Duration</p>
              <p className="text-2xl font-bold text-green-800">{avgStayDuration}</p>
              <p className="text-xs text-green-600">days</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 text-orange-600 mr-2" />
            <div>
              <p className="text-sm text-orange-600">Pending Requests</p>
              <p className="text-2xl font-bold text-orange-800">{pendingRequests}</p>
              <p className="text-xs text-orange-600">awaiting approval</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <TrendingUp className="w-6 h-6 text-purple-600 mr-2" />
            <div>
              <p className="text-sm text-purple-600">Turnover Rate</p>
              <p className="text-2xl font-bold text-purple-800">
                {completedTreatments.length > 0 ? Math.round(30 / avgStayDuration) : 2}
              </p>
              <p className="text-xs text-purple-600">beds/month</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Predictions */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Brain className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-purple-900">
            AI Predictions for Next {selectedTimeframe.charAt(0).toUpperCase() + selectedTimeframe.slice(1)}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900">Expected Admissions</span>
            </div>
            <p className="text-3xl font-bold text-blue-600">{prediction.expectedAdmissions}</p>
            <p className="text-sm text-gray-600">new patients</p>
          </div>

          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-5 h-5 text-green-600" />
              <span className="font-medium text-gray-900">Expected Discharges</span>
            </div>
            <p className="text-3xl font-bold text-green-600">{prediction.expectedDischarges}</p>
            <p className="text-sm text-gray-600">patients</p>
          </div>

          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Bed className="w-5 h-5 text-orange-600" />
              <span className="font-medium text-gray-900">Peak Occupancy</span>
            </div>
            <p className="text-3xl font-bold text-orange-600">{prediction.peakOccupancy}</p>
            <p className="text-sm text-gray-600">beds ({Math.round((prediction.peakOccupancy / totalBeds) * 100)}%)</p>
          </div>

          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              {getDemandIcon(prediction.demandLevel)}
              <span className="font-medium text-gray-900">Demand Level</span>
            </div>
            <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getDemandColor(prediction.demandLevel)}`}>
              {prediction.demandLevel.toUpperCase()}
            </div>
            <p className="text-sm text-gray-600 mt-1">capacity stress</p>
          </div>
        </div>
      </div>

      {/* Historical Trends */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Historical Trends</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Monthly Admissions vs Discharges</h4>
            <div className="space-y-3">
              {historicalData.map((data, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">{data.month}</span>
                  <div className="flex space-x-4 text-sm">
                    <span className="text-blue-600">↑ {data.admissions} in</span>
                    <span className="text-green-600">↓ {data.discharges} out</span>
                    <span className="text-purple-600">{data.occupancy}% occ.</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Seasonal Patterns</h4>
            <div className="space-y-3">
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="font-medium text-red-800">Peak Season (Mar-May)</span>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  Malnutrition cases increase by 40% during harvest gap period
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Moderate Season (Jun-Oct)</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Steady demand with occasional spikes during monsoon
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-800">Low Season (Nov-Feb)</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Post-harvest period with lower admission rates
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI-Generated Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec, index) => (
            <div key={index} className={`p-4 rounded-lg border-l-4 ${
              rec.priority === 'high' ? 'border-red-500 bg-red-50' :
              rec.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
              'border-green-500 bg-green-50'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                  rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {rec.priority.toUpperCase()} PRIORITY
                </span>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">{rec.title}</h4>
              <p className="text-sm text-gray-700 mb-2">{rec.description}</p>
              <p className="text-sm font-medium text-gray-900">Action: {rec.action}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Capacity Planning Alert */}
      {prediction.demandLevel === 'critical' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Critical Capacity Alert</h3>
              <p className="text-sm text-red-600 mt-1">
                AI predicts critical bed shortage in the next {selectedTimeframe}. Immediate capacity planning required.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BedDemandPrediction;