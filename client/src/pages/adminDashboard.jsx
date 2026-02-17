import { useState } from 'react';
import { apiRequest } from '../services/api';

export default function AdminDashboard() {
  const [formData, setFormData] = useState({
    company: '',
    title: '',
    applyLink: '',
    deadline: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Debug: Log what's in formData
    console.log('Form Data:', formData);
    console.log('Trimmed values:', {
      company: formData.company.trim(),
      title: formData.title.trim(),
      applyLink: formData.applyLink.trim(),
      deadline: formData.deadline.trim()
    });
    
    // Validate all fields (trim whitespace for strings)
    if (!formData.company.trim() || !formData.title.trim() || !formData.applyLink.trim() || !formData.deadline.trim()) {
      const missing = [];
      if (!formData.company.trim()) missing.push('Company Name');
      if (!formData.title.trim()) missing.push('Job Title');
      if (!formData.applyLink.trim()) missing.push('Application Link');
      if (!formData.deadline.trim()) missing.push('Last Date to Apply');
      
      setError(`Please fill all required fields: ${missing.join(', ')}`);
      return;
    }

    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token ? token.substring(0, 20) + '...' : 'NO TOKEN FOUND');
    
    if (!token) {
      setError('No authentication token found. Please log in again.');
      return;
    }
    
    try {
      await apiRequest('/jobs', 'POST', formData, token);
      alert("Internship posted successfully!");
      setFormData({ company: '', title: '', applyLink: '', deadline: '' });
    } catch (err) {
      setError(err.message || "Failed to post job");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Admin: Post Internship</h1>
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm space-y-4 border border-gray-100">
        <div>
          <label className="block text-sm font-medium text-gray-700">Company Name</label>
          <input 
            type="text" required className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={formData.company}
            onChange={(e) => setFormData({...formData, company: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Job Title</label>
          <input 
            type="text" required placeholder="e.g. SDE Intern" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Application Link</label>
          <input 
            type="url" required className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={formData.applyLink}
            onChange={(e) => setFormData({...formData, applyLink: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Last Date to Apply</label>
          <input 
            type="date" required className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={formData.deadline}
            onChange={(e) => setFormData({...formData, deadline: e.target.value})}
          />
        </div>
        <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition">
          Post Internship
        </button>
      </form>
    </div>
  );
}