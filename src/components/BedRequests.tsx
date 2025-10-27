import React, { useState } from 'react';
import { Bed, Plus, CheckCircle, XCircle, AlertTriangle, User, Calendar, Clock, Guitar as Hospital, Phone, FileText, Eye } from 'lucide-react';
import { useApp, BedRequest } from '../context/AppContext';

const BedRequests: React.FC = () => {
  const { bedRequests, patients, beds, updateBedRequest, updateBed, t } = useApp();
  const [selectedRequest, setSelectedRequest] = useState<BedRequest | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'declined'>('all');
  const [filterUrgency, setFilterUrgency] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');

  const filteredRequests = bedRequests.filter(request => {
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesUrgency = filterUrgency === 'all' || request.urgencyLevel === filterUrgency;
    return matchesStatus && matchesUrgency;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'declined': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const availableBeds = beds.filter(bed => bed.status === 'available');

  const handleApprove = (requestId: string) => {
    const request = bedRequests.find(r => r.id === requestId);
    if (!request) return;

    // Find an available bed in the appropriate ward
    const patient = patients.find(p => p.id === request.patientId);
    const wardType = patient?.type === 'child' ? 'Pediatric' : 'Maternity';
    const availableBed = beds.find(bed => bed.status === 'available' && bed.ward === wardType);

    if (availableBed) {
      // Approve the request
      updateBedRequest(requestId, {
        status: 'approved',
        reviewedBy: 'Dr. Supervisor',
        reviewDate: new Date().toISOString().split('T')[0],
        reviewComments: `Approved for ${request.estimatedStayDuration} days. Bed ${availableBed.number} assigned.`,
      });

      // Assign the bed
      updateBed(availableBed.id, {
        status: 'occupied',
        patientId: request.patientId,
        admissionDate: new Date().toISOString().split('T')[0],
      });
    } else {
      alert(`No available beds in ${wardType} ward. Please decline and refer to hospital.`);
    }
  };

  const handleDecline = (requestId: string, reason: string, referToHospital: boolean = false) => {
    const updates: Partial<BedRequest> = {
      status: 'declined',
      reviewedBy: 'Dr. Supervisor',
      reviewDate: new Date().toISOString().split('T')[0],
      reviewComments: reason,
    };

    if (referToHospital) {
      updates.hospitalReferral = {
        hospitalName: 'District Hospital',
        contactNumber: '+91 612-2234567',
        referralReason: reason,
        referralDate: new Date().toISOString().split('T')[0],
        urgencyLevel: 'urgent',
      };
    }

    updateBedRequest(requestId, updates);
  };

  const RequestDetailsModal = ({ request }: { request: BedRequest }) => {
    const patient = patients.find(p => p.id === request.patientId);
    const [reviewComments, setReviewComments] = useState('');
    const [showHospitalForm, setShowHospitalForm] = useState(false);
    const [hospitalData, setHospitalData] = useState({
      hospitalName: 'District Hospital Patna',
      contactNumber: '+91 612-2234567',
      referralReason: '',
      urgencyLevel: 'urgent' as 'routine' | 'urgent' | 'emergency',
    });

    const handleApproveRequest = () => {
      handleApprove(request.id);
      setSelectedRequest(null);
    };

    const handleDeclineRequest = () => {
      if (!reviewComments.trim()) {
        alert('Please provide review comments');
        return;
      }
      handleDecline(request.id, reviewComments, false);
      setSelectedRequest(null);
    };

    const handleReferToHospital = () => {
      if (!reviewComments.trim() || !hospitalData.referralReason.trim()) {
        alert('Please provide review comments and referral reason');
        return;
      }
      
      const updates: Partial<BedRequest> = {
        status: 'declined',
        reviewedBy: 'Dr. Supervisor',
        reviewDate: new Date().toISOString().split('T')[0],
        reviewComments,
        hospitalReferral: {
          ...hospitalData,
          referralDate: new Date().toISOString().split('T')[0],
        },
      };

      updateBedRequest(request.id, updates);
      setSelectedRequest(null);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{t('bed.requestApproval')}</h3>
                <p className="text-sm text-gray-600">Request ID: {request.id}</p>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Patient Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Patient Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium">{t('common.name')}:</span> {patient?.name}</div>
                <div><span className="font-medium">{t('common.age')}:</span> {patient?.age} years</div>
                <div><span className="font-medium">Type:</span> {patient?.type === 'child' ? t('patient.child') : t('patient.pregnant')}</div>
                <div><span className="font-medium">Nutrition Status:</span> {patient?.nutritionStatus}</div>
                <div><span className="font-medium">{t('common.contact')}:</span> {patient?.contactNumber}</div>
                <div><span className="font-medium">Registration:</span> {patient?.registrationNumber}</div>
              </div>
            </div>

            {/* Request Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Request Details</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Requested By:</span>
                    <span className="text-sm font-medium">{request.requestedBy}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Request Date:</span>
                    <span className="text-sm font-medium">{new Date(request.requestDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{t('bed.urgencyLevel')}:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(request.urgencyLevel)}`}>
                      {t(`urgency.${request.urgencyLevel}`)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{t('bed.estimatedStay')}:</span>
                    <span className="text-sm font-medium">{request.estimatedStayDuration} days</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Bed Availability</h4>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Available Beds:</span> {availableBeds.length}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Pediatric Ward:</span> {availableBeds.filter(b => b.ward === 'Pediatric').length}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Maternity Ward:</span> {availableBeds.filter(b => b.ward === 'Maternity').length}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Required Ward:</span> {patient?.type === 'child' ? 'Pediatric' : 'Maternity'}
                  </div>
                </div>
              </div>
            </div>

            {/* Medical Justification */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">{t('bed.medicalJustification')}</h4>
              <div className="p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">{request.medicalJustification}</p>
              </div>
            </div>

            {/* Current Condition */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Current Condition</h4>
              <div className="p-3 bg-yellow-50 rounded-md">
                <p className="text-sm text-yellow-800">{request.currentCondition}</p>
              </div>
            </div>

            {/* Special Requirements */}
            {request.specialRequirements && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">{t('bed.specialRequirements')}</h4>
                <div className="p-3 bg-purple-50 rounded-md">
                  <p className="text-sm text-purple-800">{request.specialRequirements}</p>
                </div>
              </div>
            )}

            {/* Review Section */}
            {request.status === 'pending' && (
              <div className="border-t pt-6">
                <h4 className="font-medium text-gray-900 mb-3">Supervisor Review</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('bed.reviewComments')}</label>
                    <textarea
                      value={reviewComments}
                      onChange={(e) => setReviewComments(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter review comments..."
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleApproveRequest}
                      disabled={availableBeds.filter(b => b.ward === (patient?.type === 'child' ? 'Pediatric' : 'Maternity')).length === 0}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{t('bed.approve')}</span>
                    </button>
                    <button
                      onClick={handleDeclineRequest}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>{t('bed.decline')}</span>
                    </button>
                    <button
                      onClick={() => setShowHospitalForm(!showHospitalForm)}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Hospital className="w-4 h-4" />
                      <span>{t('bed.referToHospital')}</span>
                    </button>
                  </div>

                  {/* Hospital Referral Form */}
                  {showHospitalForm && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <h5 className="font-medium text-blue-900 mb-3">{t('bed.hospitalReferral')}</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-blue-700 mb-1">{t('bed.hospitalName')}</label>
                          <input
                            type="text"
                            value={hospitalData.hospitalName}
                            onChange={(e) => setHospitalData({...hospitalData, hospitalName: e.target.value})}
                            className="w-full px-3 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-blue-700 mb-1">{t('common.contact')}</label>
                          <input
                            type="text"
                            value={hospitalData.contactNumber}
                            onChange={(e) => setHospitalData({...hospitalData, contactNumber: e.target.value})}
                            className="w-full px-3 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-blue-700 mb-1">Urgency</label>
                          <select
                            value={hospitalData.urgencyLevel}
                            onChange={(e) => setHospitalData({...hospitalData, urgencyLevel: e.target.value as any})}
                            className="w-full px-3 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="routine">{t('urgency.routine')}</option>
                            <option value="urgent">{t('urgency.urgent')}</option>
                            <option value="emergency">{t('urgency.emergency')}</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-blue-700 mb-1">{t('bed.referralReason')}</label>
                          <textarea
                            value={hospitalData.referralReason}
                            onChange={(e) => setHospitalData({...hospitalData, referralReason: e.target.value})}
                            rows={2}
                            className="w-full px-3 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Reason for hospital referral..."
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <button
                          onClick={handleReferToHospital}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                          <Hospital className="w-4 h-4" />
                          <span>Send Referral</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Existing Review */}
            {request.status !== 'pending' && (
              <div className="border-t pt-6">
                <h4 className="font-medium text-gray-900 mb-3">Review Details</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium">Reviewed By:</span> {request.reviewedBy}</div>
                    <div><span className="font-medium">Review Date:</span> {request.reviewDate && new Date(request.reviewDate).toLocaleDateString()}</div>
                    <div><span className="font-medium">{t('common.status')}:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(request.status)}`}>
                        {t(`common.${request.status}`)}
                      </span>
                    </div>
                  </div>
                  {request.reviewComments && (
                    <div className="mt-3">
                      <span className="font-medium">Comments:</span>
                      <p className="text-sm mt-1">{request.reviewComments}</p>
                    </div>
                  )}
                </div>

                {/* Hospital Referral Details */}
                {request.hospitalReferral && (
                  <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-3">{t('bed.hospitalReferral')}</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div><span className="font-medium">{t('bed.hospitalName')}:</span> {request.hospitalReferral.hospitalName}</div>
                      <div><span className="font-medium">{t('common.contact')}:</span> {request.hospitalReferral.contactNumber}</div>
                      <div><span className="font-medium">Urgency:</span> {t(`urgency.${request.hospitalReferral.urgencyLevel}`)}</div>
                      <div><span className="font-medium">Referral Date:</span> {new Date(request.hospitalReferral.referralDate).toLocaleDateString()}</div>
                    </div>
                    <div className="mt-3">
                      <span className="font-medium">{t('bed.referralReason')}:</span>
                      <p className="text-sm mt-1">{request.hospitalReferral.referralReason}</p>
                    </div>
                  </div>
                )}
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
            <h2 className="text-2xl font-bold text-gray-900">{t('nav.bedRequests')}</h2>
            <p className="text-gray-600">Review and approve bed allocation requests</p>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by {t('common.status')}</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">{t('common.pending')}</option>
              <option value="approved">{t('common.approved')}</option>
              <option value="declined">{t('common.declined')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Urgency</label>
            <select
              value={filterUrgency}
              onChange={(e) => setFilterUrgency(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Urgency Levels</option>
              <option value="low">{t('urgency.low')}</option>
              <option value="medium">{t('urgency.medium')}</option>
              <option value="high">{t('urgency.high')}</option>
              <option value="critical">{t('urgency.critical')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Clock className="w-6 h-6 text-yellow-600 mr-2" />
            <div>
              <p className="text-sm text-yellow-600">{t('common.pending')}</p>
              <p className="text-2xl font-bold text-yellow-800">
                {bedRequests.filter(r => r.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
            <div>
              <p className="text-sm text-green-600">{t('common.approved')}</p>
              <p className="text-2xl font-bold text-green-800">
                {bedRequests.filter(r => r.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <XCircle className="w-6 h-6 text-red-600 mr-2" />
            <div>
              <p className="text-sm text-red-600">{t('common.declined')}</p>
              <p className="text-2xl font-bold text-red-800">
                {bedRequests.filter(r => r.status === 'declined').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 text-orange-600 mr-2" />
            <div>
              <p className="text-sm text-orange-600">{t('urgency.critical')}</p>
              <p className="text-2xl font-bold text-orange-800">
                {bedRequests.filter(r => r.urgencyLevel === 'critical').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Bed className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No bed requests found</p>
          </div>
        ) : (
          filteredRequests.map(request => {
            const patient = patients.find(p => p.id === request.patientId);
            
            return (
              <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{patient?.name}</h3>
                      <p className="text-sm text-gray-600">
                        {patient?.type === 'child' ? t('patient.child') : t('patient.pregnant')} • {t('common.age')}: {patient?.age}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(request.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {t(`common.${request.status}`)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(request.urgencyLevel)}`}>
                      {t(`urgency.${request.urgencyLevel}`)}
                    </span>
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Request Details</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>Requested by: {request.requestedBy}</div>
                      <div>{t('common.date')}: {new Date(request.requestDate).toLocaleDateString()}</div>
                      <div>Duration: {request.estimatedStayDuration} days</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Medical Justification</h4>
                    <p className="text-sm text-gray-600 line-clamp-3">{request.medicalJustification}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">{t('common.actions')}</h4>
                    <div className="space-y-2">
                      {request.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApprove(request.id)}
                            disabled={availableBeds.filter(b => b.ward === (patient?.type === 'child' ? 'Pediatric' : 'Maternity')).length === 0}
                            className="text-green-600 hover:text-green-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {t('common.approve')}
                          </button>
                          <button
                            onClick={() => setSelectedRequest(request)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Review
                          </button>
                        </div>
                      )}
                      {request.hospitalReferral && (
                        <div className="flex items-center space-x-1 text-xs text-blue-600">
                          <Hospital className="w-3 h-3" />
                          <span>Referred to {request.hospitalReferral.hospitalName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {selectedRequest && <RequestDetailsModal request={selectedRequest} />}
    </div>
  );
};

export default BedRequests;