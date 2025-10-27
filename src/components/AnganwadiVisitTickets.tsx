import React, { useState } from 'react';
import { Ticket, Plus, Clock, CheckCircle, XCircle, AlertTriangle, MapPin, Users, Calendar, User, Eye, Phone } from 'lucide-react';
import { useApp, AnganwadiVisitTicket } from '../context/AppContext';

const AnganwadiVisitTickets: React.FC = () => {
  const { visitTickets, anganwadis, workers, addVisitTicket, updateVisitTicket, t } = useApp();
  const [selectedTicket, setSelectedTicket] = useState<AnganwadiVisitTicket | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'scheduled' | 'in_progress' | 'completed' | 'missed' | 'cancelled'>('all');
  const [filterAnganwadi, setFilterAnganwadi] = useState<string>('all');

  const filteredTickets = visitTickets.filter(ticket => {
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesAnganwadi = filterAnganwadi === 'all' || ticket.anganwadiId === filterAnganwadi;
    return matchesStatus && matchesAnganwadi;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'missed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'in_progress': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'missed': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-gray-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getVisitTypeColor = (type: string) => {
    switch (type) {
      case 'routine_checkup': return 'bg-blue-100 text-blue-800';
      case 'nutrition_survey': return 'bg-green-100 text-green-800';
      case 'vaccination': return 'bg-purple-100 text-purple-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'follow_up': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const CreateTicketForm = () => {
    const [formData, setFormData] = useState({
      anganwadiId: '',
      workerId: '',
      scheduledDate: '',
      scheduledTime: '',
      assignedArea: '',
      visitType: 'routine_checkup' as 'routine_checkup' | 'nutrition_survey' | 'vaccination' | 'emergency' | 'follow_up',
      targetPregnantWomen: '',
      targetChildren: '',
      reportedBy: 'SUPERVISOR001',
    });

    const selectedAnganwadi = anganwadis.find(a => a.id === formData.anganwadiId);
    const availableWorkers = workers.filter(w => w.anganwadiId === formData.anganwadiId && w.isActive);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      const newTicket: Omit<AnganwadiVisitTicket, 'id'> = {
        anganwadiId: formData.anganwadiId,
        workerId: formData.workerId,
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
        assignedArea: formData.assignedArea,
        visitType: formData.visitType,
        targetBeneficiaries: {
          pregnantWomen: parseInt(formData.targetPregnantWomen) || 0,
          children: parseInt(formData.targetChildren) || 0,
        },
        status: 'scheduled',
        reportedBy: formData.reportedBy,
        reportedDate: new Date().toISOString().split('T')[0],
        escalationLevel: 'none',
      };

      addVisitTicket(newTicket);
      setShowCreateForm(false);
      setFormData({
        anganwadiId: '',
        workerId: '',
        scheduledDate: '',
        scheduledTime: '',
        assignedArea: '',
        visitType: 'routine_checkup',
        targetPregnantWomen: '',
        targetChildren: '',
        reportedBy: 'SUPERVISOR001',
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{t('ticket.createTicket')}</h3>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('ticket.anganwadi')}</label>
                <select
                  required
                  value={formData.anganwadiId}
                  onChange={(e) => setFormData({...formData, anganwadiId: e.target.value, workerId: ''})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">{t('ticket.anganwadi')}</option>
                  {anganwadis.map(anganwadi => (
                    <option key={anganwadi.id} value={anganwadi.id}>
                      {anganwadi.name} - {anganwadi.location.area}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('ticket.worker')}</label>
                <select
                  required
                  value={formData.workerId}
                  onChange={(e) => setFormData({...formData, workerId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!formData.anganwadiId}
                >
                  <option value="">{t('ticket.worker')}</option>
                  {availableWorkers.map(worker => (
                    <option key={worker.id} value={worker.id}>
                      {worker.name} ({t(`worker.${worker.role}`)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('ticket.scheduledDate')}</label>
                <input
                  type="date"
                  required
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('ticket.scheduledTime')}</label>
                <input
                  type="time"
                  required
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({...formData, scheduledTime: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('ticket.assignedArea')}</label>
                <select
                  required
                  value={formData.assignedArea}
                  onChange={(e) => setFormData({...formData, assignedArea: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!selectedAnganwadi}
                >
                  <option value="">{t('ticket.assignedArea')}</option>
                  {selectedAnganwadi?.coverageAreas.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('ticket.visitType')}</label>
                <select
                  value={formData.visitType}
                  onChange={(e) => setFormData({...formData, visitType: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="routine_checkup">{t('ticket.routineCheckup')}</option>
                  <option value="nutrition_survey">{t('ticket.nutritionSurvey')}</option>
                  <option value="vaccination">{t('ticket.vaccination')}</option>
                  <option value="emergency">{t('ticket.emergency')}</option>
                  <option value="follow_up">{t('ticket.followUp')}</option>
                </select>
              </div>
            </div>

            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">{t('ticket.targetBeneficiaries')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('ticket.pregnantWomen')}</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.targetPregnantWomen}
                    onChange={(e) => setFormData({...formData, targetPregnantWomen: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('ticket.children')}</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.targetChildren}
                    onChange={(e) => setFormData({...formData, targetChildren: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
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
                {t('ticket.createTicket')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const TicketDetailsModal = ({ ticket }: { ticket: AnganwadiVisitTicket }) => {
    const anganwadi = anganwadis.find(a => a.id === ticket.anganwadiId);
    const worker = workers.find(w => w.id === ticket.workerId);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{t('ticket.visitTickets')} #{ticket.id}</h3>
                <p className="text-sm text-gray-600">
                  {anganwadi?.name} • {new Date(ticket.scheduledDate).toLocaleDateString()}
                </p>
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
            {/* Status and Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">{t('ticket.visitTickets')} {t('common.status')}</h4>
                <div className="flex items-center space-x-2 mb-4">
                  {getStatusIcon(ticket.status)}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ticket.status)}`}>
                    {t(`common.${ticket.status}`)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getVisitTypeColor(ticket.visitType)}`}>
                    {t(`ticket.${ticket.visitType}`)}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">{t('ticket.scheduledDate')}:</span> {new Date(ticket.scheduledDate).toLocaleDateString()}</div>
                  <div><span className="font-medium">{t('ticket.scheduledTime')}:</span> {ticket.scheduledTime}</div>
                  <div><span className="font-medium">{t('ticket.assignedArea')}:</span> {ticket.assignedArea}</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">{t('anganwadi.centers')} & {t('worker.management')}</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="font-medium">{anganwadi?.name}</div>
                      <div className="text-sm text-gray-600">{anganwadi?.location.area}, {anganwadi?.location.district}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <User className="w-4 h-4 text-green-600" />
                    <div>
                      <div className="font-medium">{worker?.name}</div>
                      <div className="text-sm text-gray-600">{t(`worker.${worker?.role}`)} • {worker?.contactNumber}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Target Beneficiaries */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">{t('ticket.targetBeneficiaries')}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-pink-50 rounded-lg">
                  <Users className="w-5 h-5 text-pink-600" />
                  <div>
                    <div className="font-medium text-pink-800">{ticket.targetBeneficiaries.pregnantWomen}</div>
                    <div className="text-sm text-pink-600">{t('ticket.pregnantWomen')}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-blue-800">{ticket.targetBeneficiaries.children}</div>
                    <div className="text-sm text-blue-600">{t('ticket.children')}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Missed Reasons */}
            {ticket.status === 'missed' && ticket.missedReason && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">{t('ticket.missedReasons')}</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.entries(ticket.missedReason).map(([key, value]) => {
                    if (key === 'otherDescription' || !value) return null;
                    return (
                      <span key={key} className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                        {t(`ticket.${key}`)}
                      </span>
                    );
                  })}
                </div>
                {ticket.missedReason.other && ticket.missedReason.otherDescription && (
                  <div className="mt-3 p-3 bg-yellow-50 rounded-md">
                    <span className="text-sm font-medium">{t('common.other')}: </span>
                    <span className="text-sm">{ticket.missedReason.otherDescription}</span>
                  </div>
                )}
              </div>
            )}

            {/* Completion Details */}
            {ticket.status === 'completed' && ticket.completionDetails && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">{t('ticket.completionDetails')}</h4>
                <div className="bg-green-50 p-4 rounded-lg space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium">{t('ticket.actualStartTime')}:</span> {ticket.completionDetails.actualStartTime}</div>
                    <div><span className="font-medium">{t('ticket.actualEndTime')}:</span> {ticket.completionDetails.actualEndTime}</div>
                  </div>
                  
                  <div>
                    <span className="font-medium text-sm">{t('ticket.beneficiariesCovered')}:</span>
                    <div className="flex space-x-4 mt-1">
                      <span className="text-sm">{t('ticket.pregnantWomen')}: {ticket.completionDetails.beneficiariesCovered.pregnantWomen}</span>
                      <span className="text-sm">{t('ticket.children')}: {ticket.completionDetails.beneficiariesCovered.children}</span>
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-sm">{t('ticket.activitiesCompleted')}:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {ticket.completionDetails.activitiesCompleted.map((activity, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                          {activity}
                        </span>
                      ))}
                    </div>
                  </div>

                  {ticket.completionDetails.issuesEncountered.length > 0 && (
                    <div>
                      <span className="font-medium text-sm">{t('ticket.issuesEncountered')}:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {ticket.completionDetails.issuesEncountered.map((issue, index) => (
                          <span key={index} className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                            {issue}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {ticket.completionDetails.followUpRequired && ticket.completionDetails.nextVisitDate && (
                    <div className="text-sm">
                      <span className="font-medium">{t('ticket.nextVisitDate')}:</span> {new Date(ticket.completionDetails.nextVisitDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Supervisor Comments */}
            {ticket.supervisorComments && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">{t('worker.supervisor')} {t('common.notes')}</h4>
                <div className="p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-800">{ticket.supervisorComments}</p>
                </div>
              </div>
            )}

            {/* Escalation Level */}
            {ticket.escalationLevel !== 'none' && (
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <span className="font-medium text-orange-800">{t('ticket.escalationLevel')}: {ticket.escalationLevel}</span>
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
            <h2 className="text-2xl font-bold text-gray-900">{t('ticket.visitTickets')}</h2>
            <p className="text-gray-600">{t('anganwadi.management')} - {t('ticket.visitTickets')}</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>{t('ticket.createTicket')}</span>
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.filter')} by {t('common.status')}</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">{t('common.all')} {t('common.status')}</option>
              <option value="scheduled">{t('common.scheduled')}</option>
              <option value="in_progress">{t('common.inProgress')}</option>
              <option value="completed">{t('common.completed')}</option>
              <option value="missed">{t('common.missed')}</option>
              <option value="cancelled">{t('common.cancelled')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.filter')} by {t('anganwadi.centers')}</label>
            <select
              value={filterAnganwadi}
              onChange={(e) => setFilterAnganwadi(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">{t('common.all')} {t('anganwadi.centers')}</option>
              {anganwadis.map(anganwadi => (
                <option key={anganwadi.id} value={anganwadi.id}>
                  {anganwadi.name} - {anganwadi.location.area}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Clock className="w-6 h-6 text-blue-600 mr-2" />
            <div>
              <p className="text-sm text-blue-600">{t('common.scheduled')}</p>
              <p className="text-2xl font-bold text-blue-800">
                {visitTickets.filter(t => t.status === 'scheduled').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 text-yellow-600 mr-2" />
            <div>
              <p className="text-sm text-yellow-600">{t('common.inProgress')}</p>
              <p className="text-2xl font-bold text-yellow-800">
                {visitTickets.filter(t => t.status === 'in_progress').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
            <div>
              <p className="text-sm text-green-600">{t('common.completed')}</p>
              <p className="text-2xl font-bold text-green-800">
                {visitTickets.filter(t => t.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <XCircle className="w-6 h-6 text-red-600 mr-2" />
            <div>
              <p className="text-sm text-red-600">{t('common.missed')}</p>
              <p className="text-2xl font-bold text-red-800">
                {visitTickets.filter(t => t.status === 'missed').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Ticket className="w-6 h-6 text-purple-600 mr-2" />
            <div>
              <p className="text-sm text-purple-600">{t('common.all')}</p>
              <p className="text-2xl font-bold text-purple-800">{visitTickets.length}</p>
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
            const anganwadi = anganwadis.find(a => a.id === ticket.anganwadiId);
            const worker = workers.find(w => w.id === ticket.workerId);
            
            return (
              <div key={ticket.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Ticket className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">#{ticket.id}</h3>
                      <p className="text-sm text-gray-600">
                        {anganwadi?.name} • {ticket.assignedArea}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(ticket.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                      {t(`common.${ticket.status}`)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVisitTypeColor(ticket.visitType)}`}>
                      {t(`ticket.${ticket.visitType}`)}
                    </span>
                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">{t('ticket.worker')}</h4>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium">{worker?.name}</div>
                        <div className="text-xs text-gray-500">{t(`worker.${worker?.role}`)}</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">{t('ticket.scheduledDate')} & {t('common.time')}</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(ticket.scheduledDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{ticket.scheduledTime}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">{t('ticket.targetBeneficiaries')}</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>{t('ticket.pregnantWomen')}: {ticket.targetBeneficiaries.pregnantWomen}</div>
                      <div>{t('ticket.children')}: {ticket.targetBeneficiaries.children}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">{t('common.actions')}</h4>
                    <div className="space-y-2">
                      {ticket.status === 'scheduled' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => updateVisitTicket(ticket.id, { status: 'in_progress' })}
                            className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                          >
                            {t('common.inProgress')}
                          </button>
                          <button
                            onClick={() => updateVisitTicket(ticket.id, { status: 'completed' })}
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                          >
                            {t('common.completed')}
                          </button>
                        </div>
                      )}
                      {ticket.status === 'in_progress' && (
                        <button
                          onClick={() => updateVisitTicket(ticket.id, { status: 'completed' })}
                          className="text-green-600 hover:text-green-800 text-sm font-medium"
                        >
                          {t('common.completed')}
                        </button>
                      )}
                      {ticket.escalationLevel !== 'none' && (
                        <div className="flex items-center space-x-1 text-xs text-orange-600">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Escalated to {ticket.escalationLevel}</span>
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

      {/* Modals */}
      {showCreateForm && <CreateTicketForm />}
      {selectedTicket && <TicketDetailsModal ticket={selectedTicket} />}
    </div>
  );
};

export default AnganwadiVisitTickets;