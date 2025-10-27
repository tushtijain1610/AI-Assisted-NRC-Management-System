import React, { useState } from 'react';
import { MapPin, Plus, Users, Phone, Calendar, Building, CheckCircle, XCircle, Eye, Edit } from 'lucide-react';
import { useApp, Anganwadi } from '../context/AppContext';

const AnganwadiManagement: React.FC = () => {
  const { anganwadis, workers, t } = useApp();
  const [selectedAnganwadi, setSelectedAnganwadi] = useState<Anganwadi | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const getAnganwadiWorkers = (anganwadiId: string) => {
    return workers.filter(worker => worker.anganwadiId === anganwadiId && worker.isActive);
  };

  const AnganwadiDetailsModal = ({ anganwadi }: { anganwadi: Anganwadi }) => {
    const anganwadiWorkers = getAnganwadiWorkers(anganwadi.id);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{anganwadi.name}</h3>
                <p className="text-sm text-gray-600">Code: {anganwadi.code}</p>
              </div>
              <button
                onClick={() => setSelectedAnganwadi(null)}
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
                <h4 className="font-medium text-gray-900 mb-3">Location Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span>{anganwadi.location.area}, {anganwadi.location.district}</span>
                  </div>
                  <div><span className="font-medium">State:</span> {anganwadi.location.state}</div>
                  <div><span className="font-medium">Pincode:</span> {anganwadi.location.pincode}</div>
                  <div><span className="font-medium">Coordinates:</span> {anganwadi.location.coordinates.latitude}, {anganwadi.location.coordinates.longitude}</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Supervisor Information</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">{t('common.name')}:</span> {anganwadi.supervisor.name}</div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-green-600" />
                    <span>{anganwadi.supervisor.contactNumber}</span>
                  </div>
                  <div><span className="font-medium">Employee ID:</span> {anganwadi.supervisor.employeeId}</div>
                </div>
              </div>
            </div>

            {/* Capacity and Coverage */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Capacity</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-pink-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-pink-800">{anganwadi.capacity.pregnantWomen}</div>
                    <div className="text-sm text-pink-600">{t('ticket.pregnantWomen')}</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-blue-800">{anganwadi.capacity.children}</div>
                    <div className="text-sm text-blue-600">{t('ticket.children')}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Coverage Areas</h4>
                <div className="flex flex-wrap gap-2">
                  {(anganwadi.coverageAreas || []).map((area, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Facilities */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Facilities</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {anganwadi.facilities.map((facility, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-green-50 rounded-md">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-800">{facility}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Workers */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Assigned Workers ({anganwadiWorkers.length})</h4>
              <div className="space-y-3">
                {anganwadiWorkers.map(worker => (
                  <div key={worker.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{worker.name}</div>
                        <div className="text-sm text-gray-600">{t(`worker.${worker.role}`)} • {worker.employeeId}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{worker.contactNumber}</div>
                      <div className="text-xs text-gray-500">
                        {worker.workingHours.start} - {worker.workingHours.end}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Establishment</h4>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{new Date(anganwadi.establishedDate).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">{t('common.status')}</h4>
                <div className="flex items-center space-x-2">
                  {anganwadi.isActive ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`text-sm ${anganwadi.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {anganwadi.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
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
            <h2 className="text-2xl font-bold text-gray-900">{t('anganwadi.management')}</h2>
            <p className="text-gray-600">Manage Anganwadi centers and their operations</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Anganwadi</span>
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Building className="w-6 h-6 text-blue-600 mr-2" />
              <div>
                <p className="text-sm text-blue-600">Total Centers</p>
                <p className="text-2xl font-bold text-blue-800">{anganwadis.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
              <div>
                <p className="text-sm text-green-600">Active Centers</p>
                <p className="text-2xl font-bold text-green-800">
                  {anganwadis.filter(a => a.isActive).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-pink-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Users className="w-6 h-6 text-pink-600 mr-2" />
              <div>
                <p className="text-sm text-pink-600">Total Capacity (Pregnant)</p>
                <p className="text-2xl font-bold text-pink-800">
                  {anganwadis.reduce((sum, a) => sum + a.capacity.pregnantWomen, 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Users className="w-6 h-6 text-purple-600 mr-2" />
              <div>
                <p className="text-sm text-purple-600">Total Capacity (Children)</p>
                <p className="text-2xl font-bold text-purple-800">
                  {anganwadis.reduce((sum, a) => sum + a.capacity.children, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Anganwadi Centers List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {anganwadis.filter(Boolean).map(anganwadi => {
          const anganwadiWorkers = getAnganwadiWorkers(anganwadi.id);
          
          return (
            <div key={anganwadi.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{anganwadi.name}</h3>
                    <p className="text-sm text-gray-600">Code: {anganwadi.code}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {anganwadi.isActive ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <button
                    onClick={() => setSelectedAnganwadi(anganwadi)}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {/* Location */}
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    {anganwadi.location.area}, {anganwadi.location.district}, {anganwadi.location.state}
                  </span>
                </div>

                {/* Supervisor */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Supervisor</h4>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <div className="font-medium text-sm">{anganwadi.supervisor.name}</div>
                      <div className="text-xs text-gray-600">{anganwadi.supervisor.employeeId}</div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Phone className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-600">{anganwadi.supervisor.contactNumber}</span>
                    </div>
                  </div>
                </div>

                {/* Capacity */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Capacity</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-pink-50 p-2 rounded-md text-center">
                      <div className="text-lg font-bold text-pink-800">{anganwadi.capacity.pregnantWomen}</div>
                      <div className="text-xs text-pink-600">Pregnant Women</div>
                    </div>
                    <div className="bg-blue-50 p-2 rounded-md text-center">
                      <div className="text-lg font-bold text-blue-800">{anganwadi.capacity.children}</div>
                      <div className="text-xs text-blue-600">Children</div>
                    </div>
                  </div>
                </div>

                {/* Workers */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Workers ({anganwadiWorkers.length})</h4>
                  <div className="space-y-2">
                    {anganwadiWorkers.slice(0, 2).map(worker => (
                      <div key={worker.id} className="flex items-center justify-between text-sm">
                        <span className="font-medium">{worker.name}</span>
                        <span className="text-gray-600">{t(`worker.${worker.role}`)}</span>
                      </div>
                    ))}
                    {anganwadiWorkers.length > 2 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{anganwadiWorkers.length - 2} more workers
                      </div>
                    )}
                  </div>
                </div>

                {/* Coverage Areas */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Coverage Areas</h4>
                  <div className="flex flex-wrap gap-1">
                    {(Array.isArray(anganwadi.coverageAreas) ? anganwadi.coverageAreas : []).slice(0, 3).map((area, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        {area}
                      </span>
                    ))}
                    {((Array.isArray(anganwadi.coverageAreas) ? anganwadi.coverageAreas : []).length > 3) && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        +{((Array.isArray(anganwadi.coverageAreas) ? anganwadi.coverageAreas : []).length - 3)} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {selectedAnganwadi && <AnganwadiDetailsModal anganwadi={selectedAnganwadi} />}
    </div>
  );
};

export default AnganwadiManagement;