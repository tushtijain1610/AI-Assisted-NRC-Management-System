import React, { useState } from 'react';
import { MapPin, Plus, Users, Phone, Calendar, Building, CheckCircle, XCircle, Eye, Edit } from 'lucide-react';
import { useApp, Anganwadi } from '../context/AppContext';

const CenterManagement: React.FC = () => {
  const { anganwadis, workers, addAnganwadi, t } = useApp();
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
                    <div className="text-sm text-pink-600">Pregnant Women</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-blue-800">{anganwadi.capacity.children}</div>
                    <div className="text-sm text-blue-600">Children</div>
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

  const AddAnganwadiForm = () => {
    const [formData, setFormData] = useState({
      name: '',
      code: '',
      locationArea: '',
      locationDistrict: '',
      locationState: '',
      locationPincode: '',
      latitude: '',
      longitude: '',
      supervisorName: '',
      supervisorContact: '',
      supervisorEmployeeId: '',
      capacityPregnantWomen: '',
      capacityChildren: '',
      facilities: '',
      coverageAreas: '',
      establishedDate: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      const newAnganwadi: Omit<Anganwadi, 'id'> = {
        name: formData.name,
        code: formData.code,
        location: {
          area: formData.locationArea,
          district: formData.locationDistrict,
          state: formData.locationState,
          pincode: formData.locationPincode,
          coordinates: {
            latitude: parseFloat(formData.latitude) || 0,
            longitude: parseFloat(formData.longitude) || 0,
          },
        },
        supervisor: {
          name: formData.supervisorName,
          contactNumber: formData.supervisorContact,
          employeeId: formData.supervisorEmployeeId,
        },
        capacity: {
          pregnantWomen: parseInt(formData.capacityPregnantWomen) || 0,
          children: parseInt(formData.capacityChildren) || 0,
        },
        facilities: formData.facilities.split(',').map(f => f.trim()).filter(f => f),
        coverageAreas: formData.coverageAreas.split(',').map(a => a.trim()).filter(a => a),
        establishedDate: formData.establishedDate,
        isActive: true,
      };

      addAnganwadi(newAnganwadi);
      setShowAddForm(false);
      setFormData({
        name: '',
        code: '',
        locationArea: '',
        locationDistrict: '',
        locationState: '',
        locationPincode: '',
        latitude: '',
        longitude: '',
        supervisorName: '',
        supervisorContact: '',
        supervisorEmployeeId: '',
        capacityPregnantWomen: '',
        capacityChildren: '',
        facilities: '',
        coverageAreas: '',
        establishedDate: '',
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Add New Anganwadi Center</h3>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Center Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Center Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="AWC001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Established Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.establishedDate}
                    onChange={(e) => setFormData({...formData, establishedDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Location Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Area *</label>
                  <input
                    type="text"
                    required
                    value={formData.locationArea}
                    onChange={(e) => setFormData({...formData, locationArea: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
                  <input
                    type="text"
                    required
                    value={formData.locationDistrict}
                    onChange={(e) => setFormData({...formData, locationDistrict: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={formData.locationState}
                    onChange={(e) => setFormData({...formData, locationState: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    value={formData.locationPincode}
                    onChange={(e) => setFormData({...formData, locationPincode: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.latitude}
                    onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.longitude}
                    onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Supervisor Information */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Supervisor Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supervisor Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.supervisorName}
                    onChange={(e) => setFormData({...formData, supervisorName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.supervisorContact}
                    onChange={(e) => setFormData({...formData, supervisorContact: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID *</label>
                  <input
                    type="text"
                    required
                    value={formData.supervisorEmployeeId}
                    onChange={(e) => setFormData({...formData, supervisorEmployeeId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Capacity Information */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Capacity Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pregnant Women Capacity *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.capacityPregnantWomen}
                    onChange={(e) => setFormData({...formData, capacityPregnantWomen: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Children Capacity *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.capacityChildren}
                    onChange={(e) => setFormData({...formData, capacityChildren: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Facilities and Coverage */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Facilities and Coverage</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Facilities (comma separated)</label>
                  <textarea
                    value={formData.facilities}
                    onChange={(e) => setFormData({...formData, facilities: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Kitchen, Playground, Medical Room, Toilet"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coverage Areas (comma separated) *</label>
                  <textarea
                    required
                    value={formData.coverageAreas}
                    onChange={(e) => setFormData({...formData, coverageAreas: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Area 1, Area 2, Area 3"
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
                Add Anganwadi Center
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
            <h2 className="text-2xl font-bold text-gray-900">Center Management</h2>
            <p className="text-gray-600">Manage Anganwadi centers and their operations</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Center</span>
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
        {anganwadis.map(anganwadi => {
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
                    {(anganwadi.coverageAreas || []).slice(0, 3).map((area, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        {area}
                      </span>
                    ))}
                    {(anganwadi.coverageAreas || []).length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        +{(anganwadi.coverageAreas || []).length - 3} more
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
      {showAddForm && <AddAnganwadiForm />}
    </div>
  );
};

export default CenterManagement;