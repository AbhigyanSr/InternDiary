import { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';

export default function Applications() {
  const [apps, setApps] = useState([]);
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    status: 'applied',
    notes: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState('applied');
  const [editNotes, setEditNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const editingApp = apps.find(app => app._id === editingId) || null;

  useEffect(() => {
  const fetchMyApps = async () => {
    const token = localStorage.getItem('token');
    try {
      const data = await apiRequest('/applications', 'GET', null, token);
      setApps(data);
    } catch (err) {
      console.error("Error loading applications", err);
    }
  };
  fetchMyApps();
}, []);

  const getStatusColor = (status) => {
    const key = (status || '').toLowerCase();
    const colors = {
      applied: 'chip-neutral',
      interviewing: 'chip-warning',
      offer: 'chip-success',
      rejected: 'chip-danger'
    };
    return colors[key] || 'chip-neutral';
  };

  const getStatusLabel = (status) => {
    const key = (status || '').toLowerCase();
    if (!key) return 'Applied';
    return key.charAt(0).toUpperCase() + key.slice(1);
  };

  const handleAddOpportunity = async (event) => {
    event.preventDefault();
    setError('');
    const token = localStorage.getItem('token');
    if (!formData.company.trim() || !formData.role.trim()) {
      setError('Company and role are required.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        company: formData.company.trim(),
        role: formData.role.trim(),
        status: formData.status,
        notes: formData.notes.trim() || undefined
      };
      const newApp = await apiRequest('/applications', 'POST', payload, token);
      setApps(prev => [newApp, ...prev]);
      setFormData({ company: '', role: '', status: 'applied', notes: '' });
    } catch (err) {
      setError(err.message || 'Failed to add opportunity');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (app) => {
    setEditingId(app._id);
    setEditStatus((app.status || 'applied').toLowerCase());
    setEditNotes(app.notes || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditStatus('applied');
    setEditNotes('');
  };

  const handleUpdate = async (appId) => {
    const token = localStorage.getItem('token');
    setUpdating(true);
    setError('');
    try {
      const payload = {
        status: editStatus,
        notes: editNotes.trim() || undefined
      };
      const updated = await apiRequest(`/applications/${appId}`, 'PATCH', payload, token);
      setApps(prev => prev.map(app => (app._id === appId ? updated : app)));
      cancelEdit();
    } catch (err) {
      setError(err.message || 'Failed to update application');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold mb-1">Application Tracker</h1>
          <p className="text-muted">Track any internship, even if it's not listed</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="btn-primary"
        >
          + Add Opportunity
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAddOpportunity}
          className="card p-6 space-y-5"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Add Opportunity</h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-muted hover:text-primary transition text-xl"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          {error && (
            <div className="bg-red-900/20 border border-red-900/50 text-red-300 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="company">Company</label>
              <input
                id="company"
                type="text"
                className="field"
                value={formData.company}
                onChange={(event) => setFormData({ ...formData, company: event.target.value })}
                placeholder="e.g. OpenAI"
              />
            </div>
            <div>
              <label htmlFor="role">Role</label>
              <input
                id="role"
                type="text"
                className="field"
                value={formData.role}
                onChange={(event) => setFormData({ ...formData, role: event.target.value })}
                placeholder="e.g. Frontend Intern"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="status">Status</label>
              <select
                id="status"
                className="field"
                value={formData.status}
                onChange={(event) => setFormData({ ...formData, status: event.target.value })}
              >
                <option value="applied">Applied</option>
                <option value="interviewing">Interviewing</option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label htmlFor="notes">Notes (optional)</label>
              <input
                id="notes"
                type="text"
                className="field"
                value={formData.notes}
                onChange={(event) => setFormData({ ...formData, notes: event.target.value })}
                placeholder="e.g. Applied via referral"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
            type="submit"
            disabled={saving}
            className="btn-primary"
            >
              {saving ? 'Saving...' : 'Add Opportunity'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      
      <div className="card overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {apps.map((app) => (
              <tr
                key={app._id}
                className="table-row cursor-pointer"
                onClick={() => startEdit(app)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    startEdit(app);
                  }
                }}
              >
                <td className="font-semibold">{app.company}</td>
                <td className="text-muted">{app.role}</td>
                <td>
                  <span className={`chip ${getStatusColor(app.status)}`}>
                    {getStatusLabel(app.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingApp && (
        <div
          className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center px-4"
          onClick={cancelEdit}
          role="presentation"
        >
          <div
            className="modal-content w-full max-w-lg card"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start justify-between p-6" style={{ borderBottom: '1px solid var(--border-separator)' }}>
              <div>
                <p className="text-xs text-muted uppercase tracking-wider mb-1">Application Details</p>
                <h3 className="text-xl font-semibold">{editingApp.company}</h3>
                <p className="text-sm text-muted">{editingApp.role}</p>
              </div>
              <button
                type="button"
                onClick={cancelEdit}
                className="text-muted hover:text-primary transition text-xl"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`chip ${getStatusColor(editingApp.status)}`}>
                  {getStatusLabel(editingApp.status)}
                </span>
                {editingApp.appliedDate && (
                  <span className="text-xs text-muted">
                    Applied: {new Date(editingApp.appliedDate).toLocaleDateString()}
                  </span>
                )}
              </div>
              <div>
                <label htmlFor="edit-status">Status</label>
                <select
                  id="edit-status"
                  className="field"
                  value={editStatus}
                  onChange={(event) => setEditStatus(event.target.value)}
                >
                  <option value="applied">Applied</option>
                  <option value="interviewing">Interviewing</option>
                  <option value="offer">Offer</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label htmlFor="edit-notes">Notes (optional)</label>
                <textarea
                  id="edit-notes"
                  rows={3}
                  className="field"
                  value={editNotes}
                  onChange={(event) => setEditNotes(event.target.value)}
                  placeholder="Add interview date, referral info, or reminders..."
                />
              </div>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdate(editingApp._id)}
                  disabled={updating}
                  className="btn-primary"
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}