import React, { useState } from 'react';
import { FileText, Upload, Download, Eye, Calendar, User, TestTube, Heart, Activity } from 'lucide-react';
import { useApp } from '../context/AppContext';

const MedicalReports: React.FC = () => {
  const { treatmentTrackers, patients, t } = useApp();
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Generate mock lab reports from treatment trackers
  const labReports = treatmentTrackers.flatMap(tracker => 
    tracker.labReports.map(report => ({
      ...report,
      patientId: tracker.patientId,
      trackerId: tracker.id,
      hospitalId: tracker.hospitalId,
    }))
  );

  const dischargeSummaries = treatmentTrackers
    .filter(tracker => tracker.dischargeSummary)
    .map(tracker => ({
      id: `discharge-${tracker.id}`,
      patientId: tracker.patientId,
      trackerId: tracker.id,
      hospitalId: tracker.hospitalId,
      type: 'Discharge Summary',
      date: tracker.dischargeDate!,
      summary: tracker.dischargeSummary!,
    }));

  const allReports = [
    ...labReports.map(report => ({ ...report, category: 'lab' })),
    ...dischargeSummaries.map(report => ({ ...report, category: 'discharge' })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const UploadForm = () => {
    const [formData, setFormData] = useState({
      patientId: '',
      reportType: 'Blood Test',
      results: '',
      notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      // In a real app, this would upload the file and save the report
      alert('Report uploaded successfully!');
      setShowUploadForm(false);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Upload Medical Report</h3>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
              <select
                value={formData.reportType}
                onChange={(e) => setFormData({...formData, reportType: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Blood Test">Blood Test</option>
                <option value="Urine Test">Urine Test</option>
                <option value="X-Ray">X-Ray</option>
                <option value="Ultrasound">Ultrasound</option>
                <option value="Discharge Summary">Discharge Summary</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Results/Findings</label>
              <textarea
                required
                value={formData.results}
                onChange={(e) => setFormData({...formData, results: e.target.value})}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter test results or findings..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any additional notes or observations..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload File</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
                <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Upload Report
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const ReportDetailsModal = ({ report }: { report: any }) => {
    const patient = patients.find(p => p.id === report.patientId);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{report.type}</h3>
                <p className="text-sm text-gray-600">{patient?.name} - {new Date(report.date).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
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
                <div><span className="font-medium">Hospital:</span> {report.hospitalId}</div>
              </div>
            </div>

            {/* Report Content */}
            {report.category === 'lab' && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Lab Results</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-800">{report.results}</p>
                </div>
              </div>
            )}

            {report.category === 'discharge' && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Discharge Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium">Final Weight:</span> {report.summary.finalWeight} kg</div>
                    <div><span className="font-medium">Next Checkup:</span> {new Date(report.summary.nextCheckupDate).toLocaleDateString()}</div>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Health Improvement</h5>
                  <div className="bg-green-50 p-3 rounded-md">
                    <p className="text-sm text-green-800">{report.summary.healthImprovement}</p>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Follow-up Instructions</h5>
                  <div className="bg-blue-50 p-3 rounded-md">
                    <ul className="list-disc list-inside text-sm text-blue-800">
                      {report.summary.followUpInstructions.map((instruction: string, index: number) => (
                        <li key={index}>{instruction}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3 pt-4 border-t">
              <button 
                onClick={() => handleDownload(report)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
              <button 
                onClick={() => handlePrint(report)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleDownload = (report: any) => {
    const patient = patients.find(p => p.id === report.patientId);
    
    // Create report content
    let content = '';
    if (report.category === 'lab') {
      content = `
LAB REPORT
===========

Patient: ${patient?.name}
Age: ${patient?.age} years
Type: ${patient?.type === 'child' ? 'Child' : 'Pregnant Woman'}
Date: ${new Date(report.date).toLocaleDateString()}
Hospital: ${report.hospitalId}

TEST TYPE: ${report.type}

RESULTS:
${report.results}

Generated on: ${new Date().toLocaleString()}
      `;
    } else {
      content = `
DISCHARGE SUMMARY
================

Patient: ${patient?.name}
Age: ${patient?.age} years
Type: ${patient?.type === 'child' ? 'Child' : 'Pregnant Woman'}
Discharge Date: ${new Date(report.date).toLocaleDateString()}
Hospital: ${report.hospitalId}

FINAL WEIGHT: ${report.summary.finalWeight} kg
NEXT CHECKUP: ${new Date(report.summary.nextCheckupDate).toLocaleDateString()}

HEALTH IMPROVEMENT:
${report.summary.healthImprovement}

FOLLOW-UP INSTRUCTIONS:
${report.summary.followUpInstructions.map((instruction: string, index: number) => `${index + 1}. ${instruction}`).join('\n')}

Generated on: ${new Date().toLocaleString()}
      `;
    }

    // Create and download file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.category}_report_${patient?.name}_${new Date(report.date).toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handlePrint = (report: any) => {
    const patient = patients.find(p => p.id === report.patientId);
    
    // Create print content
    let printContent = '';
    if (report.category === 'lab') {
      printContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="text-align: center; color: #2563eb;">LAB REPORT</h1>
          <hr style="margin: 20px 0;">
          
          <div style="margin-bottom: 20px;">
            <h3>Patient Information</h3>
            <p><strong>Name:</strong> ${patient?.name}</p>
            <p><strong>Age:</strong> ${patient?.age} years</p>
            <p><strong>Type:</strong> ${patient?.type === 'child' ? 'Child' : 'Pregnant Woman'}</p>
            <p><strong>Date:</strong> ${new Date(report.date).toLocaleDateString()}</p>
            <p><strong>Hospital:</strong> ${report.hospitalId}</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h3>Test Information</h3>
            <p><strong>Test Type:</strong> ${report.type}</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h3>Results</h3>
            <div style="background: #f3f4f6; padding: 15px; border-radius: 5px;">
              ${report.results.replace(/\n/g, '<br>')}
            </div>
          </div>
          
          <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #666;">
            Generated on: ${new Date().toLocaleString()}
          </div>
        </div>
      `;
    } else {
      printContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="text-align: center; color: #16a34a;">DISCHARGE SUMMARY</h1>
          <hr style="margin: 20px 0;">
          
          <div style="margin-bottom: 20px;">
            <h3>Patient Information</h3>
            <p><strong>Name:</strong> ${patient?.name}</p>
            <p><strong>Age:</strong> ${patient?.age} years</p>
            <p><strong>Type:</strong> ${patient?.type === 'child' ? 'Child' : 'Pregnant Woman'}</p>
            <p><strong>Discharge Date:</strong> ${new Date(report.date).toLocaleDateString()}</p>
            <p><strong>Hospital:</strong> ${report.hospitalId}</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h3>Discharge Details</h3>
            <p><strong>Final Weight:</strong> ${report.summary.finalWeight} kg</p>
            <p><strong>Next Checkup:</strong> ${new Date(report.summary.nextCheckupDate).toLocaleDateString()}</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h3>Health Improvement</h3>
            <div style="background: #f0fdf4; padding: 15px; border-radius: 5px;">
              ${report.summary.healthImprovement}
            </div>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h3>Follow-up Instructions</h3>
            <ol style="background: #eff6ff; padding: 15px; border-radius: 5px;">
              ${report.summary.followUpInstructions.map((instruction: string) => `<li>${instruction}</li>`).join('')}
            </ol>
          </div>
          
          <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #666;">
            Generated on: ${new Date().toLocaleString()}
          </div>
        </div>
      `;
    }

    // Open print window
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Medical Report - ${patient?.name}</title>
            <style>
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            ${printContent}
            <div class="no-print" style="text-align: center; margin-top: 20px;">
              <button onclick="window.print()" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer;">Print</button>
              <button onclick="window.close()" style="padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">Close</button>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Medical Reports</h2>
            <p className="text-gray-600">Upload lab reports, discharge summaries, and health improvement stats</p>
          </div>
          <button
            onClick={() => setShowUploadForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Report</span>
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <TestTube className="w-6 h-6 text-blue-600 mr-2" />
              <div>
                <p className="text-sm text-blue-600">Lab Reports</p>
                <p className="text-2xl font-bold text-blue-800">{labReports.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <FileText className="w-6 h-6 text-green-600 mr-2" />
              <div>
                <p className="text-sm text-green-600">Discharge Summaries</p>
                <p className="text-2xl font-bold text-green-800">{dischargeSummaries.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Heart className="w-6 h-6 text-purple-600 mr-2" />
              <div>
                <p className="text-sm text-purple-600">Total Reports</p>
                <p className="text-2xl font-bold text-purple-800">{allReports.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Activity className="w-6 h-6 text-yellow-600 mr-2" />
              <div>
                <p className="text-sm text-yellow-600">This Month</p>
                <p className="text-2xl font-bold text-yellow-800">
                  {allReports.filter(report => 
                    new Date(report.date).getMonth() === new Date().getMonth()
                  ).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {allReports.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No medical reports found</p>
          </div>
        ) : (
          allReports.map((report, index) => {
            const patient = patients.find(p => p.id === report.patientId);
            
            return (
              <div key={`${report.category}-${index}`} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      report.category === 'lab' ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                      {report.category === 'lab' ? (
                        <TestTube className={`w-5 h-5 ${report.category === 'lab' ? 'text-blue-600' : 'text-green-600'}`} />
                      ) : (
                        <FileText className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{report.type}</h3>
                      <p className="text-sm text-gray-600">{patient?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(report.date).toLocaleDateString()}
                      </div>
                      <p className="text-sm text-gray-600">Hospital: {report.hospitalId}</p>
                    </div>
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Patient Details</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>Type: {patient?.type === 'child' ? t('patient.child') : t('patient.pregnant')}</div>
                      <div>{t('common.age')}: {patient?.age} years</div>
                      <div>Status: {patient?.nutritionStatus.replace('_', ' ')}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Report Summary</h4>
                    <div className="text-sm text-gray-600">
                      {report.category === 'lab' && (
                        <p className="line-clamp-3">{report.results}</p>
                      )}
                      {report.category === 'discharge' && (
                        <p className="line-clamp-3">{report.summary.healthImprovement}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">{t('common.actions')}</h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        {t('common.view')}
                      </button>
                      <button 
                        onClick={() => handleDownload(report)}
                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                      >
                        Download
                      </button>
                      <button 
                        onClick={() => handlePrint(report)}
                        className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                      >
                        Print
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      {showUploadForm && <UploadForm />}
      {selectedReport && <ReportDetailsModal report={selectedReport} />}
    </div>
  );
};

export default MedicalReports;