import { useEffect, useState } from 'react';
import { apiRequest } from '../services/api.js';

export default function AdminDashboard() {
  const [formData, setFormData] = useState({
    company: '',
    title: '',
    description: '',
    applyLink: '',
    deadlineDate: '',
    deadlineTime: '',
    type: 'Internship'
  });
  const [error, setError] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem('token');
        const data = await apiRequest('/jobs', 'GET', null, token);
        setJobs(data || []);
      } catch (err) {
        console.error('Failed to load jobs', err);
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchJobs();
  }, []);

  const toLocalDateTimeParts = (value) => {
    if (!value) return { deadlineDate: '', deadlineTime: '' };
    const date = new Date(value);
    const offsetMs = date.getTimezoneOffset() * 60 * 1000;
    const localIso = new Date(date.getTime() - offsetMs).toISOString();
    return {
      deadlineDate: localIso.slice(0, 10),
      deadlineTime: localIso.slice(11, 16)
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate all fields (trim whitespace for strings)
    if (!formData.company.trim() || !formData.title.trim() || !formData.applyLink.trim() || !formData.deadlineDate.trim() || !formData.deadlineTime.trim()) {
      const missing = [];
      if (!formData.company.trim()) missing.push('Company Name');
      if (!formData.title.trim()) missing.push('Job Title');
      if (!formData.applyLink.trim()) missing.push('Application Link');
      if (!formData.deadlineDate.trim()) missing.push('Available Until Date');
      if (!formData.deadlineTime.trim()) missing.push('Available Until Time');
      
      setError(`Please fill all required fields: ${missing.join(', ')}`);
      return;
    }

    const deadlineLocal = new Date(`${formData.deadlineDate}T${formData.deadlineTime}`);
    if (Number.isNaN(deadlineLocal.getTime())) {
      setError('Invalid availability date/time. Please recheck your entries.');
      return;
    }

    const { deadlineDate, deadlineTime, ...restForm } = formData;
    const payload = { ...restForm, deadline: deadlineLocal.toISOString() };

    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('No authentication token found. Please log in again.');
      return;
    }
    
    try {
      if (editingId) {
        // Update existing job
        const updatedJob = await apiRequest(`/jobs/${editingId}`, 'PUT', payload, token);
        alert("Opportunity updated successfully!");
        setJobs(prev => prev.map(job => job._id === editingId ? updatedJob : job));
        setEditingId(null);
      } else {
        // Create new job
        const newJob = await apiRequest('/jobs', 'POST', payload, token);
        alert("Opportunity posted successfully!");
        setJobs(prev => [newJob, ...prev]);
      }
      setFormData({
        company: '',
        title: '',
        description: '',
        applyLink: '',
        deadlineDate: '',
        deadlineTime: '',
        type: 'Internship'
      });
    } catch (err) {
      setError(err.message || `Failed to ${editingId ? 'update' : 'post'} job`);
    }
  };

  const handleEdit = (job) => {
    const { deadlineDate, deadlineTime } = toLocalDateTimeParts(job.deadline);
    setFormData({
      company: job.company,
      title: job.title,
      description: job.description || '',
      applyLink: job.applyLink,
      deadlineDate,
      deadlineTime,
      type: job.type || 'Internship'
    });
    setEditingId(job._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      company: '',
      title: '',
      description: '',
      applyLink: '',
      deadlineDate: '',
      deadlineTime: '',
      type: 'Internship'
    });
    setError('');
  };

  const handleDelete = async (jobId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found. Please log in again.');
      return;
    }
    if (!window.confirm('Delete this internship? This cannot be undone.')) {
      return;
    }
    try {
      await apiRequest(`/jobs/${jobId}`, 'DELETE', null, token);
      setJobs(prev => prev.filter(job => job._id !== jobId));
    } catch (err) {
      setError(err.message || 'Failed to delete job');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-semibold mb-1">{editingId ? 'Edit Opportunity' : 'Admin: Post Opportunity'}</h1>
        <p className="text-muted">{editingId ? 'Update opportunity details' : 'Create new internships, hackathons, and webinars'}</p>
      </div>
      
      {error && (
        <div className="p-4 bg-red-900/20 border border-red-900/50 text-red-300 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="card p-8 space-y-5">
        <div>
          <label htmlFor="company">Company Name</label>
          <input
            id="company"
            type="text" 
            required 
            className="field"
            value={formData.company}
            onChange={(e) => setFormData({...formData, company: e.target.value})}
            placeholder="e.g. Google"
          />
        </div>
        <div>
          <label htmlFor="title">Job Title</label>
          <input
            id="title" 
            type="text" 
            required 
            placeholder="e.g. SDE Intern" 
            className="field"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
        </div>
        <div>
          <label htmlFor="description">Job Description</label>
          <textarea
            id="description"
            rows={4}
            className="field"
            placeholder="Key responsibilities, requirements, and details..."
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </div>
        <div>
          <label htmlFor="applyLink">Application Link</label>
          <input
            id="applyLink" 
            type="url" 
            required 
            className="field"
            value={formData.applyLink}
            onChange={(e) => setFormData({...formData, applyLink: e.target.value})}
            placeholder="https://..."
          />
        </div>
        <div>
          <label>Available Until</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              id="deadlineDate" 
              type="date" 
              required 
              className="field"
              value={formData.deadlineDate}
              onChange={(e) => setFormData({ ...formData, deadlineDate: e.target.value })}
            />
            <input
              id="deadlineTime" 
              type="time" 
              required 
              className="field"
              value={formData.deadlineTime}
              onChange={(e) => setFormData({ ...formData, deadlineTime: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label htmlFor="type">Opportunity Type</label>
          <select
            id="type"
            className="field"
            value={formData.type}
            onChange={(e) => setFormData({...formData, type: e.target.value})}
          >
            <option value="Internship">Internship</option>
            <option value="Hackathon">Hackathon</option>
            <option value="Webinar">Webinar</option>
          </select>
        </div>
        <div className="flex gap-3">
          <button type="submit" className="btn-primary flex-1 py-3">
            {editingId ? 'Update Opportunity' : 'Post Opportunity'}
          </button>
          {editingId && (
            <button 
              type="button" 
              onClick={handleCancelEdit}
              className="btn-outline px-6 py-3"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Manage Opportunities</h2>
        {loadingJobs ? (
          <div className="text-center py-8">
            <div className="loading-spinner mx-auto mb-3"></div>
            <p className="text-muted">Loading opportunities...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-muted">No internships posted yet. Create your first one above!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map(job => (
              <div
                key={job._id}
                className="card p-5 flex flex-col md:flex-row md:items-start md:justify-between gap-4"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">{job.title}</h3>
                  <p className="text-muted text-sm mb-2">{job.company}</p>
                  <div className="flex gap-2">
                    <span className="chip text-xs">
                      {job.type || 'Internship'}
                    </span>
                    <span className="chip chip-neutral text-xs">
                      Available Until: {new Date(job.deadline).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(job)}
                    className="btn-outline px-4 py-2 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(job._id)}
                    className="btn-outline text-red-400 border-red-400 hover:bg-red-900/20 px-4 py-2 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}