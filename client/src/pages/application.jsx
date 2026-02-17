import { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';

export default function Applications() {
  const [apps, setApps] = useState([]);

  useEffect(() => {
    // Fetch user's applications from backend
    // apiRequest('/applications', 'GET', null, token).then(setApps);
    setApps([
      { _id: '1', company: 'Google', role: 'Frontend Intern', status: 'Interviewing' },
      { _id: '2', company: 'Meta', role: 'Product Intern', status: 'Applied' }
    ]);
  }, []);
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
    const colors = {
      'Applied': 'bg-blue-100 text-blue-800',
      'Interviewing': 'bg-yellow-100 text-yellow-800',
      'Offer': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100';
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Application Tracker</h1>
      
      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {apps.map((app) => (
              <tr key={app._id}>
                <td className="px-6 py-4 font-semibold text-gray-900">{app.company}</td>
                <td className="px-6 py-4 text-gray-600">{app.role}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">Update</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}