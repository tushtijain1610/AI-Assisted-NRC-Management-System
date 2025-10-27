import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, AlertTriangle, Plus, Search, Ticket } from 'lucide-react';
import { useApp, Visit } from '../context/AppContext';

const VisitScheduling: React.FC = () => {
  const { visits, patients, addVisit, updateVisit, addMissedVisitTicket, t } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'scheduled' | 'completed' | 'missed'>('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'missed': return 'bg-red-100 text-red-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'rescheduled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'missed': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'scheduled': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'rescheduled': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const filteredVisits = visits.filter(visit => {
    const matchesDate = visit.scheduledDate === selectedDate;
    const matchesStatus = filterStatus === 'all' || visit.status === filterStatus;
    return matchesDate && matchesStatus;
  });

  const missedVisits = visits.filter(visit => visit.status === 'missed');

  const handleMarkMissed = (visitId: string) => {
    // Update visit status to missed
    updateVisit(visitId, { status: 'missed' });
    
    // Automatically create a missed visit ticket
    const visit = visits.find(v => v.id === visitId);
    if (visit) {
      const newTicket = {
        patientId: visit.patientId,
        visitId: visitId,
        dateReported: new Date().toISOString().split('T')[0],
        reportedBy: visit.healthWorkerId,
        missedConditions: {
          patientNotAvailable: true,
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
        actionsTaken: ['Attempted visit', 'Patient not available'],
        followUpRequired: true,
        nextAttemptDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days later
        supervisorNotified: false,
        status: 'open' as const,
      };
      
      addMissedVisitTicket(newTicket);
    }
  };

  const AddVisitForm = () => {
    const [formData, setFormData] = useState({
      patientId: '',
      scheduledDate: '',
      healthWorkerId: 'HW001',
      notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      addVisit({
        ...formData,
        status: 'scheduled',
      });
      setShowAddForm(false);
      setFormData({
        patientId: '',
        scheduledDate: '',
        healthWorkerId: 'HW001',
        notes: '',
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{t('visit.scheduleNew')}</h3>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('visit.scheduledDate')}</label>
              <input
                type="date"
                required
                value={formData.scheduledDate}
                onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.notes')}</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={3}
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
                {t('visit.schedule')}
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
          <h2 className="text-2xl font-bold text-gray-900">{t('visit.scheduling')}</h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>{t('visit.schedule')}</span>
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('visit.selectDate')}</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('visit.statusFilter')}</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">{t('visit.allStatuses')}</option>
              <option value="scheduled">{t('visit.scheduled')}</option>
              <option value="completed">{t('visit.completed')}</option>
              <option value="missed">{t('visit.missed')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Missed Visits Alert */}
      {missedVisits.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">{t('visit.missedVisitsAlert')}</h3>
              <p className="text-sm text-red-600 mt-1">
                {t('visit.missedVisitsCount', { count: missedVisits.length })}
              </p>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            {missedVisits.slice(0, 3).map(visit => {
              const patient = patients.find(p => p.id === visit.patientId);
              return (
                <div key={visit.id} className="flex items-center justify-between bg-white p-3 rounded-md">
                  <div>
                    <span className="font-medium text-red-800">{patient?.name}</span>
                    <span className="text-sm text-red-600 ml-2">
                      {t('visit.missed')} on {new Date(visit.scheduledDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => updateVisit(visit.id, { status: 'rescheduled' })}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      {t('visit.reschedule')}
                    </button>
                    <button className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center space-x-1">
                      <Ticket className="w-3 h-3" />
                      <span>{t('visit.viewTicket')}</span>
                    </button>
                  </div>
                </div>
              );
            })}
            {missedVisits.length > 3 && (
              <div className="text-center">
                <span className="text-sm text-red-600">+{missedVisits.length - 3} {t('visit.missed')} visits</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Visit List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {t('visit.visitsFor', { date: new Date(selectedDate).toLocaleDateString() })}
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredVisits.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>{t('visit.noVisits')}</p>
            </div>
          ) : (
            filteredVisits.map(visit => {
              const patient = patients.find(p => p.id === visit.patientId);
              if (!patient) return null;

              return (
                <div key={visit.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(visit.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(visit.status)}`}>
                          {t(`visit.${visit.status}`)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{patient.name}</h4>
                        <p className="text-sm text-gray-600">
                          {patient.type === 'child' ? t('patient.child') : t('patient.pregnant')} • {t('common.age')}: {patient.age}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{t('visit.healthWorker')}: {visit.healthWorkerId}</p>
                        {visit.actualDate && (
                          <p className="text-sm text-gray-600">
                            {t('visit.completedOn', { date: new Date(visit.actualDate).toLocaleDateString() })}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        {visit.status === 'scheduled' && (
                          <>
                            <button
                              onClick={() => updateVisit(visit.id, { 
                                status: 'completed', 
                                actualDate: new Date().toISOString().split('T')[0] 
                              })}
                              className="text-green-600 hover:text-green-800 text-sm font-medium"
                            >
                              {t('visit.markComplete')}
                            </button>
                            <button
                              onClick={() => handleMarkMissed(visit.id)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center space-x-1"
                            >
                              <span>{t('visit.markMissed')}</span>
                              <Ticket className="w-3 h-3" />
                            </button>
                          </>
                        )}
                        {visit.status === 'missed' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => updateVisit(visit.id, { status: 'rescheduled' })}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              {t('visit.reschedule')}
                            </button>
                            <button className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center space-x-1">
                              <Ticket className="w-3 h-3" />
                              <span>{t('visit.viewTicket')}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {visit.notes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-700">{visit.notes}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddForm && <AddVisitForm />}
    </div>
  );
};

export default VisitScheduling;