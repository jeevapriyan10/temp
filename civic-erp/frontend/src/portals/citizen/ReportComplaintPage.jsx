import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../components/Topbar';
import Button from '../../components/Button';
import useAuthStore from '../../store/authStore';
import api from '../../lib/api';
import { Send, Upload, X } from 'lucide-react';

export default function ReportComplaintPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [services, setServices] = useState([]);
  const [locations, setLocations] = useState([]);

  const [selectedDept, setSelectedDept] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [priority, setPriority] = useState('medium');
  const [description, setDescription] = useState('');
  const [photoBase64, setPhotoBase64] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.org_id) {
      api.get('/departments/', { params: { org_id: user.org_id } }).then(({ data }) => setDepartments(data));
      api.get('/services/').then(({ data }) => setServices(data));
      api.get('/locations/', { params: { org_id: user.org_id } }).then(({ data }) => setLocations(data));
    }
  }, [user?.org_id]);

  const filteredServices = services.filter((s) => !selectedDept || s.department_id === Number(selectedDept));

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedService) {
      alert('Please select a service');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/complaints/', {
        service_id: Number(selectedService),
        location_id: selectedLocation ? Number(selectedLocation) : (user?.working_area_location_id || locations[0]?.id || 1),
        description,
        photo_url: photoBase64 || null,
        priority,
      });
      alert('Complaint submitted successfully!');
      navigate('/citizen/track');
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Topbar title="Report Civic Issue" subtitle="File a new complaint or service request with your local government" />

      <div className="p-6 max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-xs animate-fadeIn text-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Department Dropdown */}
            <div>
              <label className="label-text">1. Department *</label>
              <select
                className="select-field"
                value={selectedDept}
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  setSelectedService('');
                }}
                required
              >
                <option value="">-- Select Department --</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Cascading Service Dropdown */}
            <div>
              <label className="label-text">2. Service Category *</label>
              <select
                className="select-field"
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                disabled={!selectedDept}
                required
              >
                <option value="">-- Select Service --</option>
                {filteredServices.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.default_priority} priority)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Location Dropdown */}
            <div>
              <label className="label-text">3. Location / Area</label>
              <select
                className="select-field"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                <option value="">-- Select Location --</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.type})
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Dropdown */}
            <div>
              <label className="label-text">4. Urgency Level</label>
              <select
                className="select-field"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">Low (Standard SLA)</option>
                <option value="medium">Medium (Regular SLA)</option>
                <option value="high">High (Urgent Attention)</option>
                <option value="critical">Critical (Immediate Hazard)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="label-text">5. Problem Description *</label>
            <textarea
              className="input-field h-32 resize-none"
              placeholder="Describe the issue in detail (location landmarks, severity, hazards)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="label-text">6. Photo Evidence (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="input-field text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
            {photoBase64 && (
              <div className="mt-3 relative w-32 h-32 rounded-xl overflow-hidden border border-slate-200 shadow-2xs">
                <img src={photoBase64} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotoBase64('')}
                  className="absolute top-1 right-1 bg-slate-900/80 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => navigate('/citizen')}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              <Send className="w-3.5 h-3.5" />
              {submitting ? 'Submitting...' : 'Submit Complaint'}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
