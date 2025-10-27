import React, { useState } from 'react';
import { Users, Plus, Phone, MapPin, Calendar, Clock, User, Eye, Edit, CheckCircle, XCircle, Building } from 'lucide-react';
import { useApp, Worker } from '../context/AppContext';

const WorkerManagement: React.FC = () => {
  const { workers, anganwadis, addWorker, t } = useApp();
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterRole, setFilterRole] = useState<'all' | 'head' | 'supervisor' | 'helper' | 'asha'>('all');
  const [filterAnganwadi, setFilterAnganwadi] = useState<string>('all');

  const filteredWorkers = workers.filter(worker => {
    const matchesRole = filterRole === 'all' || worker.role === filterRole;
    const matchesAnganwadi = filterAnganwadi === 'all' || worker.anganwadiId === filterAnganwadi;
    return matchesRole && matchesAnganwadi && worker.isActive;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'head': return 'bg-purple-100 text-purple-800';
      case 'supervisor': return 'bg-blue-100 text-blue-800';
      case 'helper': return 'bg-green-100 text-green-800';
      case 'asha': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const WorkerDetailsModal = ({ worker }: { worker: Worker }) => {
    const anganwadi = anganwadis.find(a => a.id === worker.anganwadiId);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{worker.name}</h3>
                <p className="text-sm text-gray-600">Employee ID: {worker.employeeId}</p>
              </div>
              <button
                onClick={() => setSelectedWorker(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Personal Information</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">{t('common.name')}:</span> {worker.name}</div>
                  <div><span className="font-medium">Employee ID:</span> {worker.employeeId}</div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-green-600" />
                    <span>{worker.contactNumber}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span>{worker.address}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Work Information</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Role:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getRoleColor(worker.role)}`}>
                      {t(`worker.${worker.role}`)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>Joined: {new Date(worker.joinDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>Hours: {worker.workingHours.start} - {worker.workingHours.end}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {worker.isActive ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span className={worker.isActive ? 'text-green-600' : 'text-red-600'}>
                      {worker.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Anganwadi Assignment */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Anganwadi Assignment</h4>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Building className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-blue-900">{anganwadi?.name}</div>
                    <div className="text-sm text-blue-700">
                      {anganwadi?.location.area}, {anganwadi?.location.district}
                    </div>
                    <div className="text-xs text-blue-600">Code: {anganwadi?.code}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Assigned Areas */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Assigned Areas</h4>
              <div className="flex flex-wrap gap-2">
                {worker.assignedAreas.map((area, index) => (
                  <span key={index} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                    {area}
                  </span>
                ))}
              </div>
            </div>

            {/* Qualifications */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Qualifications</h4>
              <div className="flex flex-wrap gap-2">
                {worker.qualifications.map((qualification, index) => (
                  <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                    {qualification}
                  </span>
                ))}
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Emergency Contact</h4>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-red-800">{t('common.name')}:</span>
                    <div className="text-red-700">{worker.emergencyContact.name}</div>
                  </div>
                  <div>
                    <span className="font-medium text-red-800">Relation:</span>
                    <div className="text-red-700">{worker.emergencyContact.relation}</div>
                  </div>
                  <div>
                    <span className="font-medium text-red-800">{t('common.contact')}:</span>
                    <div className="text-red-700 flex items-center space-x-1">
                      <Phone className="w-3 h-3" />
                      <span>{worker.emergencyContact.contactNumber}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AddWorkerForm = () => {
    const [formData, setFormData] = useState({
      employeeId: '',
      name: '',
      role: 'helper' as 'head' | 'supervisor' | 'helper' | 'asha',
      anganwadiId: '',
      contactNumber: '',
      address: '',
      assignedAreas: '',
      qualifications: '',
      workingHoursStart: '09:00',
      workingHoursEnd: '17:00',
      emergencyContactName: '',
      emergencyContactRelation: '',
      emergencyContactNumber: '',
      joinDate: new Date().toISOString().split('T')[0],
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      const newWorker: Omit<Worker, 'id'> = {
        employeeId: formData.employeeId,
        name: formData.name,
        role: formData.role,
        anganwadiId: formData.anganwadiId || undefined,
        contactNumber: formData.contactNumber,
        address: formData.address || undefined,
        assignedAreas: formData.assignedAreas.split(',').map(a => a.trim()).filter(a => a),
        qualifications: formData.qualifications.split(',').map(q => q.trim()).filter(q => q),
        workingHours: {
          start: formData.workingHoursStart,
          end: formData.workingHoursEnd,
        },
        emergencyContact: {
          name: formData.emergencyContactName,
          relation: formData.emergencyContactRelation,
          contactNumber: formData.emergencyContactNumber,
        },
        joinDate: formData.joinDate,
        isActive: true,
      };

      addWorker(newWorker);
      setShowAddForm(false);
      setFormData({
        employeeId: '',
        name: '',
        role: 'helper',
        anganwadiId: '',
        contactNumber: '',
        address: '',
        assignedAreas: '',
        qualifications: '',
        workingHoursStart: '09:00',
        workingHoursEnd: '17:00',
        emergencyContactName: '',
        emergencyContactRelation: '',
        emergencyContactNumber: '',
        joinDate: new Date().toISOString().split('T')[0],
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Add New Worker</h3>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID *</label>
                  <input
                    type="text"
                    required
                    value={formData.employeeId}
                    onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="EMP001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="helper">Helper</option>
                    <option value="head">Head</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="asha">ASHA Worker</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Anganwadi Assignment</label>
                  <select
                    value={formData.anganwadiId}
                    onChange={(e) => setFormData({...formData, anganwadiId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">No Assignment</option>
                    {anganwadis.map(anganwadi => (
                      <option key={anganwadi.id} value={anganwadi.id}>
                        {anganwadi.name} - {anganwadi.location.area}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Join Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.joinDate}
                    onChange={(e) => setFormData({...formData, joinDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Work Information */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Work Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Working Hours Start *</label>
                  <input
                    type="time"
                    required
                    value={formData.workingHoursStart}
                    onChange={(e) => setFormData({...formData, workingHoursStart: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Working Hours End *</label>
                  <input
                    type="time"
                    required
                    value={formData.workingHoursEnd}
                    onChange={(e) => setFormData({...formData, workingHoursEnd: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Areas (comma separated)</label>
                  <textarea
                    value={formData.assignedAreas}
                    onChange={(e) => setFormData({...formData, assignedAreas: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Area 1, Area 2, Area 3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qualifications (comma separated)</label>
                  <textarea
                    value={formData.qualifications}
                    onChange={(e) => setFormData({...formData, qualifications: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="ANM Certification, Child Care Training"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Emergency Contact</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.emergencyContactName}
                    onChange={(e) => setFormData({...formData, emergencyContactName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Relation *</label>
                  <input
                    type="text"
                    required
                    value={formData.emergencyContactRelation}
                    onChange={(e) => setFormData({...formData, emergencyContactRelation: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Husband, Mother, Father, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.emergencyContactNumber}
                    onChange={(e) => setFormData({...formData, emergencyContactNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
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
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Worker
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
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t('worker.management')}</h2>
            <p className="text-gray-600">Manage Anganwadi workers and their assignments</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Worker</span>
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Users className="w-6 h-6 text-purple-600 mr-2" />
              <div>
                <p className="text-sm text-purple-600">Heads</p>
                <p className="text-2xl font-bold text-purple-800">
                  {workers.filter(w => w.role === 'head' && w.isActive).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Users className="w-6 h-6 text-blue-600 mr-2" />
              <div>
                <p className="text-sm text-blue-600">Supervisors</p>
                <p className="text-2xl font-bold text-blue-800">
                  {workers.filter(w => w.role === 'supervisor' && w.isActive).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Users className="w-6 h-6 text-green-600 mr-2" />
              <div>
                <p className="text-sm text-green-600">Helpers</p>
                <p className="text-2xl font-bold text-green-800">
                  {workers.filter(w => w.role === 'helper' && w.isActive).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Users className="w-6 h-6 text-orange-600 mr-2" />
              <div>
                <p className="text-sm text-orange-600">ASHA Workers</p>
                <p className="text-2xl font-bold text-orange-800">
                  {workers.filter(w => w.role === 'asha' && w.isActive).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.filter')} by Role</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="head">{t('worker.head')}</option>
              <option value="supervisor">{t('worker.supervisor')}</option>
              <option value="helper">{t('worker.helper')}</option>
              <option value="asha">{t('worker.asha')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.filter')} by Anganwadi</label>
            <select
              value={filterAnganwadi}
              onChange={(e) => setFilterAnganwadi(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Anganwadis</option>
              {anganwadis.map(anganwadi => (
                <option key={anganwadi.id} value={anganwadi.id}>
                  {anganwadi.name} - {anganwadi.location.area}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Workers List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredWorkers.map(worker => {
          const anganwadi = anganwadis.find(a => a.id === worker.anganwadiId);
          
          return (
            <div key={worker.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{worker.name}</h3>
                    <p className="text-sm text-gray-600">ID: {worker.employeeId}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(worker.role)}`}>
                    {t(`worker.${worker.role}`)}
                  </span>
                  <button
                    onClick={() => setSelectedWorker(worker)}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {/* Contact Information */}
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{worker.contactNumber}</span>
                </div>

                {/* Anganwadi Assignment */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Anganwadi Assignment</h4>
                  <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-md">
                    <Building className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="font-medium text-sm text-blue-900">{anganwadi?.name}</div>
                      <div className="text-xs text-blue-700">{anganwadi?.location.area}</div>
                    </div>
                  </div>
                </div>

                {/* Working Hours */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Working Hours</h4>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      {worker.workingHours.start} - {worker.workingHours.end}
                    </span>
                  </div>
                </div>

                {/* Assigned Areas */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Assigned Areas</h4>
                  <div className="flex flex-wrap gap-1">
                    {worker.assignedAreas.slice(0, 2).map((area, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                        {area}
                      </span>
                    ))}
                    {worker.assignedAreas.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        +{worker.assignedAreas.length - 2} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Qualifications */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Qualifications</h4>
                  <div className="flex flex-wrap gap-1">
                    {worker.qualifications.slice(0, 2).map((qualification, index) => (
                      <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                        {qualification}
                      </span>
                    ))}
                    {worker.qualifications.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        +{worker.qualifications.length - 2} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Join Date */}
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Joined: {new Date(worker.joinDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {selectedWorker && <WorkerDetailsModal worker={selectedWorker} />}
      {showAddForm && <AddWorkerForm />}
    </div>
  );
};

export default WorkerManagement;