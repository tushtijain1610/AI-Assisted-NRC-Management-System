import React, { useState } from 'react';
import { Ticket, Plus, Clock, CheckCircle, XCircle, AlertTriangle, MapPin, Users, Calendar, User, Eye, Phone } from 'lucide-react';
import { useApp, MissedVisitTicket } from '../context/AppContext';

const VisitTicketing: React.FC = () => {
  const { missedVisitTickets, patients, workers, addMissedVisitTicket, updateMissedVisitTicket, t } = useApp();
  const [selectedTicket, setSelectedTicket] = useState<MissedVisitTicket | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'in_progress' | 'resolved' | 'escalated'>('all');

  const filteredTickets = missedVisitTickets.filter(ticket => {
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    return matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'escalated': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'escalated': return <AlertTriangle className="w-4 h-4 text-purple-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const CreateTicketForm = () => {
    const [formData, setFormData] = useState({
      patientId: '',
      visitId: '',
      reportedBy: 'SUP001',
      missedConditions: {
        patientNotAvailable: false,
        patientRefused: false,
        familyNotCooperative: false,
        transportIssues: false,
        weatherConditions: false,
        patientIll: false,
        familyEmergency: false,
        workCommitments: false,
        lackOfAwareness: false,
        other: false,
      },
      otherReason: '',
      actionsTaken: '',
      nextAttemptDate: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      const newTicket: Omit<MissedVisitTicket, 'id'> = {
        patientId: formData.patientId,
        visitId: formData.visitId,
        dateReported: new Date().toISOString().split('T')[0],
        reportedBy: formData.reportedBy,
        missedConditions: formData.missedConditions,
        attemptDetails: {
          timeOfAttempt: new Date().toLocaleTimeString(),
          locationVisited: 'Patient home address',
          contactMethod: 'home_visit' as const,
        },
        patientCondition: {
          currentHealthStatus: 'unknown' as const,
          urgencyLevel: 'medium' as const,
          visibleSymptoms: [],
          familyReportedConcerns: [],
        },
        actionsTaken: formData.actionsTaken.split(',').map(a => a.trim()).filter(a => a),
        followUpRequired: true,
        nextAttemptDate: formData.nextAttemptDate,
        supervisorNotified: false,
        status: 'open' as const,
        escalationLevel: 'none',
      };

      addMissedVisitTicket(newTicket);
      setShowCreateForm(false);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Create Missed Visit Ticket</h3>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Missed Visit Conditions</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(formData.missedConditions).map(([key, value]) => (
                  <label key={key} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setFormData({
                        ...formData,
                        missedConditions: {
                          ...formData.missedConditions,
                          [key]: e.target.checked
                        }
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {formData.missedConditions.other && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Other Reason</label>
                <input
                  type="text"
                  value={formData.otherReason}
                  onChange={(e) => setFormData({...formData, otherReason: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Specify other reason..."
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Actions Taken (comma separated)</label>
              <textarea
                value={formData.actionsTaken}
                onChange={(e) => setFormData({...formData, actionsTaken: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Attempted visit, Left message with neighbor, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Next Attempt Date</label>
              <input
                type="date"
                required
                value={formData.nextAttemptDate}
                onChange={(e) => setFormData({...formData, nextAttemptDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Ticket
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const TicketDetailsModal = ({ ticket }: { ticket: MissedVisitTicket }) => {
    const patient = patients.find(p => p.id === ticket.patientId);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Missed Visit Ticket #{ticket.id}</h3>
                <p className="text-sm text-gray-600">{patient?.name}</p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Patient Information */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Patient Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium">{t('common.name')}:</span> {patient?.name}</div>
                <div><span className="font-medium">{t('common.age')}:</span> {patient?.age} years</div>
                <div><span className="font-medium">Type:</span> {patient?.type === 'child' ? t('patient.child') : t('patient.pregnant')}</div>
                <div><span className="font-medium">{t('common.contact')}:</span> {patient?.contactNumber}</div>
              </div>
            </div>

            {/* Ticket Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Ticket Status</h4>
                <div className="flex items-center space-x-2 mb-4">
                  {getStatusIcon(ticket.status)}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ticket.status)}`}>
                    {ticket.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Reported:</span> {new Date(ticket.dateReported).toLocaleDateString()}</div>
                  <div><span className="font-medium">Reported By:</span> {ticket.reportedBy}</div>
                  <div><span className="font-medium">Next Attempt:</span> {new Date(ticket.nextAttemptDate).toLocaleDateString()}</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Attempt Details</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Time:</span> {ticket.attemptDetails.timeOfAttempt}</div>
                  <div><span className="font-medium">Location:</span> {ticket.attemptDetails.locationVisited}</div>
                  <div><span className="font-medium">Method:</span> {ticket.attemptDetails.contactMethod.replace('_', ' ')}</div>
                </div>
              </div>
            </div>

            {/* Missed Conditions */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Missed Visit Conditions</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(ticket.missedConditions).map(([key, value]) => {
                  if (!value) return null;
                  return (
                    <span key={key} className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Actions Taken */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Actions Taken</h4>
              <div className="flex flex-wrap gap-2">
                {ticket.actionsTaken.map((action, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {action}
                  </span>
                ))}
              </div>
            </div>

            {/* Patient Condition */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Patient Condition Assessment</h4>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">Health Status:</span> {ticket.patientCondition.currentHealthStatus}</div>
                  <div><span className="font-medium">Urgency Level:</span> {ticket.patientCondition.urgencyLevel}</div>
                </div>
                {ticket.patientCondition.visibleSymptoms.length > 0 && (
                  <div className="mt-3">
                    <span className="font-medium text-sm">Visible Symptoms:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {ticket.patientCondition.visibleSymptoms.map((symptom, index) => (
                        <span key={index} className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Escalation */}
            {ticket.escalationLevel !== 'none' && (
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-red-800">Escalated to: {ticket.escalationLevel}</span>
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
            <h2 className="text-2xl font-bold text-gray-900">Visit Ticketing System</h2>
            <p className="text-gray-600">Auto-generated tickets for missed visits and follow-up management</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Ticket</span>
          </button>
        </div>

        {/* Filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by {t('common.status')}</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="escalated">Escalated</option>
          </select>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <XCircle className="w-6 h-6 text-red-600 mr-2" />
            <div>
              <p className="text-sm text-red-600">Open Tickets</p>
              <p className="text-2xl font-bold text-red-800">
                {missedVisitTickets.filter(t => t.status === 'open').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Clock className="w-6 h-6 text-yellow-600 mr-2" />
            <div>
              <p className="text-sm text-yellow-600">In Progress</p>
              <p className="text-2xl font-bold text-yellow-800">
                {missedVisitTickets.filter(t => t.status === 'in_progress').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
            <div>
              <p className="text-sm text-green-600">Resolved</p>
              <p className="text-2xl font-bold text-green-800">
                {missedVisitTickets.filter(t => t.status === 'resolved').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 text-purple-600 mr-2" />
            <div>
              <p className="text-sm text-purple-600">Escalated</p>
              <p className="text-2xl font-bold text-purple-800">
                {missedVisitTickets.filter(t => t.status === 'escalated').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Ticket className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No visit tickets found</p>
          </div>
        ) : (
          filteredTickets.map(ticket => {
            const patient = patients.find(p => p.id === ticket.patientId);
            
            return (
              <div key={ticket.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <Ticket className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Ticket #{ticket.id}</h3>
                      <p className="text-sm text-gray-600">{patient?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(ticket.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <button
                      onClick={() => setSelectedTicket(ticket)}
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
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Ticket Information</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>Reported: {new Date(ticket.dateReported).toLocaleDateString()}</div>
                      <div>By: {ticket.reportedBy}</div>
                      <div>Next Attempt: {new Date(ticket.nextAttemptDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">{t('common.actions')}</h4>
                    <div className="space-y-2">
                      {ticket.status === 'open' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => updateMissedVisitTicket(ticket.id, { status: 'in_progress' })}
                            className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                          >
                            Start Progress
                          </button>
                          <button
                            onClick={() => updateMissedVisitTicket(ticket.id, { status: 'resolved' })}
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                          >
                            Resolve
                          </button>
                        </div>
                      )}
                      {ticket.status === 'in_progress' && (
                        <button
                          onClick={() => updateMissedVisitTicket(ticket.id, { status: 'resolved' })}
                          className="text-green-600 hover:text-green-800 text-sm font-medium"
                        >
                          Mark Resolved
                        </button>
                      )}
                      {ticket.escalationLevel !== 'none' && (
                        <div className="flex items-center space-x-1 text-xs text-purple-600">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Escalated to {ticket.escalationLevel}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Actions Taken Preview */}
                {ticket.actionsTaken.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <span className="text-sm font-medium text-gray-700">Actions Taken: </span>
                    <span className="text-sm text-gray-600">
                      {ticket.actionsTaken.slice(0, 2).join(', ')}
                      {ticket.actionsTaken.length > 2 && ` +${ticket.actionsTaken.length - 2} more`}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      {showCreateForm && <CreateTicketForm />}
      {selectedTicket && <TicketDetailsModal ticket={selectedTicket} />}
    </div>
  );
};

export default VisitTicketing;